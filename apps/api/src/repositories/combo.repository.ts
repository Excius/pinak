import { Prisma, PrismaClient } from "../generated/prisma/client.js";

type ComboKitSortBy =
  | "createdAt"
  | "updatedAt"
  | "price"
  | "sortOrder"
  | "viewCount"
  | "purchasedCount";

type SortOrder = "asc" | "desc";

export type ComboKitListFilters = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ComboKitSortBy;
  sortOrder?: SortOrder;
};

type ComboKitItemCreateInput = {
  productVariantId: string;
  quantity: number;
  sortOrder: number;
  originalPrice?: number;
  discountedPrice?: number;
  isRequired: boolean;
};

export type ComboKitItemUpdateInput = {
  quantity?: number;
  sortOrder?: number;
  originalPrice?: number;
  discountedPrice?: number;
  isRequired?: boolean;
};

const comboKitInclude = {
  items: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      productVariant: {
        include: {
          images: {
            where: { isDeleted: false },
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          },
          optionValues: {
            include: {
              optionValue: {
                include: {
                  option: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ComboKitInclude;

export class ComboRepository {
  constructor(private prisma: PrismaClient) {}

  get prismaClient() {
    return this.prisma;
  }

  private buildWhere(filters: ComboKitListFilters): Prisma.ComboKitWhereInput {
    const where: Prisma.ComboKitWhereInput = {};

    if (filters.onlyDeleted) {
      where.isDeleted = true;
    } else if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { audience: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      };
    }

    return where;
  }

  private buildOrderBy(
    filters: ComboKitListFilters,
  ): Prisma.ComboKitOrderByWithRelationInput {
    const sortBy = filters.sortBy ?? "createdAt";
    const sortOrder = filters.sortOrder ?? "desc";
    return { [sortBy]: sortOrder };
  }

  async getComboKits(filters: ComboKitListFilters) {
    const page = Math.max(1, filters.page);
    const limit = Math.max(1, filters.limit);
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filters);
    const orderBy = this.buildOrderBy(filters);

    const [kits, total] = await this.prisma.$transaction([
      this.prisma.comboKit.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: comboKitInclude,
      }),
      this.prisma.comboKit.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: kits,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  getComboKitById(id: string, includeDeleted = false) {
    return this.prisma.comboKit.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: comboKitInclude,
    });
  }

  getComboKitBySlug(slug: string) {
    return this.prisma.comboKit.findFirst({
      where: {
        slug,
        isDeleted: false,
        isActive: true,
      },
      include: comboKitInclude,
    });
  }

  getComboKitItems(comboKitId: string) {
    return this.prisma.comboKitItem.findMany({
      where: { comboKitId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                taxClass: true,
              },
            },
            images: {
              where: { isDeleted: false },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            },
            optionValues: {
              include: {
                optionValue: {
                  include: {
                    option: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  createComboKit(data: Prisma.ComboKitCreateInput) {
    return this.prisma.comboKit.create({
      data,
      include: comboKitInclude,
    });
  }

  updateComboKit(id: string, data: Prisma.ComboKitUpdateInput) {
    return this.prisma.comboKit.update({
      where: { id },
      data,
      include: comboKitInclude,
    });
  }

  updateComboKitStatus(id: string, isActive: boolean) {
    return this.prisma.comboKit.update({
      where: { id },
      data: { isActive },
      include: comboKitInclude,
    });
  }

  updateComboKitPricing(
    id: string,
    data: Pick<
      Prisma.ComboKitUpdateInput,
      "price" | "pricingStrategy" | "discountType" | "discountValue"
    >,
  ) {
    return this.prisma.comboKit.update({
      where: { id },
      data,
      include: comboKitInclude,
    });
  }

  updateComboKitMetadata(
    id: string,
    data: Pick<
      Prisma.ComboKitUpdateInput,
      | "metaTitle"
      | "metaDescription"
      | "metaKeywords"
      | "seoKeyword"
      | "tags"
      | "imageUrl"
      | "sortOrder"
    >,
  ) {
    return this.prisma.comboKit.update({
      where: { id },
      data,
      include: comboKitInclude,
    });
  }

  async addComboKitItem(comboKitId: string, data: ComboKitItemCreateInput) {
    return this.prisma.comboKitItem.create({
      data: {
        comboKit: { connect: { id: comboKitId } },
        productVariant: { connect: { id: data.productVariantId } },
        quantity: data.quantity,
        sortOrder: data.sortOrder,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        isRequired: data.isRequired,
      },
      include: {
        productVariant: true,
      },
    });
  }

  updateComboKitItem(itemId: string, data: ComboKitItemUpdateInput) {
    return this.prisma.comboKitItem.update({
      where: { id: itemId },
      data,
      include: {
        productVariant: true,
      },
    });
  }

  removeComboKitItem(itemId: string) {
    return this.prisma.comboKitItem.delete({ where: { id: itemId } });
  }

  async reorderComboKitItems(
    comboKitId: string,
    items: Array<{ id: string; sortOrder: number }>,
  ) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.comboKitItem.updateMany({
          where: {
            id: item.id,
            comboKitId,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        }),
      ),
    );

    return this.getComboKitItems(comboKitId);
  }

  async bulkSetComboKitItems(
    comboKitId: string,
    items: ComboKitItemCreateInput[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.comboKitItem.deleteMany({ where: { comboKitId } });
      if (items.length > 0) {
        await tx.comboKitItem.createMany({
          data: items.map((item) => ({
            comboKitId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            sortOrder: item.sortOrder,
            originalPrice: item.originalPrice,
            discountedPrice: item.discountedPrice,
            isRequired: item.isRequired,
          })),
        });
      }

      return tx.comboKitItem.findMany({
        where: { comboKitId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: { productVariant: true },
      });
    });
  }

  softDeleteComboKit(id: string) {
    return this.prisma.comboKit.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
  }

  restoreComboKit(id: string) {
    return this.prisma.comboKit.update({
      where: { id },
      data: { isDeleted: false },
      include: comboKitInclude,
    });
  }

  hardDeleteComboKit(id: string) {
    return this.prisma.comboKit.delete({ where: { id } });
  }

  incrementComboKitViewCount(id: string) {
    return this.prisma.comboKit.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  incrementComboKitPurchasedCount(id: string, quantity: number) {
    return this.prisma.comboKit.update({
      where: { id },
      data: {
        purchasedCount: {
          increment: quantity,
        },
      },
    });
  }

  findProductVariantById(id: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        price: true,
      },
    });
  }

  getComboKitItemById(itemId: string) {
    return this.prisma.comboKitItem.findUnique({
      where: { id: itemId },
    });
  }

  async countComboKitReferences(id: string) {
    const [cartCount, orderCount] = await Promise.all([
      this.prisma.cartItem.count({ where: { comboKitId: id } }),
      this.prisma.orderItem.count({
        where: {
          comboKitId: id,
          order: {
            isDeleted: false,
            status: { not: "CANCELLED" },
          },
        },
      }),
    ]);

    return {
      cartCount,
      orderCount,
    };
  }

  async getComboKitAnalytics(id: string) {
    const [comboKit, orderAgg, cartCount] = await Promise.all([
      this.prisma.comboKit.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          viewCount: true,
          purchasedCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      this.prisma.orderItem.aggregate({
        where: {
          comboKitId: id,
          order: {
            isDeleted: false,
          },
        },
        _sum: {
          quantity: true,
          price: true,
        },
        _count: {
          id: true,
        },
      }),
      this.prisma.cartItem.count({ where: { comboKitId: id } }),
    ]);

    return {
      comboKit,
      orders: {
        orderItemCount: orderAgg._count.id,
        totalUnitsSold: orderAgg._sum.quantity ?? 0,
        grossSalesAmount: orderAgg._sum.price ?? 0,
      },
      cartCount,
    };
  }
}
