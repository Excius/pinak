import { z } from "zod";

export const ProductCategoryTypes = {
  AddProductToCategory: {
    body: z.object({ categoryId: z.string() }),
    params: z.object({ productId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ productId: z.string(), categoryId: z.string() }),
    }),
  },
  RemoveProductFromCategory: {
    body: z.object({}),
    params: z.object({ productId: z.string(), categoryId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
  SetCategoriesForProduct: {
    body: z.object({
      categoryIds: z
        .array(z.string("each categoryId must be a string"))
        .min(1, { message: "categoryIds must contain at least one id" }),
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
      data: z.object({ count: z.number().int() }),
    }),
  },
  ListCategoriesForProduct: {
    body: z.object({}),
    params: z.object({ productId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(
        z.object({
          productId: z.string(),
          categoryId: z.string(),
          category: z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            parentId: z.string().nullable(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
        }),
      ),
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof ProductCategoryTypes]: z.infer<
    (typeof ProductCategoryTypes)[K]["body"]
  >;
};

export type ParamsTypes = {
  [K in keyof typeof ProductCategoryTypes]: z.infer<
    (typeof ProductCategoryTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof ProductCategoryTypes]: z.infer<
    (typeof ProductCategoryTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof ProductCategoryTypes]: z.infer<
    (typeof ProductCategoryTypes)[K]["response"]
  >;
};
