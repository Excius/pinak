import { z } from "zod";

// OutOfStockStatus enum for product availability behaviour
const OutOfStockStatusEnum = z.enum([
  "IN_STOCK",
  "OUT_OF_STOCK",
  "BACKORDER",
  "PREORDER",
]);

// Public product route response schemas (aligned with product.mapper.ts)
const PublicProductImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
});

const PublicVariantRouteImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
});

const PublicProductVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number(),
  compareAtPrice: z.number().nullable().optional(),
  stock: z.number(),
  lowStockThreshold: z.number().nullable().optional(),
  isActive: z.boolean(),
  image: PublicProductImageSchema.nullable(),
  optionValues: z.array(
    z.object({
      optionName: z.string(),
      valueName: z.string(),
    }),
  ),
});

const PublicProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  keyIngredients: z.string().nullable(),
  frontImageUrl: z.string().nullable(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  brand: z
    .object({
      name: z.string(),
      slug: z.string(),
      logoUrl: z.string().nullable(),
    })
    .nullable(),
  taxClass: z
    .object({
      name: z.string(),
      rate: z.number(),
    })
    .nullable(),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
    }),
  ),
  variants: z.array(PublicProductVariantSchema),
  filterValues: z.array(
    z.object({
      filterGroup: z.string(),
      value: z.string(),
      slug: z.string().optional(),
    }),
  ),
  viewCount: z.number(),
  purchasedCount: z.number(),
});

const PublicProductListSchema = z.object({
  data: z.array(PublicProductSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

const PublicVariantRouteSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number(),
  compareAtPrice: z.number().nullable().optional(),
  stock: z.number(),
  lowStockThreshold: z.number().nullable().optional(),
  isActive: z.boolean(),
  images: z.array(PublicVariantRouteImageSchema),
  optionValues: z.array(
    z.object({
      optionName: z.string().optional(),
      optionSlug: z.string().optional(),
      valueName: z.string().optional(),
      valueSlug: z.string().optional(),
    }),
  ),
});

export const ProductTypes = {
  GetProducts: {
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
      sortBy: z
        .enum(["createdAt", "sortOrder", "viewCount", "purchasedCount"], {
          message:
            "sortBy must be 'createdAt', 'sortOrder', 'viewCount' or 'purchasedCount'",
        })
        .optional(),
      sortOrder: z
        .enum(["asc", "desc"], { message: "sortOrder must be 'asc' or 'desc'" })
        .optional(),
      search: z.string().optional(),
      categoryId: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
      minPrice: z.coerce
        .number()
        .min(0, { message: "minPrice must be >= 0" })
        .optional(),
      maxPrice: z.coerce
        .number()
        .min(0, { message: "maxPrice must be >= 0" })
        .optional(),
      brand: z.string().optional(),
      inStock: z.coerce.boolean().optional(),
      tags: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(",") : undefined)),
      filterValueIds: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(",") : undefined)),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicProductListSchema,
    }),
  },

  GetProductById: {
    body: z.object({}),
    params: z.object({
      id: z
        .string("Product id must be a string")
        .min(1, { message: "Product id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicProductSchema,
    }),
  },

  GetProductBySlug: {
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
      data: PublicProductSchema,
    }),
  },

  GetProductsWithCategory: {
    body: z.object({}),
    params: z.object({
      categoryId: z
        .string("categoryId must be a string")
        .min(1, { message: "categoryId is required" }),
    }),
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
      sortBy: z
        .enum(["createdAt", "sortOrder", "viewCount", "purchasedCount"], {
          message:
            "sortBy must be 'createdAt', 'sortOrder', 'viewCount' or 'purchasedCount'",
        })
        .optional(),
      sortOrder: z
        .enum(["asc", "desc"], { message: "sortOrder must be 'asc' or 'desc'" })
        .optional(),
      brand: z.string().optional(),
      inStock: z.coerce.boolean().optional(),
      filterValueIds: z
        .string()
        .optional()
        .transform((val) => (val ? val.split(",") : undefined)),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicProductListSchema,
    }),
  },

  GetFeaturedProducts: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      sectionId: z.string().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicProductListSchema,
    }),
  },

  GetFeaturedProductsBySection: {
    body: z.object({}),
    params: z.object({
      sectionId: z
        .string("sectionId must be a string")
        .min(1, { message: "sectionId is required" }),
    }),
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: PublicProductListSchema,
    }),
  },

  SearchProducts: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      q: z.string().min(1),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicProductSchema),
    }),
  },

  GetProductVariants: {
    body: z.object({}),
    params: z.object({
      productId: z
        .string("productId must be a string")
        .min(1, { message: "productId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(PublicVariantRouteSchema),
    }),
  },

  // Admin types
  GetAllProductsAdmin: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      sortBy: z
        .enum(["createdAt", "sortOrder", "viewCount", "purchasedCount"], {
          message:
            "sortBy must be 'createdAt', 'sortOrder', 'viewCount' or 'purchasedCount'",
        })
        .optional(),
      sortOrder: z
        .enum(["asc", "desc"], { message: "sortOrder must be 'asc' or 'desc'" })
        .optional(),
      search: z.string().optional(),
      brand: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            brandId: z.string().nullable(),
            isActive: z.boolean(),
            isDeleted: z.boolean(),
            frontImageUrl: z.string().nullable(),
            sortOrder: z.number(),
            viewCount: z.number(),
            purchasedCount: z.number(),
            outOfStockStatus: OutOfStockStatusEnum,
            createdAt: z.date(),
            updatedAt: z.date(),
            variants: z.array(
              z.object({
                id: z.string(),
                sku: z.string(),
                price: z.number(),
                comparePrice: z.number().nullable(),
                ean: z.string().nullable(),
                weightGrams: z.number().nullable(),
                stock: z.number(),
                tags: z.array(z.string()),
                isActive: z.boolean(),
                isDeleted: z.boolean(),
                images: z.array(
                  z.object({
                    id: z.string(),
                    url: z.string(),
                    isPrimary: z.boolean(),
                    altText: z.string().nullable(),
                    sortOrder: z.number(),
                  }),
                ),
              }),
            ),
          }),
        ),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
          hasNext: z.boolean(),
          hasPrev: z.boolean(),
        }),
      }),
    }),
  },

  CreateProduct: {
    body: z.object({
      name: z
        .string("Product name must be a string")
        .min(1, { message: "Product name is required" })
        .max(255, { message: "Product name must be at most 255 characters" }),
      slug: z
        .string("slug must be a string")
        .min(1, { message: "slug must be at least 1 character" })
        .max(255, { message: "slug must be at most 255 characters" })
        .optional(),
      description: z.string().optional(),
      keyIngredients: z.string().optional(),
      // SEO
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(500).optional(),
      metaKeywords: z.string().optional(),
      seoKeyword: z.string().optional(),
      // Identification
      model: z.string().optional(),
      ean: z.string().optional(),
      // Media
      frontImageUrl: z
        .string()
        .url({ message: "frontImageUrl must be a valid URL" })
        .optional(),
      // Tags
      tags: z.array(z.string()).default([]),
      // Brand (FK — use brandId to connect to existing Brand)
      brandId: z.string().optional(),
      // Fulfillment
      requiresShipping: z.coerce.boolean().default(true),
      outOfStockStatus: OutOfStockStatusEnum.default("BACKORDER"),
      // Dimensions
      dimensionLength: z.coerce.number().min(0).optional(),
      dimensionWidth: z.coerce.number().min(0).optional(),
      dimensionHeight: z.coerce.number().min(0).optional(),
      lengthClassId: z.string().optional(),
      // Weight
      weightGrams: z.coerce.number().min(0).optional(),
      weightClassId: z.string().optional(),
      // Tax
      taxClassId: z.string().optional(),
      // Display
      sortOrder: z.coerce.number().default(0),
      isActive: z.coerce.boolean().default(true),
    }),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        brandId: z.string().nullable(),
        isActive: z.boolean(),
        sortOrder: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  UpdateProduct: {
    body: z.object({
      name: z
        .string("name must be a string")
        .min(1, { message: "name must not be empty" })
        .max(255, { message: "name must be at most 255 characters" })
        .optional(),
      slug: z
        .string("slug must be a string")
        .min(1, { message: "slug must be at least 1 character" })
        .max(255, { message: "slug must be at most 255 characters" })
        .optional(),
      description: z.string().optional(),
      keyIngredients: z.string().optional(),
      metaTitle: z.string().max(255).optional(),
      metaDescription: z.string().max(500).optional(),
      metaKeywords: z.string().optional(),
      seoKeyword: z.string().optional(),
      model: z.string().optional(),
      ean: z.string().optional(),
      frontImageUrl: z.string().url().optional(),
      tags: z.array(z.string()).optional(),
      brandId: z.string().optional().nullable(),
      requiresShipping: z.coerce.boolean().optional(),
      outOfStockStatus: OutOfStockStatusEnum.optional(),
      dimensionLength: z.coerce.number().min(0).optional().nullable(),
      dimensionWidth: z.coerce.number().min(0).optional().nullable(),
      dimensionHeight: z.coerce.number().min(0).optional().nullable(),
      lengthClassId: z.string().optional().nullable(),
      weightGrams: z.coerce.number().min(0).optional().nullable(),
      weightClassId: z.string().optional().nullable(),
      taxClassId: z.string().optional().nullable(),
      sortOrder: z.coerce.number().optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({
      id: z
        .string("Product id must be a string")
        .min(1, { message: "Product id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        brandId: z.string().nullable(),
        isActive: z.boolean(),
        sortOrder: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  UpdateProductStatus: {
    body: z.object({
      isActive: z.coerce.boolean(),
    }),
    params: z.object({
      id: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        isActive: z.boolean(),
      }),
    }),
  },

  CreateProductVariant: {
    body: z.object({
      sku: z
        .string("SKU must be a string")
        .min(1, { message: "SKU is required" })
        .max(100, { message: "SKU must be at most 100 characters" }),
      ean: z.string().optional(),
      // price stored in paise (smallest currency unit)
      price: z.coerce.number().min(0, { message: "price must be >= 0" }),
      comparePrice: z.coerce
        .number()
        .min(0, { message: "comparePrice must be >= 0" })
        .optional(),
      stock: z.coerce
        .number()
        .min(0, { message: "stock must be >= 0" })
        .default(0),
      weightGrams: z.coerce.number().min(0).optional(),
      weightClassId: z.string().optional(),
      tags: z.array(z.string()).default([]),
      // Dynamic option values — list of OptionValue IDs (e.g. ["30ml-id", "rose-id"])
      optionValueIds: z.array(z.string()).optional(),
      isActive: z.coerce.boolean().default(true),
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
        sku: z.string(),
        ean: z.string().nullable(),
        price: z.number(),
        comparePrice: z.number().nullable(),
        stock: z.number(),
        weightGrams: z.number().nullable(),
        tags: z.array(z.string()),
        isActive: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  UpdateProductVariant: {
    body: z.object({
      sku: z
        .string("sku must be a string")
        .min(1, { message: "sku must not be empty" })
        .max(100, { message: "sku must be at most 100 characters" })
        .optional(),
      ean: z.string().optional().nullable(),
      price: z.coerce
        .number()
        .min(0, { message: "price must be >= 0" })
        .optional(),
      comparePrice: z.coerce
        .number()
        .min(0, { message: "comparePrice must be >= 0" })
        .optional()
        .nullable(),
      stock: z.coerce
        .number()
        .min(0, { message: "stock must be >= 0" })
        .optional(),
      weightGrams: z.coerce.number().min(0).optional().nullable(),
      weightClassId: z.string().optional().nullable(),
      tags: z.array(z.string()).optional(),
      // Append new OptionValue links; use dedicated endpoint to remove
      optionValueIds: z.array(z.string()).optional(),
      isActive: z.coerce.boolean().optional(),
    }),
    params: z.object({
      id: z
        .string("variant id must be a string")
        .min(1, { message: "variant id is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        productId: z.string(),
        sku: z.string(),
        ean: z.string().nullable(),
        price: z.number(),
        comparePrice: z.number().nullable(),
        stock: z.number(),
        weightGrams: z.number().nullable(),
        tags: z.array(z.string()),
        isActive: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  AddProductImage: {
    body: z.object({
      url: z
        .string("Image URL must be a string")
        .min(1, { message: "Image URL is required" })
        .url({ message: "Invalid URL" }),
      altText: z.string("altText must be a string").optional(),
    }),
    params: z.object({
      variantId: z
        .string("variantId must be a string")
        .min(1, { message: "variantId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        url: z.string(),
        isPrimary: z.boolean(),
        altText: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  SetPrimaryImage: {
    body: z.object({}),
    params: z.object({
      imageId: z
        .string("imageId must be a string")
        .min(1, { message: "imageId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        isPrimary: z.boolean(),
      }),
    }),
  },

  SoftDeleteProduct: {
    body: z.object({}),
    params: z.object({
      id: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreProduct: {
    body: z.object({}),
    params: z.object({
      id: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  AddProductToFeatured: {
    body: z.object({
      productId: z.string(),
    }),
    params: z.object({
      sectionId: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        sectionId: z.string(),
        productId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  RemoveProductFromFeatured: {
    body: z.object({}),
    params: z.object({
      featuredProductId: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  UpdateVariantStock: {
    body: z.object({
      newStock: z.coerce.number().min(0, { message: "newStock must be >= 0" }),
    }),
    params: z.object({
      variantId: z
        .string("variantId must be a string")
        .min(1, { message: "variantId is required" }),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        stock: z.number(),
      }),
    }),
  },

  BulkUpdateVariantStock: {
    body: z.array(
      z.object({
        variantId: z
          .string("variantId must be a string")
          .min(1, { message: "variantId is required" }),
        newStock: z.coerce
          .number()
          .min(0, { message: "newStock must be >= 0" }),
      }),
    ),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(
        z.object({
          id: z.string(),
          stock: z.number(),
        }),
      ),
    }),
  },

  HardDeleteProduct: {
    body: z.object({}),
    params: z.object({
      id: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  SoftDeleteProductVariant: {
    body: z.object({}),
    params: z.object({
      id: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  RestoreProductVariant: {
    body: z.object({}),
    params: z.object({
      id: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({}),
    }),
  },

  HardDeleteProductVariant: {
    body: z.object({}),
    params: z.object({
      id: z.string(),
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
  [K in keyof typeof ProductTypes]: z.infer<(typeof ProductTypes)[K]["body"]>;
};

export type ParamsTypes = {
  [K in keyof typeof ProductTypes]: z.infer<(typeof ProductTypes)[K]["params"]>;
};

export type QueryTypes = {
  [K in keyof typeof ProductTypes]: z.infer<(typeof ProductTypes)[K]["query"]>;
};

export type ResponseTypes = {
  [K in keyof typeof ProductTypes]: z.infer<
    (typeof ProductTypes)[K]["response"]
  >;
};
