import { Prisma, PrismaClient } from "../generated/prisma/client.js";

const variantInclude = {
  product: {
    include: {
      brand: true,
      taxClass: true,
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
} satisfies Prisma.ProductVariantInclude;

const comboInclude = {
  items: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      productVariant: {
        include: variantInclude,
      },
    },
  },
} satisfies Prisma.ComboKitInclude;

const cartItemInclude = {
  productVariant: {
    include: variantInclude,
  },
  comboKit: {
    include: comboInclude,
  },
} satisfies Prisma.CartItemInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: typeof cartItemInclude;
      orderBy: { createdAt: "desc" };
    };
  };
}>;

type AddCartItemInput = {
  productVariantId?: string;
  comboKitId?: string;
  quantity: number;
};

export class CartRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly cartInclude = {
    items: {
      include: cartItemInclude,
      orderBy: { createdAt: "desc" as const },
    },
  } satisfies Prisma.CartInclude;

  private getDb(tx?: Prisma.TransactionClient): PrismaClient | Prisma.TransactionClient {
    return tx ?? this.prisma;
  }

  async findOrCreateCart(userId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: this.cartInclude,
    });
  }

  async getCartWithItems(userId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: this.cartInclude,
    });
  }

  async findCartItem(
    cartId: string,
    productVariantId?: string,
    comboKitId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    return db.cartItem.findFirst({
      where: {
        cartId,
        ...(productVariantId ? { productVariantId } : {}),
        ...(comboKitId ? { comboKitId } : {}),
      },
      include: cartItemInclude,
    });
  }

  async getCartItemByIdForUser(
    itemId: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const db = this.getDb(tx);
    return db.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: cartItemInclude,
    });
  }

  async addItem(cartId: string, input: AddCartItemInput, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cartItem.create({
      data: {
        cartId,
        quantity: input.quantity,
        productVariantId: input.productVariantId,
        comboKitId: input.comboKitId,
      },
      include: cartItemInclude,
    });
  }

  async updateItemQuantity(itemId: string, quantity: number, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: cartItemInclude,
    });
  }

  async incrementItemQuantity(itemId: string, by: number, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cartItem.update({
      where: { id: itemId },
      data: { quantity: { increment: by } },
      include: cartItemInclude,
    });
  }

  async removeItem(itemId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    await db.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async clearCartByUser(userId: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });
  }

  async getActiveVariantById(id: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.productVariant.findFirst({
      where: {
        id,
        isDeleted: false,
        isActive: true,
        product: {
          isDeleted: false,
          isActive: true,
        },
      },
      include: variantInclude,
    });
  }

  async getActiveComboKitById(id: string, tx?: Prisma.TransactionClient) {
    const db = this.getDb(tx);
    return db.comboKit.findFirst({
      where: {
        id,
        isDeleted: false,
        isActive: true,
      },
      include: comboInclude,
    });
  }
}
