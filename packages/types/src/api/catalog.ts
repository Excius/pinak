import { z } from "zod";

export const BrandTypes = {
  ListBrands: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ activeOnly: z.coerce.boolean().optional() }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          isActive: z.boolean(),
        }),
      ),
    }),
  },

  GetBrandById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("brand id must be a string")
        .min(1, { message: "brand id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        logoUrl: z.string().nullable(),
        isActive: z.boolean(),
      }),
    }),
  },

  GetBrandBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        logoUrl: z.string().nullable(),
        isActive: z.boolean(),
      }),
    }),
  },

  CreateBrand: {
    body: z.object({
      name: z
        .string("Brand name must be a string")
        .min(1, { message: "Brand name is required" }),
      slug: z.string("slug must be a string").optional(),
      logoUrl: z
        .string("logoUrl must be a string")
        .url({ message: "logoUrl must be a valid URL" })
        .optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string() }),
    }),
  },

  UpdateBrand: {
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      logoUrl: z.string().url().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },

  DeleteBrand: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
};

export const OptionTypes = {
  ListOptions: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
  },
  GetOptionById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  CreateOption: {
    body: z.object({
      name: z
        .string("Option name must be a string")
        .min(1, { message: "Option name is required" }),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  },
  UpdateOption: {
    body: z.object({
      name: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  DeleteOption: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  CreateOptionValue: {
    body: z.object({
      value: z
        .string("Option value must be a string")
        .min(1, { message: "Option value is required" }),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({
      optionId: z
        .string("optionId must be a string")
        .min(1, { message: "optionId is required" }),
    }),
    query: z.object({}),
  },
  UpdateOptionValue: {
    body: z.object({
      value: z.string().min(1).optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  DeleteOptionValue: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
};

export const FilterTypes = {
  ListGroups: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({ activeOnly: z.coerce.boolean().optional() }),
  },
  GetGroupById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  CreateGroup: {
    body: z.object({
      name: z
        .string("Filter group name must be a string")
        .min(1, { message: "Filter group name is required" }),
      slug: z.string("slug must be a string").optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({}),
    query: z.object({}),
  },
  UpdateGroup: {
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  DeleteGroup: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  CreateValue: {
    body: z.object({
      name: z
        .string("Filter value name must be a string")
        .min(1, { message: "Filter value name is required" }),
      slug: z.string("slug must be a string").optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({
      groupId: z
        .string("groupId must be a string")
        .min(1, { message: "groupId is required" }),
    }),
    query: z.object({}),
  },
  UpdateValue: {
    body: z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      sortOrder: z.coerce.number().optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  DeleteValue: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  AddFilterToProduct: {
    body: z.object({}),
    params: z.object({ productId: z.string(), filterValueId: z.string() }),
    query: z.object({}),
  },
  RemoveFilterFromProduct: {
    body: z.object({}),
    params: z.object({ productId: z.string(), filterValueId: z.string() }),
    query: z.object({}),
  },
};

export const TaxClassTypes = {
  List: { body: z.object({}), params: z.object({}), query: z.object({}) },
  GetById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
  },
  Create: {
    body: z.object({
      name: z
        .string("Tax class name must be a string")
        .min(1, { message: "Tax class name is required" }),
      rate: z.coerce.number().min(0, { message: "rate must be >= 0" }),
    }),
    params: z.object({}),
    query: z.object({}),
  },
  Update: {
    body: z.object({
      name: z.string("name must be a string").optional(),
      rate: z.coerce
        .number()
        .min(0, { message: "rate must be >= 0" })
        .optional(),
    }),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
  },
  Delete: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("taxClass id must be a string")
        .min(1, { message: "taxClass id is required" }),
    }),
    query: z.object({}),
  },
};

export const LengthWeightTypes = {
  ListLength: { body: z.object({}), params: z.object({}), query: z.object({}) },
  GetLengthById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  CreateLength: {
    body: z.object({
      name: z
        .string("Length name must be a string")
        .min(1, { message: "Length name is required" }),
      unit: z
        .string("unit must be a string")
        .min(1, { message: "unit is required" })
        .max(64, { message: "unit must be at most 64 characters" }),
    }),
    params: z.object({}),
    query: z.object({}),
  },
  UpdateLength: {
    body: z.object({
      name: z.string("name must be a string").optional(),
      unit: z
        .string("unit must be a string")
        .min(1, { message: "unit must be at least 1 character" })
        .max(64, { message: "unit must be at most 64 characters" })
        .optional(),
    }),
    params: z.object({
      id: z
        .string("length id must be a string")
        .min(1, { message: "length id is required" }),
    }),
    query: z.object({}),
  },
  DeleteLength: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },

  ListWeight: { body: z.object({}), params: z.object({}), query: z.object({}) },
  GetWeightById: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  CreateWeight: {
    body: z.object({
      name: z.string().min(1),
      unit: z.string().min(1).max(64),
    }),
    params: z.object({}),
    query: z.object({}),
  },
  UpdateWeight: {
    body: z.object({
      name: z.string().optional(),
      unit: z.string().min(1).max(64).optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
  DeleteWeight: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
  },
};

export const ProductCategoryTypes = {
  AddProductToCategory: {
    body: z.object({ categoryId: z.string() }),
    params: z.object({ productId: z.string() }),
    query: z.object({}),
  },
  RemoveProductFromCategory: {
    body: z.object({}),
    params: z.object({ productId: z.string(), categoryId: z.string() }),
    query: z.object({}),
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
  },
  ListCategoriesForProduct: {
    body: z.object({}),
    params: z.object({ productId: z.string() }),
    query: z.object({}),
  },
};

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
  },
  RemoveRelatedProduct: {
    body: z.object({}),
    params: z.object({
      productId: z.string(),
      relatedProductId: z.string(),
    }),
    query: z.object({}),
  },
  ListRelated: {
    body: z.object({}),
    params: z.object({ productId: z.string() }),
    query: z.object({}),
  },
};

export const CategoryTypes = {
  ListCategories: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      parentId: z.string().optional(),
      withChildren: z.coerce.boolean().optional(),
    }),
  },
  GetCategoryById: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "category id is required" }),
    }),
    query: z.object({}),
  },
  GetCategoryBySlug: {
    body: z.object({}),
    params: z.object({ slug: z.string().min(1) }),
    query: z.object({}),
  },
  GetCategoryTree: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
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
  },
  DeleteCategory: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "category id is required" }),
    }),
    query: z.object({}),
  },
};

export const FeaturedSectionTypes = {
  ListFeaturedSections: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          type: z.enum(["EXPERT_PICKS", "HOMEPAGE_HERO", "DEALS"]),
          priority: z.number(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      ),
    }),
  },

  GetFeaturedSectionById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("section id must be a string")
        .min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        title: z.string(),
        type: z.enum(["EXPERT_PICKS", "HOMEPAGE_HERO", "DEALS"]),
        priority: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  CreateFeaturedSection: {
    body: z.object({
      title: z
        .string("title must be a string")
        .min(1, { message: "title is required" })
        .max(255, { message: "title must be at most 255 characters" }),
      type: z.enum(["EXPERT_PICKS", "HOMEPAGE_HERO", "DEALS"], {
        message: "type must be EXPERT_PICKS, HOMEPAGE_HERO, or DEALS",
      }),
      priority: z.coerce.number().int().min(0).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string() }),
    }),
  },

  UpdateFeaturedSection: {
    body: z.object({
      title: z.string().min(1).max(255).optional(),
      type: z
        .enum(["EXPERT_PICKS", "HOMEPAGE_HERO", "DEALS"])
        .optional(),
      priority: z.coerce.number().int().min(0).optional(),
    }),
    params: z.object({
      id: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({ id: z.string() }),
    }),
  },

  DeleteFeaturedSection: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "section id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },
};

export type BrandTypes = typeof BrandTypes;
export type OptionTypes = typeof OptionTypes;
export type FilterTypes = typeof FilterTypes;
export type TaxClassTypes = typeof TaxClassTypes;
export type LengthWeightTypes = typeof LengthWeightTypes;
export type ProductCategoryTypes = typeof ProductCategoryTypes;
export type RelatedProductTypes = typeof RelatedProductTypes;
export type CategoryTypes = typeof CategoryTypes;
export type FeaturedSectionTypes = typeof FeaturedSectionTypes;
