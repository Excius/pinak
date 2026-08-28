import { z } from "zod";

const comboSortBySchema = z.enum([
  "createdAt",
  "updatedAt",
  "price",
  "sortOrder",
  "viewCount",
  "purchasedCount",
]);

const sortOrderSchema = z.enum(["asc", "desc"]);

const pricingStrategySchema = z.enum(["FIXED_PRICE", "CALCULATED", "DYNAMIC"]);
const discountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"]);

const comboPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

const publicComboKitVariantOptionSchema = z.object({
  optionName: z.string(),
  value: z.string(),
});

const publicComboKitVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number(),
  taxAmount: z.number().optional(),
  priceWithTax: z.number().optional(),
  comparePriceWithTax: z.number().nullable().optional(),
  stock: z.number(),
  imageUrl: z.string().nullable(),
  optionValues: z.array(publicComboKitVariantOptionSchema),
});

const publicComboKitItemSchema = z.object({
  id: z.string(),
  productVariantId: z.string(),
  quantity: z.number(),
  sortOrder: z.number(),
  originalPrice: z.number().nullable().optional(),
  discountedPrice: z.number().nullable().optional(),
  isRequired: z.boolean(),
  productVariant: publicComboKitVariantSchema.nullable().optional(),
});

const publicComboKitSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  audience: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  seoKeyword: z.string().nullable(),
  price: z.number(),
  pricingStrategy: pricingStrategySchema,
  discountType: discountTypeSchema.nullable(),
  discountValue: z.number().nullable(),
  tags: z.array(z.string()),
  imageUrl: z.string().nullable(),
  viewCount: z.number(),
  purchasedCount: z.number(),
  isActive: z.boolean(),
  items: z.array(publicComboKitItemSchema),
});

const publicComboKitListSchema = z.object({
  items: z.array(publicComboKitSchema),
  pagination: comboPaginationSchema,
});

const adminOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  sortOrder: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const adminOptionValueSchema = z.object({
  id: z.string(),
  optionId: z.string(),
  value: z.string(),
  sortOrder: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  option: adminOptionSchema.optional(),
});

const adminVariantOptionValueSchema = z.object({
  variantId: z.string().optional(),
  optionValueId: z.string().optional(),
  optionValue: adminOptionValueSchema.optional(),
});

const adminProductImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  isPrimary: z.boolean(),
  altText: z.string().nullable().optional(),
  sortOrder: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  isDeleted: z.boolean().optional(),
});

const adminComboKitVariantSchema = z.object({
  id: z.string(),
  productId: z.string().optional(),
  sku: z.string(),
  ean: z.string().nullable().optional(),
  tags: z.array(z.string()),
  price: z.number(),
  taxAmount: z.number().optional(),
  priceWithTax: z.number().optional(),
  comparePrice: z.number().nullable().optional(),
  comparePriceWithTax: z.number().nullable().optional(),
  stock: z.number(),
  weightGrams: z.number().nullable().optional(),
  weightClassId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  images: z.array(adminProductImageSchema),
  optionValues: z.array(adminVariantOptionValueSchema),
});

const adminComboKitItemSchema = z.object({
  id: z.string(),
  comboKitId: z.string().optional(),
  productVariantId: z.string(),
  quantity: z.number(),
  sortOrder: z.number(),
  originalPrice: z.number().nullable().optional(),
  discountedPrice: z.number().nullable().optional(),
  isRequired: z.boolean(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  productVariant: adminComboKitVariantSchema.nullable().optional(),
});

const adminComboKitSchema = publicComboKitSchema.extend({
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  metaKeywords: z.string().nullable(),
  seoKeyword: z.string().nullable(),
  sortOrder: z.number(),
  isDeleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(adminComboKitItemSchema),
});

const adminComboKitListSchema = z.object({
  items: z.array(adminComboKitSchema),
  pagination: comboPaginationSchema,
});

const comboKitDependenciesSchema = z.object({
  cartCount: z.number(),
  orderCount: z.number(),
});

const comboKitAnalyticsSchema = z.object({
  comboKit: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    viewCount: z.number(),
    purchasedCount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
    _count: z.object({
      items: z.number(),
    }),
  }),
  orders: z.object({
    orderItemCount: z.number(),
    totalUnitsSold: z.number(),
    grossSalesAmount: z.number(),
  }),
  cartCount: z.number(),
});

const comboKitItemInputSchema = z.object({
  productVariantId: z
    .string("productVariantId must be a string")
    .min(1, { message: "productVariantId is required" }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, { message: "quantity must be at least 1" }),
  sortOrder: z.coerce.number().int().min(0).optional(),
  originalPrice: z.coerce.number().int().min(0).optional(),
  discountedPrice: z.coerce.number().int().min(0).optional(),
  isRequired: z.coerce.boolean().optional(),
});

export const ComboKitTypes = {
  GetComboKits: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce
        .number()
        .min(1, { message: "page must be >= 1" })
        .default(1),
      limit: z.coerce
        .number()
        .min(1, { message: "limit must be >= 1" })
        .max(100, { message: "limit must be <= 100" })
        .default(10),
      isActive: z.coerce.boolean().optional(),
      search: z.string().trim().min(1).optional(),
      tags: z
        .string()
        .transform((value) =>
          value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        )
        .optional(),
      minPrice: z.coerce.number().int().min(0).optional(),
      maxPrice: z.coerce.number().int().min(0).optional(),
      sortBy: comboSortBySchema.optional(),
      sortOrder: sortOrderSchema.optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: publicComboKitListSchema,
    }),
  },

  GetComboKitById: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: publicComboKitSchema,
    }),
  },

  GetComboKitBySlug: {
    body: z.object({}),
    params: z.object({
      slug: z
        .string("slug must be a string")
        .min(1, { message: "slug is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: publicComboKitSchema,
    }),
  },

  SearchComboKits: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      q: z.string().trim().min(1, { message: "q is required" }),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      isActive: z.coerce.boolean().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: publicComboKitListSchema,
    }),
  },

  GetComboKitItems: {
    body: z.object({}),
    params: z.object({
      id: z.string().min(1, { message: "id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(publicComboKitItemSchema),
    }),
  },

  GetComboKitsAdmin: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().trim().min(1).optional(),
      sortBy: comboSortBySchema.optional(),
      sortOrder: sortOrderSchema.optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitListSchema,
    }),
  },

  GetComboKitAdminById: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  GetComboKitAnalytics: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: comboKitAnalyticsSchema,
    }),
  },

  GetComboKitDependencies: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1, { message: "id is required" }) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: comboKitDependenciesSchema,
    }),
  },

  CreateComboKit: {
    body: z.object({
      name: z
        .string("Combo name must be a string")
        .min(1, { message: "Combo name is required" })
        .max(255, { message: "Combo name must be at most 255 characters" }),
      slug: z
        .string("slug must be a string")
        .min(1, { message: "slug must be at least 1 character" })
        .max(255, { message: "slug must be at most 255 characters" })
        .optional(),
      description: z.string("description must be a string").optional(),
      audience: z.string("audience must be a string").optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(1000).optional(),
      metaKeywords: z.string().max(1000).optional(),
      seoKeyword: z.string().max(255).optional(),
      imageUrl: z.string().url().optional(),
      pricingStrategy: pricingStrategySchema.optional(),
      discountType: discountTypeSchema.optional(),
      discountValue: z.coerce.number().min(0).optional(),
      tags: z.array(z.string().trim().min(1)).optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
      price: z.coerce.number().int().min(0, { message: "price must be >= 0" }),
      isActive: z.coerce.boolean().optional(),
      items: z.array(comboKitItemInputSchema).optional(),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  UpdateComboKit: {
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      audience: z.string().optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(1000).optional(),
      metaKeywords: z.string().max(1000).optional(),
      seoKeyword: z.string().max(255).optional(),
      imageUrl: z.string().url().optional(),
      pricingStrategy: pricingStrategySchema.optional(),
      discountType: discountTypeSchema.optional(),
      discountValue: z.coerce.number().min(0).optional(),
      tags: z.array(z.string().trim().min(1)).optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
      price: z.coerce.number().int().min(0).optional(),
      isActive: z.coerce.boolean().optional(),
      items: z.array(comboKitItemInputSchema).optional(),
    }),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  AddComboKitItem: {
    body: comboKitItemInputSchema,
    params: z.object({
      comboKitId: z
        .string("comboKitId must be a string")
        .min(1, { message: "comboKitId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitItemSchema,
    }),
  },

  UpdateComboKitItem: {
    body: z.object({
      quantity: z.coerce.number().int().min(1).optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
      originalPrice: z.coerce.number().int().min(0).optional(),
      discountedPrice: z.coerce.number().int().min(0).optional(),
      isRequired: z.coerce.boolean().optional(),
    }),
    params: z.object({ comboKitId: z.string(), itemId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitItemSchema,
    }),
  },

  ReorderComboKitItems: {
    body: z.object({
      items: z
        .array(
          z.object({
            id: z.string().min(1),
            sortOrder: z.coerce.number().int().min(0),
          }),
        )
        .min(1),
    }),
    params: z.object({ comboKitId: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(adminComboKitItemSchema),
    }),
  },

  BulkSetComboKitItems: {
    body: z.object({
      items: z.array(comboKitItemInputSchema).min(1),
    }),
    params: z.object({ comboKitId: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(adminComboKitItemSchema),
    }),
  },

  UpdateComboKitStatus: {
    body: z.object({ isActive: z.coerce.boolean() }),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  UpdateComboKitPricing: {
    body: z.object({
      price: z.coerce.number().int().min(0).optional(),
      pricingStrategy: pricingStrategySchema.optional(),
      discountType: discountTypeSchema.nullable().optional(),
      discountValue: z.coerce.number().min(0).nullable().optional(),
    }),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  UpdateComboKitMetadata: {
    body: z.object({
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(1000).optional(),
      metaKeywords: z.string().max(1000).optional(),
      seoKeyword: z.string().max(255).optional(),
      tags: z.array(z.string().trim().min(1)).optional(),
      imageUrl: z.string().url().nullable().optional(),
      sortOrder: z.coerce.number().int().min(0).optional(),
    }),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  RemoveComboKitItem: {
    body: z.object({}),
    params: z.object({ comboKitId: z.string(), itemId: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  SoftDeleteComboKit: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreComboKit: {
    body: z.object({}),
    params: z.object({ id: z.string() }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: adminComboKitSchema,
    }),
  },

  IncrementComboKitView: {
    body: z.object({}),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  IncrementComboKitPurchase: {
    body: z.object({ quantity: z.coerce.number().int().min(1).default(1) }),
    params: z.object({ id: z.string().min(1) }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  HardDeleteComboKit: {
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
  [K in keyof typeof ComboKitTypes]: z.infer<(typeof ComboKitTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof ComboKitTypes]: z.infer<
    (typeof ComboKitTypes)[K]["params"]
  >;
};

export type QueryTypes = {
  [K in keyof typeof ComboKitTypes]: z.infer<
    (typeof ComboKitTypes)[K]["query"]
  >;
};

export type ResponseTypes = {
  [K in keyof typeof ComboKitTypes]: z.infer<
    (typeof ComboKitTypes)[K]["response"]
  >;
};
