import { Prisma } from "../generated/prisma/client.js";
import { ConflictError, NotFoundError, ValidationError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import { CouponRepository } from "../repositories/coupon.repository.js";

export type CouponValidationResult = {
  valid: true;
  discountAmount: number;
  coupon: {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
    minOrderValue: number | null;
    maxDiscountValue: number | null;
    maxTotalUsers: number | null;
    maxUsesPerUser: number | null;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
  };
};

export class CouponService {
  constructor(private couponRepository: CouponRepository) {}

  private normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  toPublicCoupon(coupon: any) {
    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue ?? coupon.minOderValue,
      maxDiscountValue: coupon.maxDiscountValue,
    };
  }

  toAdminCoupon(coupon: any) {
    return {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue ?? coupon.minOderValue,
      maxDiscountValue: coupon.maxDiscountValue,
      maxTotalUsers: coupon.maxTotalUsers,
      maxUsesPerUser: coupon.maxUsesPerUser,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      isActive: coupon.isActive,
    };
  }

  async validateCoupon(
    code: string,
    userId: string,
    cartTotal: number,
    tx?: Prisma.TransactionClient,
  ): Promise<CouponValidationResult> {
    if (cartTotal < 0) {
      throw new ValidationError("cartTotal must be greater than or equal to 0");
    }

    const normalizedCode = this.normalizeCode(code);
    const coupon = await this.couponRepository.findByCode(normalizedCode, tx);

    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    if (!coupon.isActive) {
      throw new ValidationError("Coupon is inactive");
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw new ValidationError("Coupon is not active yet");
    }
    if (coupon.validUntil < now) {
      throw new ValidationError("Coupon has expired");
    }

    if (coupon.minOderValue !== null && cartTotal < coupon.minOderValue) {
      throw new ValidationError(
        `Minimum order value ₹${coupon.minOderValue / 100} is required`,
      );
    }

    if (coupon.maxTotalUsers !== null) {
      const totalUsage = await this.couponRepository.countTotalUsage(
        coupon.id,
        tx,
      );
      if (totalUsage >= coupon.maxTotalUsers) {
        throw new ValidationError("Coupon usage limit exceeded");
      }
    }

    if (coupon.maxUsesPerUser !== null) {
      const userUsage = await this.couponRepository.countUserUsage(
        coupon.id,
        userId,
        tx,
      );
      if (userUsage >= coupon.maxUsesPerUser) {
        throw new ValidationError(
          "You have reached the usage limit for this coupon",
        );
      }
    }

    let discountAmount =
      coupon.discountType === "PERCENTAGE"
        ? Math.floor((cartTotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (
      coupon.maxDiscountValue !== null &&
      Number.isFinite(coupon.maxDiscountValue)
    ) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
    }

    discountAmount = Math.max(0, Math.min(discountAmount, cartTotal));

    return {
      valid: true,
      discountAmount,
      coupon: this.toAdminCoupon(coupon),
    };
  }

  async getCoupon(code: string, activeOnly = false) {
    const normalizedCode = this.normalizeCode(code);
    const coupon = await this.couponRepository.findByCode(normalizedCode);
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    if (activeOnly && !coupon.isActive) {
      throw new NotFoundError("Coupon not found");
    }

    return this.toAdminCoupon(coupon);
  }

  /**
   * Records the coupon redemption for an order whose payment just succeeded.
   * Idempotent per order. The discount was already validated and applied when the
   * order was created, so limits are not re-enforced here: the customer has paid
   * the discounted price and the discount is honoured.
   */
  async recordUsageForOrder(
    order: {
      id: string;
      userId: string;
      couponcode: string | null;
      couponDiscount: number;
    },
    tx?: Prisma.TransactionClient,
  ) {
    if (!order.couponcode || order.couponDiscount <= 0) return;

    if (await this.couponRepository.findUsageByOrder(order.id, tx)) return;

    const coupon = await this.couponRepository.findByCodeIncludingDeleted(
      order.couponcode,
      tx,
    );
    if (!coupon) return;

    await this.couponRepository.createUsage(
      {
        couponId: coupon.id,
        userId: order.userId,
        orderId: order.id,
        discountAmount: order.couponDiscount,
      },
      tx,
    );
  }

  // ── Admin CRUD ──────────────────────────────────────────────────────

  private assertCouponRules(c: {
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
    validFrom: Date;
    validUntil: Date;
  }) {
    if (c.discountType === "PERCENTAGE" && c.discountValue > 100) {
      throw new ValidationError("Percentage discount cannot exceed 100");
    }
    if (c.validUntil <= c.validFrom) {
      throw new ValidationError("validUntil must be after validFrom");
    }
  }

  async listCouponsAdmin(query: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: string;
    deleted?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.couponRepository.listAdmin({
      page,
      limit,
      search: query.search || undefined,
      isActive:
        query.isActive === undefined ? undefined : query.isActive === "true",
      deleted: query.deleted === "true",
    });
    const stats = await this.couponRepository.getUsageStats(
      items.map((c) => c.id),
    );
    return {
      items: items.map((c) => ({
        ...c,
        usageCount: stats.get(c.id)?.usageCount ?? 0,
        totalDiscountGiven: stats.get(c.id)?.totalDiscountGiven ?? 0,
        uniqueUsers: stats.get(c.id)?.uniqueUsers ?? 0,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  private async getCouponByIdOrThrow(id: string) {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }
    return coupon;
  }

  async createCouponAdmin(data: {
    code: string;
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
    minOderValue: number | null;
    maxDiscountValue: number | null;
    validFrom: Date;
    validUntil: Date;
    maxTotalUsers: number | null;
    maxUsesPerUser: number | null;
    isActive: boolean;
  }) {
    this.assertCouponRules(data);
    try {
      return await this.couponRepository.create(data);
    } catch (err) {
      if (isPrismaP2002(err)) {
        throw new ConflictError("A coupon with this code already exists");
      }
      throw err;
    }
  }

  async updateCouponAdmin(
    id: string,
    data: Partial<{
      code: string;
      discountType: "PERCENTAGE" | "FLAT";
      discountValue: number;
      minOderValue: number | null;
      maxDiscountValue: number | null;
      validFrom: Date;
      validUntil: Date;
      maxTotalUsers: number | null;
      maxUsesPerUser: number | null;
      isActive: boolean;
    }>,
  ) {
    const existing = await this.getCouponByIdOrThrow(id);
    this.assertCouponRules({
      discountType: data.discountType ?? existing.discountType,
      discountValue: data.discountValue ?? existing.discountValue,
      validFrom: data.validFrom ?? existing.validFrom,
      validUntil: data.validUntil ?? existing.validUntil,
    });
    try {
      return await this.couponRepository.update(id, data);
    } catch (err) {
      if (isPrismaP2002(err)) {
        throw new ConflictError("A coupon with this code already exists");
      }
      throw err;
    }
  }

  async setCouponActiveAdmin(id: string, isActive: boolean) {
    await this.getCouponByIdOrThrow(id);
    return this.couponRepository.update(id, { isActive });
  }

  async softDeleteCouponAdmin(id: string) {
    await this.getCouponByIdOrThrow(id);
    await this.couponRepository.update(id, {
      isDeleted: true,
      isActive: false,
    });
  }

  async restoreCouponAdmin(id: string) {
    await this.getCouponByIdOrThrow(id);
    await this.couponRepository.update(id, { isDeleted: false });
  }

  async hardDeleteCouponAdmin(id: string) {
    await this.getCouponByIdOrThrow(id);
    try {
      await this.couponRepository.hardDelete(id);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        (err as { code?: unknown }).code === "P2003"
      ) {
        throw new ConflictError(
          "This coupon has been used on orders and cannot be permanently deleted. Deactivate or archive it instead.",
        );
      }
      throw err;
    }
  }
}
