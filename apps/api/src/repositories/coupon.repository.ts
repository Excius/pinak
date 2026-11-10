import { Prisma, PrismaClient } from "../generated/prisma/client.js";

type CreateCouponUsageInput = {
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
};

export class CouponRepository {
  constructor(private prisma: PrismaClient) {}

  private getDb(
    tx?: Prisma.TransactionClient,
  ): PrismaClient | Prisma.TransactionClient {
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

  /** Includes soft-deleted coupons: an order placed before deletion still counts. */
  async findByCodeIncludingDeleted(
    code: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.getDb(tx).coupon.findFirst({
      where: { code: { equals: code, mode: "insensitive" } },
    });
  }

  async findUsageByOrder(orderId: string, tx?: Prisma.TransactionClient) {
    return this.getDb(tx).couponUsage.findFirst({
      where: { oderId: orderId },
      select: { id: true },
    });
  }

  async countUserUsage(
    couponId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
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

  async createUsage(
    input: CreateCouponUsageInput,
    tx?: Prisma.TransactionClient,
  ) {
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

  // ── Admin CRUD ──────────────────────────────────────────────────────

  async listAdmin(
    opts: {
      page: number;
      limit: number;
      search?: string;
      isActive?: boolean;
      deleted: boolean;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    const where: Prisma.CouponWhereInput = {
      isDeleted: opts.deleted,
      ...(opts.isActive !== undefined ? { isActive: opts.isActive } : {}),
      ...(opts.search
        ? { code: { contains: opts.search, mode: "insensitive" } }
        : {}),
    };
    const [items, total] = await Promise.all([
      db.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (opts.page - 1) * opts.limit,
        take: opts.limit,
      }),
      db.coupon.count({ where }),
    ]);
    return { items, total };
  }

  /** Aggregated usage per coupon (redemptions, total discount, distinct users). */
  async getUsageStats(couponIds: string[], tx?: Prisma.TransactionClient) {
    const stats = new Map<
      string,
      { usageCount: number; totalDiscountGiven: number; uniqueUsers: number }
    >();
    if (couponIds.length === 0) return stats;

    const db = this.getDb(tx);
    const perUser = await db.couponUsage.groupBy({
      by: ["couponId", "userId"],
      where: { couponId: { in: couponIds } },
      _count: { _all: true },
      _sum: { discountAmount: true },
    });

    for (const row of perUser) {
      const entry = stats.get(row.couponId) ?? {
        usageCount: 0,
        totalDiscountGiven: 0,
        uniqueUsers: 0,
      };
      entry.usageCount += row._count._all;
      entry.totalDiscountGiven += row._sum.discountAmount ?? 0;
      entry.uniqueUsers += 1;
      stats.set(row.couponId, entry);
    }
    return stats;
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return this.getDb(tx).coupon.findUnique({ where: { id } });
  }

  async create(data: Prisma.CouponCreateInput, tx?: Prisma.TransactionClient) {
    return this.getDb(tx).coupon.create({ data });
  }

  async update(
    id: string,
    data: Prisma.CouponUpdateInput,
    tx?: Prisma.TransactionClient,
  ) {
    return this.getDb(tx).coupon.update({ where: { id }, data });
  }

  async hardDelete(id: string, tx?: Prisma.TransactionClient) {
    return this.getDb(tx).coupon.delete({ where: { id } });
  }
}
