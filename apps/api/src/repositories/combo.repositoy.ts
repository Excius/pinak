import { PrismaClient, Prisma } from "../generated/prisma/client.js";

export class ComboRepository {
  constructor(private prisma: PrismaClient) {}

  get prismaClient() {
    return this.prisma;
  }

  getComboKits(pagination: {
    page: number;
    limit: number;
    isActive?: boolean;
  }) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const where: Prisma.ComboKitWhereInput = {
      isDeleted: false,
      ...(pagination.isActive !== undefined && {
        isActive: pagination.isActive,
      }),
    };

    return this.prisma.$transaction(async (tx) => {
      const [kits, total] = await Promise.all([
        tx.comboKit.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { items: { include: { productVariant: true } } },
        }),
        tx.comboKit.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);
      return {
        data: kits,
        pagination: {
          page: pagination.page,
          limit: take,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      };
    });
  }

  getComboKitById(id: string) {
    return this.prisma.comboKit.findFirst({
      where: { id, isDeleted: false },
      include: {
        items: { include: { productVariant: { include: { images: true } } } },
      },
    });
  }

  getComboKitBySlug(slug: string) {
    return this.prisma.comboKit.findFirst({
      where: { slug, isDeleted: false },
      include: { items: { include: { productVariant: true } } },
    });
  }

  createComboKit(data: Prisma.ComboKitCreateInput) {
    return this.prisma.comboKit.create({ data, include: { items: true } });
  }

  updateComboKit(id: string, data: Prisma.ComboKitUpdateInput) {
    return this.prisma.comboKit.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  addComboKitItem(comboKitId: string, data: Prisma.ComboKitItemCreateInput) {
    // associate to combo kit via comboKitId on create
    return this.prisma.comboKitItem.create({ data });
  }

  removeComboKitItem(itemId: string) {
    return this.prisma.comboKitItem.delete({ where: { id: itemId } });
  }

  softDeleteComboKit(id: string) {
    return this.prisma.comboKit.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restoreComboKit(id: string) {
    return this.prisma.comboKit.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  hardDeleteComboKit(id: string) {
    return this.prisma.comboKit.delete({ where: { id } });
  }

  // helper dependency checks
  async countComboKitReferences(id: string) {
    const [cartCount, orderCount] = await Promise.all([
      this.prisma.cartItem.count({ where: { comboKitId: id } }),
      this.prisma.orderItem.count({
        where: {
          comboKitId: id,
          order: { isDeleted: false, status: { not: "CANCELLED" } },
        },
      }),
    ]);

    return { cartCount, orderCount };
  }
}
