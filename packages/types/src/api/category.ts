import { z } from "zod";

const CategoryBase = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CategoryPublicBase = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable(),
});

const PublicCategoryImageSchema = z.object({
  id: z.string(),
  categoryId: z.string().optional(),
  url: z.string(),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean().optional(),
});

// Lightweight image schema used by the public tree endpoint (omits id/timestamps)
const PublicCategoryImageSummarySchema = z.object({
  url: z.string(),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
});

const AdminCategoryImageSchema = PublicCategoryImageSchema.extend({
  isDeleted: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

const CategoryNode: z.ZodTypeAny = z.lazy(() =>
  CategoryBase.extend({
    children: z.array(CategoryNode).default([]),
    parent: CategoryBase.nullable().optional(),
    categoryImages: z.array(PublicCategoryImageSchema).default([]),
  }),
);

// Tree node for the public `GET /categories/tree` endpoint — uses the
// lightweight image shape returned by the repository (omitted fields).
const CategoryPublicNode: z.ZodTypeAny = z.lazy(() =>
  CategoryPublicBase.extend({
    children: z.array(CategoryPublicNode).default([]),
    parent: CategoryPublicBase.nullable().optional(),
    categoryImages: z.array(PublicCategoryImageSummarySchema).default([]),
  }),
);

const AdminCategoryNode = CategoryNode;

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
      data: z.array(CategoryPublicNode),
    }),
  },
  ListTopCategories: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(CategoryPublicNode),
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
      data: CategoryPublicNode,
    }),
  },
  GetCategoryBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: CategoryPublicNode,
    }),
  },
  GetCategoryTree: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(CategoryPublicNode),
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

export const CategoryAdminTypes = {
  AdminGetCategoryImages: {
    body: z.object({}),
    params: z.object({
      categoryId: z.string().min(1, { message: "categoryId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminCategoryImageSchema),
    }),
  },
  ListCategories: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ parentId: z.string().optional() }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminCategoryNode),
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
      data: AdminCategoryNode,
    }),
  },

  GetCategoryBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: AdminCategoryNode,
    }),
  },

  GetCategoryTree: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(AdminCategoryNode),
    }),
  },

  AddCategoryImage: {
    body: z.object({
      url: z.string().min(1).url(),
      altText: z.string().optional(),
      isPrimary: z.coerce.boolean().optional(),
    }),
    params: z.object({ categoryId: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicCategoryImageSchema,
    }),
  },

  SetPrimaryCategoryImage: {
    body: z.object({}),
    params: z.object({ imageId: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string(), isPrimary: z.boolean() }),
    }),
  },

  SoftDeleteCategoryImage: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreCategoryImage: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  HardDeleteCategoryImage: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
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

export type AdminBodyTypes = {
  [K in keyof typeof CategoryAdminTypes]: z.infer<
    (typeof CategoryAdminTypes)[K]["body"]
  >;
};

export type AdminParamsTypes = {
  [K in keyof typeof CategoryAdminTypes]: z.infer<
    (typeof CategoryAdminTypes)[K]["params"]
  >;
};

export type AdminQueryTypes = {
  [K in keyof typeof CategoryAdminTypes]: z.infer<
    (typeof CategoryAdminTypes)[K]["query"]
  >;
};

export type AdminResponseTypes = {
  [K in keyof typeof CategoryAdminTypes]: z.infer<
    (typeof CategoryAdminTypes)[K]["response"]
  >;
};
