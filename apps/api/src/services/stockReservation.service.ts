import { Prisma, PrismaClient } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";
import redis from "../lib/redis.js";

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

  private async getRedisReservedQuantity(key: string): Promise<number> {
    const now = Date.now();
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now);
    pipeline.zrange(key, "0", "-1");
    
    const results = await pipeline.exec();
    if (!results || results.length < 2) return 0;
    
    const members = (results[1]?.[1] as string[]) || [];
    let total = 0;
    for (const member of members) {
      const parts = member.split("|");
      if (parts.length === 2 && parts[1]) {
        total += parseInt(parts[1], 10) || 0;
      }
    }
    return total;
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

    // Direct active reservations for this variant in Redis
    const directReserved = await this.getRedisReservedQuantity(`reservations:variant:${productVariantId}`);

    // Active reservations for combos that include this variant
    const combosWithVariant = await db.comboKitItem.findMany({
      where: { productVariantId },
      select: { comboKitId: true, quantity: true }
    });

    let comboReserved = 0;
    for (const comboItem of combosWithVariant) {
      const comboQtyReserved = await this.getRedisReservedQuantity(`reservations:combo:${comboItem.comboKitId}`);
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

    // Validate the aggregated variant requirements against Redis+Postgres stock
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

    const expiresAtMs = Date.now() + this.reservationDurationMs;
    const expiresAt = new Date(expiresAtMs);

    // Save reservations to Redis
    const pipeline = redis.pipeline();
    pipeline.setex(`reservations:order:${orderId}`, Math.ceil(this.reservationDurationMs / 1000), JSON.stringify(normalizedRequirements));

    for (const req of normalizedRequirements) {
      const member = `${orderId}|${req.quantity}`;
      const ttlSeconds = Math.ceil(this.reservationDurationMs / 1000);
      if (req.productVariantId) {
        const key = `reservations:variant:${req.productVariantId}`;
        pipeline.zadd(key, expiresAtMs, member);
        pipeline.expire(key, ttlSeconds);
      } else if (req.comboKitId) {
        const key = `reservations:combo:${req.comboKitId}`;
        pipeline.zadd(key, expiresAtMs, member);
        pipeline.expire(key, ttlSeconds);
      }
    }

    await pipeline.exec();

    return {
      expiresAt,
      reservations: normalizedRequirements,
    };
  }

  async confirmReservations(orderId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    
    // Fetch active reservations from Redis
    const orderData = await redis.get(`reservations:order:${orderId}`);
    if (!orderData) {
      throw new NotFoundError("No active reservations found for this order");
    }

    const activeReservations = JSON.parse(orderData) as ReservationRequirement[];

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

    // Cleanup Redis keys
    const pipeline = redis.pipeline();
    pipeline.del(`reservations:order:${orderId}`);
    for (const req of activeReservations) {
      const member = `${orderId}|${req.quantity}`;
      if (req.productVariantId) {
        pipeline.zrem(`reservations:variant:${req.productVariantId}`, member);
      } else if (req.comboKitId) {
        pipeline.zrem(`reservations:combo:${req.comboKitId}`, member);
      }
    }
    await pipeline.exec();
  }

  async releaseReservations(orderId: string, _tx?: Prisma.TransactionClient) {
    const orderData = await redis.get(`reservations:order:${orderId}`);
    if (!orderData) return 0;

    const activeReservations = JSON.parse(orderData) as ReservationRequirement[];
    
    // Cleanup Redis keys
    const pipeline = redis.pipeline();
    pipeline.del(`reservations:order:${orderId}`);
    for (const req of activeReservations) {
      const member = `${orderId}|${req.quantity}`;
      if (req.productVariantId) {
        pipeline.zrem(`reservations:variant:${req.productVariantId}`, member);
      } else if (req.comboKitId) {
        pipeline.zrem(`reservations:combo:${req.comboKitId}`, member);
      }
    }
    await pipeline.exec();

    return activeReservations.length;
  }

  // Obsolete function kept for compatibility if needed, but it does nothing now
  // since Redis handles expiration automatically via TTLs and ZSET score removal.
  async cleanupExpiredReservations() {
    return 0;
  }
}
