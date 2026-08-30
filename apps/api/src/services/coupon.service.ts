import { Prisma } from "../generated/prisma/client.js";
import { NotFoundError, ValidationError } from "../lib/error.js";
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
        `Minimum order value ₹${coupon.minOderValue} is required`,
      );
    }

    if (coupon.maxTotalUsers !== null) {
      const totalUsage = await this.couponRepository.countTotalUsage(coupon.id, tx);
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
        throw new ValidationError("You have reached the usage limit for this coupon");
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

  async applyCoupon(
    orderId: string,
    couponCode: string,
    userId: string,
    cartTotal: number,
    tx?: Prisma.TransactionClient,
  ) {
    const validation = await this.validateCoupon(couponCode, userId, cartTotal, tx);
    await this.couponRepository.createUsage(
      {
        couponId: validation.coupon.id,
        userId,
        orderId,
        discountAmount: validation.discountAmount,
      },
      tx,
    );

    return validation;
  }
}
