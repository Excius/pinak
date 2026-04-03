import { z } from "zod";

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
        items: z.array(
          z.object({
            id: z.string(),
            productVariant: z.any(),
            addedAt: z.date(),
            inStock: z.boolean(),
            stockCount: z.number(),
          }),
        ),
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
          productVariant: z.any(),
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
