import { Prisma, PrismaClient } from "../generated/prisma/client.js";

const wishlistItemInclude = {
  productVariant: {
    include: {
      product: {
        include: {
          brand: true,
        },
      },
      images: {
        where: { isDeleted: false },
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
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
} satisfies Prisma.WishlistItemInclude;

export class WishlistRepository {
  constructor(private prisma: PrismaClient) {}

  private wishlistInclude = {
    items: {
      include: wishlistItemInclude,
      orderBy: { createdAt: "desc" as const },
    },
  } satisfies Prisma.WishlistInclude;

  async findOrCreateWishlist(userId: string) {
    return this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: this.wishlistInclude,
    });
  }

  async getWishlistWithItems(userId: string) {
    const wishlist = await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const items = await this.prisma.wishlistItem.findMany({
      where: { wishlist: { userId } },
      include: wishlistItemInclude,
      orderBy: { createdAt: "desc" },
    });

    return {
      ...wishlist,
      items,
    };
  }

  async addItem(wishlistId: string, productVariantId: string) {
    return this.prisma.wishlistItem.create({
      data: {
        wishlistId,
        productVariantId,
      },
      include: wishlistItemInclude,
    });
  }

  async findWishlistItem(wishlistId: string, productVariantId: string) {
    return this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId,
        productVariantId,
      },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  }

  async removeItemForUser(itemId: string, userId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: {
        id: itemId,
        wishlist: { userId },
      },
    });
  }

  async clearWishlist(wishlistId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: { wishlistId },
    });
  }

  async clearWishlistByUser(userId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: { wishlist: { userId } },
    });
  }

  async getItemById(itemId: string) {
    return this.prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: {
        wishlist: true,
        productVariant: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
            images: {
              where: { isDeleted: false },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              take: 1,
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

  async getItemByIdForUser(itemId: string, userId: string) {
    return this.prisma.wishlistItem.findFirst({
      where: {
        id: itemId,
        wishlist: { userId },
      },
      include: {
        wishlist: true,
        productVariant: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
            images: {
              where: { isDeleted: false },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              take: 1,
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

  async countItems(wishlistId: string) {
    return this.prisma.wishlistItem.count({
      where: { wishlistId },
    });
  }

  getVariantById(id: string) {
    return this.prisma.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
        isActive: true,
        product: {
          isDeleted: false,
          isActive: true,
        },
      },
      select: {
        id: true,
      },
    });
  }
}
