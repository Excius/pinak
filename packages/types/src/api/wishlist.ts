import { z } from "zod";

const WishlistBrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const WishlistProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  keyIngredients: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  seoKeyword: z.string().nullable(),
  model: z.string().nullable(),
  ean: z.string().nullable(),
  frontImageUrl: z.string().nullable(),
  tags: z.array(z.string()),
  brandId: z.string().nullable(),
  requiresShipping: z.boolean(),
  outOfStockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK", "BACKORDER", "PREORDER"]),
  dimensionLength: z.number().nullable(),
  dimensionWidth: z.number().nullable(),
  dimensionHeight: z.number().nullable(),
  lengthClassId: z.string().nullable(),
  weightGrams: z.number().nullable(),
  weightClassId: z.string().nullable(),
  taxClassId: z.string().nullable(),
  sortOrder: z.number(),
  viewCount: z.number(),
  purchasedCount: z.number(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  brand: WishlistBrandSchema.nullable(),
});

const WishlistImageSchema = z.object({
  id: z.string(),
  productVariantId: z.string(),
  url: z.string(),
  isPrimary: z.boolean(),
  altText: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean(),
});

const WishlistOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const WishlistOptionValueSchema = z.object({
  id: z.string(),
  optionId: z.string(),
  value: z.string(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  option: WishlistOptionSchema,
});

const WishlistVariantOptionValueSchema = z.object({
  variantId: z.string(),
  optionValueId: z.string(),
  optionValue: WishlistOptionValueSchema,
});

const WishlistProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  ean: z.string().nullable(),
  tags: z.array(z.string()),
  price: z.number(),
  comparePrice: z.number().nullable(),
  stock: z.number(),
  weightGrams: z.number().nullable(),
  weightClassId: z.string().nullable(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  product: WishlistProductSchema,
  images: z.array(WishlistImageSchema),
  optionValues: z.array(WishlistVariantOptionValueSchema),
});

const WishlistItemSchema = z.object({
  id: z.string(),
  productVariant: WishlistProductVariantSchema,
  addedAt: z.date(),
  inStock: z.boolean(),
  stockCount: z.number(),
});

export const WishlistTypes = {
  GetWishlist: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        userId: z.string(),
        items: z.array(WishlistItemSchema),
        totalItems: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  AddToWishlist: {
    body: z.object({
      productVariantId: z.string().min(1, "Product variant ID is required"),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        message: z.string(),
        item: z.object({
          id: z.string(),
          productVariant: WishlistProductVariantSchema,
          addedAt: z.date(),
        }),
      }),
    }),
  },

  RemoveFromWishlist: {
    body: z.object({}),
    params: z.object({
      itemId: z.string().min(1, "Item ID is required"),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  ClearWishlist: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ message: z.string(), deletedCount: z.number().int() }),
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof WishlistTypes]: z.infer<(typeof WishlistTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof WishlistTypes]: z.infer<
    (typeof WishlistTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof WishlistTypes]: z.infer<
    (typeof WishlistTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof WishlistTypes]: z.infer<
    (typeof WishlistTypes)[K]["response"]
  >;
};
