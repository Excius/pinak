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

  async findOrCreateWishlist(userId: string) {
    return this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: wishlistItemInclude,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async getWishlistWithItems(userId: string) {
    return this.findOrCreateWishlist(userId);
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

  async clearWishlist(wishlistId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: { wishlistId },
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
