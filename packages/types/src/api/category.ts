import { z } from "zod";

const CategoryBase = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CategoryNode = CategoryBase.extend({
  children: z.array(CategoryBase).optional(),
  parent: CategoryBase.nullable().optional(),
});

export const CategoryTypes = {
  ListCategories: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      parentId: z.string().optional(),
      withChildren: z.coerce.boolean().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(CategoryNode),
    }),
  },
  GetCategoryById: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "category id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CategoryNode,
    }),
  },
  GetCategoryBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CategoryNode,
    }),
  },
  GetCategoryTree: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(CategoryNode),
    }),
  },
  CreateCategory: {
    body: z.object({
      name: z
        .string("Category name must be a string")
        .min(1, { message: "Category name is required" })
        .max(255, { message: "Category name must be at most 255 characters" }),
      slug: z.string().optional(),
      parentId: z.string().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CategoryBase,
    }),
  },
  UpdateCategory: {
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).optional(),
      parentId: z.string().optional().nullable(),
    }),
    params: z.object({
      id: z.string().min(1, { message: "category id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CategoryBase,
    }),
  },
  DeleteCategory: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "category id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
};

export type BodyTypes = {
  [K in keyof typeof CategoryTypes]: z.infer<(typeof CategoryTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof CategoryTypes]: z.infer<
    (typeof CategoryTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof CategoryTypes]: z.infer<
    (typeof CategoryTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof CategoryTypes]: z.infer<
    (typeof CategoryTypes)[K]["response"]
  >;
};
