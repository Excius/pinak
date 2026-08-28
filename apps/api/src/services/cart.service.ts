import { NotFoundError, ValidationError } from "../lib/error.js";
import { CartRepository, CartWithItems } from "../repositories/cart.repository.js";
import { StockReservationService } from "./stockReservation.service.js";

export type AddToCartInput = {
  productVariantId?: string;
  comboKitId?: string;
  quantity: number;
};

export type CartItemResponse = {
  id: string;
  itemType: "PRODUCT_VARIANT" | "COMBO_KIT";
  quantity: number;
  unitPrice: number;
  unitPriceWithTax?: number;
  taxAmount?: number;
  lineTotal: number;
  lineTotalWithTax?: number;
  availableStock: number;
  productVariantId: string | null;
  comboKitId: string | null;
  productVariant: {
    id: string;
    sku: string;
    price: number;
    taxAmount?: number;
    priceWithTax?: number;
    isActive: boolean;
    image: {
      id: string;
      url: string;
      altText: string | null;
      isPrimary: boolean;
      sortOrder: number;
    } | null;
    optionValues: Array<{
      optionName: string;
      valueName: string;
    }>;
    product: {
      id: string;
      name: string;
      slug: string;
      frontImageUrl: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
      metaKeywords: string | null;
      seoKeyword: string | null;
      brand: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
      } | null;
    };
  } | null;
  comboKit: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    isActive: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    seoKeyword: string | null;
    items: Array<{
      id: string;
      productVariantId: string;
      quantity: number;
      sortOrder: number;
      isRequired: boolean;
      productVariant: {
        id: string;
        sku: string;
        price: number;
        taxAmount?: number;
        priceWithTax?: number;
        image: {
          id: string;
          url: string;
          altText: string | null;
          isPrimary: boolean;
          sortOrder: number;
        } | null;
      } | null;
    }>;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CartResponse = {
  id: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  total: number;
  taxTotal?: number;
  totalWithTax?: number;
  createdAt: Date;
  updatedAt: Date;
};

export class CartService {
  constructor(
    private cartRepository: CartRepository,
    private stockReservationService: StockReservationService,
  ) {}

  private validateAddInput(input: AddToCartInput) {
    if (input.quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0");
    }

    const targetCount =
      Number(Boolean(input.productVariantId)) + Number(Boolean(input.comboKitId));

    if (targetCount !== 1) {
      throw new ValidationError(
        "Provide exactly one of productVariantId or comboKitId",
      );
    }
  }

  private mapVariantOptionValues(
    optionValues: Array<{
      optionValue: {
        value: string;
        option: { name: string };
      };
    }>,
  ) {
    return optionValues.map((entry) => ({
      optionName: entry.optionValue.option.name,
      valueName: entry.optionValue.value,
    }));
  }

  private mapVariantImage(
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
      isPrimary: boolean;
      sortOrder: number;
    }>,
  ) {
    const image = images[0];
    if (!image) return null;
    return {
      id: image.id,
      url: image.url,
      altText: image.altText,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    };
  }

  private async mapCart(cart: CartWithItems): Promise<CartResponse> {
    const items: CartItemResponse[] = await Promise.all(
      cart.items.map(async (item) => {
        if (item.productVariantId && item.productVariant) {
          const availableStock =
            await this.stockReservationService.getAvailableStockForVariant(
              item.productVariantId,
            );

          const taxRate = item.productVariant.product.taxClass?.rate ?? 0;
          const unitPrice = item.productVariant.price;
          const variantTaxAmount = Math.round((unitPrice * taxRate) / 100);
          const unitPriceWithTax = unitPrice + variantTaxAmount;
          const lineTotal = unitPrice * item.quantity;
          const lineTotalWithTax = unitPriceWithTax * item.quantity;

          return {
            id: item.id,
            itemType: "PRODUCT_VARIANT" as const,
            quantity: item.quantity,
            unitPrice,
            unitPriceWithTax,
            taxAmount: variantTaxAmount * item.quantity,
            lineTotal,
            lineTotalWithTax,
            availableStock,
            productVariantId: item.productVariantId,
            comboKitId: null,
            productVariant: {
              id: item.productVariant.id,
              sku: item.productVariant.sku,
              price: item.productVariant.price,
              taxAmount: variantTaxAmount,
              priceWithTax: unitPriceWithTax,
              isActive: item.productVariant.isActive,
              image: this.mapVariantImage(item.productVariant.images),
              optionValues: this.mapVariantOptionValues(
                item.productVariant.optionValues,
              ),
              product: {
                id: item.productVariant.product.id,
                name: item.productVariant.product.name,
                slug: item.productVariant.product.slug,
                frontImageUrl: item.productVariant.product.frontImageUrl,
                metaTitle: item.productVariant.product.metaTitle,
                metaDescription: item.productVariant.product.metaDescription,
                metaKeywords: item.productVariant.product.metaKeywords,
                seoKeyword: item.productVariant.product.seoKeyword,
                brand: item.productVariant.product.brand
                  ? {
                      id: item.productVariant.product.brand.id,
                      name: item.productVariant.product.brand.name,
                      slug: item.productVariant.product.brand.slug,
                      logoUrl: item.productVariant.product.brand.logoUrl,
                    }
                  : null,
              },
            },
            comboKit: null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }

        if (item.comboKitId && item.comboKit) {
          const availableStock =
            await this.stockReservationService.getAvailableStockForCombo(
              item.comboKitId,
            );
          const unitPrice = item.comboKit.price;
          const lineTotal = unitPrice * item.quantity;

          let comboItemTaxTotal = 0;
          const mappedComboItems = item.comboKit.items.map((comboItem) => {
            const componentVariant = comboItem.productVariant;
            const compTaxRate = componentVariant?.product?.taxClass?.rate ?? 0;
            const compPrice = componentVariant?.price ?? 0;
            const compTaxAmount = Math.round((compPrice * compTaxRate) / 100);
            const compPriceWithTax = compPrice + compTaxAmount;

            comboItemTaxTotal += compTaxAmount * comboItem.quantity * item.quantity;

            return {
              id: comboItem.id,
              productVariantId: comboItem.productVariantId,
              quantity: comboItem.quantity,
              sortOrder: comboItem.sortOrder,
              isRequired: comboItem.isRequired,
              productVariant: componentVariant
                ? {
                    id: componentVariant.id,
                    sku: componentVariant.sku,
                    price: componentVariant.price,
                    taxAmount: compTaxAmount,
                    priceWithTax: compPriceWithTax,
                    image: this.mapVariantImage(componentVariant.images),
                  }
                : null,
            };
          });

          const unitPriceWithTax = Math.round(
            unitPrice + comboItemTaxTotal / item.quantity,
          );
          const lineTotalWithTax = lineTotal + comboItemTaxTotal;

          return {
            id: item.id,
            itemType: "COMBO_KIT" as const,
            quantity: item.quantity,
            unitPrice,
            unitPriceWithTax,
            taxAmount: comboItemTaxTotal,
            lineTotal,
            lineTotalWithTax,
            availableStock,
            productVariantId: null,
            comboKitId: item.comboKitId,
            productVariant: null,
            comboKit: {
              id: item.comboKit.id,
              name: item.comboKit.name,
              slug: item.comboKit.slug,
              price: item.comboKit.price,
              imageUrl: item.comboKit.imageUrl,
              isActive: item.comboKit.isActive,
              metaTitle: item.comboKit.metaTitle,
              metaDescription: item.comboKit.metaDescription,
              metaKeywords: item.comboKit.metaKeywords,
              seoKeyword: item.comboKit.seoKeyword,
              items: mappedComboItems,
            },
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }

        throw new ValidationError("Invalid cart item state");
      }),
    );

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const taxTotal = items.reduce(
      (sum, item) => sum + (item.lineTotalWithTax ?? item.lineTotal) - item.lineTotal,
      0,
    );
    const totalWithTax = subtotal + taxTotal;

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      totalItems: items.length,
      totalQuantity,
      subtotal,
      total: subtotal,
      taxTotal,
      totalWithTax,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  async getCart(userId: string) {
    const cart = await this.cartRepository.getCartWithItems(userId);
    return this.mapCart(cart);
  }

  async addToCart(userId: string, input: AddToCartInput) {
    this.validateAddInput(input);
    const cart = await this.cartRepository.findOrCreateCart(userId);

    if (input.productVariantId) {
      const variant = await this.cartRepository.getActiveVariantById(
        input.productVariantId,
      );
      if (!variant) {
        throw new NotFoundError("Product variant not found or inactive");
      }

      const existingItem = await this.cartRepository.findCartItem(
        cart.id,
        input.productVariantId,
      );

      const targetQuantity = (existingItem?.quantity ?? 0) + input.quantity;
      const availableStock =
        await this.stockReservationService.getAvailableStockForVariant(
          input.productVariantId,
        );

      if (targetQuantity > availableStock) {
        throw new ValidationError("Insufficient stock", [
          {
            field: "quantity",
            message: `Requested ${targetQuantity}, available ${availableStock}`,
          },
        ]);
      }

      if (existingItem) {
        await this.cartRepository.incrementItemQuantity(existingItem.id, input.quantity);
      } else {
        await this.cartRepository.addItem(cart.id, {
          productVariantId: input.productVariantId,
          quantity: input.quantity,
        });
      }
    }

    if (input.comboKitId) {
      const comboKit = await this.cartRepository.getActiveComboKitById(
        input.comboKitId,
      );
      if (!comboKit) {
        throw new NotFoundError("Combo kit not found or inactive");
      }

      const existingItem = await this.cartRepository.findCartItem(
        cart.id,
        undefined,
        input.comboKitId,
      );
      const targetQuantity = (existingItem?.quantity ?? 0) + input.quantity;
      const availableStock =
        await this.stockReservationService.getAvailableStockForCombo(input.comboKitId);

      if (targetQuantity > availableStock) {
        throw new ValidationError("Insufficient combo stock", [
          {
            field: "quantity",
            message: `Requested ${targetQuantity}, available ${availableStock}`,
          },
        ]);
      }

      if (existingItem) {
        await this.cartRepository.incrementItemQuantity(existingItem.id, input.quantity);
      } else {
        await this.cartRepository.addItem(cart.id, {
          comboKitId: input.comboKitId,
          quantity: input.quantity,
        });
      }
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0");
    }

    const cartItem = await this.cartRepository.getCartItemByIdForUser(itemId, userId);
    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    if (cartItem.productVariantId) {
      const availableStock =
        await this.stockReservationService.getAvailableStockForVariant(
          cartItem.productVariantId,
        );
      if (quantity > availableStock) {
        throw new ValidationError("Insufficient stock", [
          {
            field: "quantity",
            message: `Requested ${quantity}, available ${availableStock}`,
          },
        ]);
      }
    }

    if (cartItem.comboKitId) {
      const availableStock =
        await this.stockReservationService.getAvailableStockForCombo(
          cartItem.comboKitId,
        );
      if (quantity > availableStock) {
        throw new ValidationError("Insufficient combo stock", [
          {
            field: "quantity",
            message: `Requested ${quantity}, available ${availableStock}`,
          },
        ]);
      }
    }

    await this.cartRepository.updateItemQuantity(itemId, quantity);
    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cartItem = await this.cartRepository.getCartItemByIdForUser(itemId, userId);
    if (!cartItem) {
      throw new NotFoundError("Cart item not found");
    }

    await this.cartRepository.removeItem(itemId);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findOrCreateCart(userId);
    await this.cartRepository.clearCart(cart.id);
    return this.getCart(userId);
  }
}
