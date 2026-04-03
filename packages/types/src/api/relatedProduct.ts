import { z } from "zod";

export const RelatedProductTypes = {
  AddRelatedProduct: {
    body: z.object({
      relatedProductId: z
        .string("relatedProductId must be a string")
        .min(1, { message: "relatedProductId is required" }),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({
      productId: z
        .string("productId must be a string")
        .min(1, { message: "productId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        productId: z.string(),
        relatedProductId: z.string(),
        sortOrder: z.number(),
        createdAt: z.date(),
      }),
    }),
  },
  RemoveRelatedProduct: {
    body: z.object({}),
    params: z.object({
      productId: z.string(),
      relatedProductId: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
  ListRelated: {
    body: z.object({}),
    params: z.object({ productId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(
        z.object({
          id: z.string(),
          productId: z.string(),
          relatedProductId: z.string(),
          sortOrder: z.number(),
          createdAt: z.date(),
          relatedProduct: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            frontImageUrl: z.string().nullable(),
            isActive: z.boolean(),
          }),
        }),
      ),
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof RelatedProductTypes]: z.infer<
    (typeof RelatedProductTypes)[K]["body"]
  >;
};

export type ParamsTypes = {
  [K in keyof typeof RelatedProductTypes]: z.infer<
    (typeof RelatedProductTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof RelatedProductTypes]: z.infer<
    (typeof RelatedProductTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof RelatedProductTypes]: z.infer<
    (typeof RelatedProductTypes)[K]["response"]
  >;
};
