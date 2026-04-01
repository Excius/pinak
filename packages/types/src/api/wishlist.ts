import { z } from "zod";

export const WishlistTypes = {
  GetWishlist: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
  },

  AddToWishlist: {
    body: z.object({
      productVariantId: z.string().min(1, "Product variant ID is required"),
    }),
    params: z.object({}),
    query: z.object({}),
  },

  RemoveFromWishlist: {
    body: z.object({}),
    params: z.object({
      itemId: z.string().min(1, "Item ID is required"),
    }),
    query: z.object({}),
  },

  ClearWishlist: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
  },
};
