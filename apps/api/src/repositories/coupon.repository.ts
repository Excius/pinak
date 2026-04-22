import { Prisma, PrismaClient } from "../generated/prisma/client.js";

type CreateCouponUsageInput = {
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
};

export class CouponRepository {
  constructor(private prisma: PrismaClient) {}

  private getDb(tx?: Prisma.TransactionClient): PrismaClient | Prisma.TransactionClient {
    return tx ?? this.prisma;
  }

  async findByCode(code: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.coupon.findFirst({
      where: {
        code: { equals: code, mode: "insensitive" },
        isDeleted: false,
      },
    });
  }

  async countUserUsage(couponId: string, userId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.couponUsage.count({
      where: { couponId, userId },
    });
  }

  async countTotalUsage(couponId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.couponUsage.count({
      where: { couponId },
    });
  }

  async createUsage(input: CreateCouponUsageInput, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.couponUsage.create({
      data: {
        couponId: input.couponId,
        userId: input.userId,
        oderId: input.orderId,
        discountAmount: input.discountAmount,
      },
    });
  }
}
