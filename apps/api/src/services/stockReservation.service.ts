import { Prisma, PrismaClient, ReservationStatus } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";

export type ReservationRequirement = {
  productVariantId?: string | null;
  comboKitId?: string | null;
  quantity: number;
};

export class StockReservationService {
  private readonly reservationDurationMs = 15 * 60 * 1000; // 15 minutes

  constructor(private prisma: PrismaClient) {}

  private getDb(tx?: Prisma.TransactionClient): PrismaClient | Prisma.TransactionClient {
    return tx ?? this.prisma;
  }

  private aggregateRequirements(
    requirements: ReservationRequirement[],
  ): ReservationRequirement[] {
    const aggregatedVariants = new Map<string, number>();
    const aggregatedCombos = new Map<string, number>();

    for (const req of requirements) {
      if (req.productVariantId) {
        const current = aggregatedVariants.get(req.productVariantId) ?? 0;
        aggregatedVariants.set(req.productVariantId, current + req.quantity);
      } else if (req.comboKitId) {
        const current = aggregatedCombos.get(req.comboKitId) ?? 0;
        aggregatedCombos.set(req.comboKitId, current + req.quantity);
      }
    }

    const result: ReservationRequirement[] = [];
    for (const [productVariantId, quantity] of aggregatedVariants.entries()) {
      result.push({ productVariantId, quantity, comboKitId: null });
    }
    for (const [comboKitId, quantity] of aggregatedCombos.entries()) {
      result.push({ comboKitId, quantity, productVariantId: null });
    }
    return result;
  }

  private reservationExpiryDate() {
    return new Date(Date.now() + this.reservationDurationMs);
  }

  async getAvailableStockForVariant(
    productVariantId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = this.getDb(tx);
    const variant = await db.productVariant.findFirst({
      where: {
        id: productVariantId,
        isDeleted: false,
        isActive: true,
        product: {
          isDeleted: false,
          isActive: true,
        },
      },
      select: {
        stock: true,
      },
    });

    if (!variant) {
      return 0;
    }

    // Direct active reservations for this variant
    const activeReservedDirect = await db.inventoryReservation.aggregate({
      where: {
        productVariantId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      _sum: {
        quantity: true,
      },
    });

    const directReserved = activeReservedDirect._sum.quantity ?? 0;

    // Active reservations for combos that include this variant
    // We need to find all combos containing this variant, and see how many of those combos are reserved.
    const combosWithVariant = await db.comboKitItem.findMany({
      where: { productVariantId },
      select: { comboKitId: true, quantity: true }
    });

    let comboReserved = 0;
    for (const comboItem of combosWithVariant) {
      const activeReservedCombo = await db.inventoryReservation.aggregate({
        where: {
          comboKitId: comboItem.comboKitId,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: new Date() },
        },
        _sum: {
          quantity: true,
        },
      });
      const comboQtyReserved = activeReservedCombo._sum.quantity ?? 0;
      comboReserved += (comboQtyReserved * comboItem.quantity);
    }

    return Math.max(0, variant.stock - directReserved - comboReserved);
  }

  async getAvailableStockForCombo(comboKitId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    const comboKit = await db.comboKit.findFirst({
      where: {
        id: comboKitId,
        isDeleted: false,
        isActive: true,
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  select: {
                    isActive: true,
                    isDeleted: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comboKit || comboKit.items.length === 0) {
      return 0;
    }

    let available = Number.POSITIVE_INFINITY;

    for (const item of comboKit.items) {
      const variant = item.productVariant;
      if (
        !variant ||
        variant.isDeleted ||
        !variant.isActive ||
        variant.product.isDeleted ||
        !variant.product.isActive
      ) {
        return 0;
      }

      // getAvailableStockForVariant already subtracts existing direct and combo reservations!
      const variantAvailable = await this.getAvailableStockForVariant(
        variant.id,
        tx,
      );
      const comboUnitsForVariant =
        item.quantity > 0 ? Math.floor(variantAvailable / item.quantity) : 0;
      available = Math.min(available, comboUnitsForVariant);
    }

    if (!Number.isFinite(available)) {
      return 0;
    }

    return Math.max(0, available);
  }

  async createReservations(
    orderId: string,
    requirements: ReservationRequirement[],
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    const normalizedRequirements = this.aggregateRequirements(
      requirements.filter((item) => item.quantity > 0),
    );

    if (normalizedRequirements.length === 0) {
      throw new ValidationError("No reservation items provided");
    }

    // To avoid over-promising stock when multiple items share the same variants (direct + combos),
    // we aggregate ALL variant requirements into a single check-map.
    const totalVariantCheckMap = new Map<string, number>();

    for (const requirement of normalizedRequirements) {
      if (requirement.productVariantId) {
        const current = totalVariantCheckMap.get(requirement.productVariantId) ?? 0;
        totalVariantCheckMap.set(requirement.productVariantId, current + requirement.quantity);
      } else if (requirement.comboKitId) {
        const comboItems = await db.comboKitItem.findMany({
          where: { comboKitId: requirement.comboKitId },
        });
        for (const item of comboItems) {
          const needed = item.quantity * requirement.quantity;
          const current = totalVariantCheckMap.get(item.productVariantId) ?? 0;
          totalVariantCheckMap.set(item.productVariantId, current + needed);
        }
      }
    }

    // Now validate the aggregated variant requirements
    for (const [variantId, totalQuantity] of totalVariantCheckMap.entries()) {
      const available = await this.getAvailableStockForVariant(variantId, tx);
      if (totalQuantity > available) {
        throw new ValidationError("Insufficient stock for reservation", [
          {
            field: "variantId",
            message: variantId,
          },
          {
            field: "quantity",
            message: `Total requested ${totalQuantity}, available ${available}`,
          },
        ]);
      }
    }

    const expiresAt = this.reservationExpiryDate();

    await db.inventoryReservation.createMany({
      data: normalizedRequirements.map((requirement) => ({
        orderId,
        productVariantId: requirement.productVariantId || null,
        comboKitId: requirement.comboKitId || null,
        quantity: requirement.quantity,
        status: ReservationStatus.ACTIVE,
        expiresAt,
      })),
    });

    return {
      expiresAt,
      reservations: normalizedRequirements,
    };
  }

  async confirmReservations(orderId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    const activeReservations = await db.inventoryReservation.findMany({
      where: {
        orderId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeReservations.length === 0) {
      throw new NotFoundError("No active reservations found for this order");
    }

    // We must deduct the actual stock. For variants it's direct. For combos, we deduct component variants.
    const variantDeductions = new Map<string, number>();

    for (const reservation of activeReservations) {
      if (reservation.productVariantId) {
        const current = variantDeductions.get(reservation.productVariantId) ?? 0;
        variantDeductions.set(reservation.productVariantId, current + reservation.quantity);
      } else if (reservation.comboKitId) {
        const comboItems = await db.comboKitItem.findMany({
          where: { comboKitId: reservation.comboKitId }
        });
        for (const item of comboItems) {
          const deductionQty = item.quantity * reservation.quantity;
          const current = variantDeductions.get(item.productVariantId) ?? 0;
          variantDeductions.set(item.productVariantId, current + deductionQty);
        }
      }
    }

    for (const [variantId, totalToDeduct] of variantDeductions.entries()) {
      const result = await db.productVariant.updateMany({
        where: { id: variantId, stock: { gte: totalToDeduct } },
        data: { stock: { decrement: totalToDeduct } },
      });

      if (result.count === 0) {
        throw new ValidationError(
          "Unable to confirm reservation due to insufficient actual stock",
          [
            {
              field: "variantId",
              message: variantId,
            },
          ],
        );
      }
    }

    await db.inventoryReservation.updateMany({
      where: {
        orderId,
        status: ReservationStatus.ACTIVE
      },
      data: {
        status: ReservationStatus.CONFIRMED
      }
    });
  }

  async releaseReservations(orderId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    const result = await db.inventoryReservation.updateMany({
      where: { 
        orderId,
        status: ReservationStatus.ACTIVE
      },
      data: {
        status: ReservationStatus.RELEASED
      }
    });

    return result.count;
  }

  async cleanupExpiredReservations() {
    const result = await this.prisma.inventoryReservation.updateMany({
      where: {
        status: ReservationStatus.ACTIVE,
        expiresAt: { lt: new Date() },
      },
      data: {
        status: ReservationStatus.RELEASED
      }
    });

    return result.count;
  }
}
