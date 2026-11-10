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

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return this.getDb(tx).coupon.findUnique({ where: { id } });
  }

  async create(
    data: Prisma.CouponCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
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
