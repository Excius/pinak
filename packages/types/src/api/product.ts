import { z } from "zod";

// OutOfStockStatus enum for product availability behaviour
const OutOfStockStatusEnum = z.enum([
  "IN_STOCK",
  "OUT_OF_STOCK",
  "BACKORDER",
  "PREORDER",
]);

// Reusable variant shape for list responses (lightweight)
const VariantListItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  price: z.number(),
  comparePrice: z.number().nullable(),
  ean: z.string().nullable(),
  weightGrams: z.number().nullable(),
  stock: z.number(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  optionValues: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
        option: z.object({ id: z.string(), name: z.string() }).optional(),
      }),
    )
    .optional(),
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        isPrimary: z.boolean(),
        altText: z.string().nullable(),
        sortOrder: z.number(),
      }),
    )
    .optional(),
});

// Reusable variant shape for detail page (includes all images)
const VariantDetailSchema = VariantListItemSchema;

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
      data: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            brandId: z.string().nullable(),
            brand: z
              .object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                logoUrl: z.string().nullable(),
              })
              .nullable()
              .optional(),
            taxClassId: z.string().nullable(),
            taxClass: z
              .object({ id: z.string(), name: z.string(), rate: z.number() })
              .nullable()
              .optional(),
            lengthClassId: z.string().nullable(),
            lengthClass: z
              .object({ id: z.string(), name: z.string(), unit: z.string() })
              .nullable()
              .optional(),
            weightClassId: z.string().nullable(),
            weightClass: z
              .object({ id: z.string(), name: z.string(), unit: z.string() })
              .nullable()
              .optional(),
            categories: z
              .array(
                z.object({
                  category: z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    parentId: z.string().nullable(),
                  }),
                }),
              )
              .optional(),
            filterValues: z
              .array(
                z.object({
                  filterValue: z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    filterGroupId: z.string(),
                  }),
                }),
              )
              .optional(),
            isActive: z.boolean(),
            frontImageUrl: z.string().nullable(),
            sortOrder: z.number(),
            viewCount: z.number(),
            purchasedCount: z.number(),
            outOfStockStatus: OutOfStockStatusEnum,
            createdAt: z.date(),
            updatedAt: z.date(),
            variants: z.array(VariantListItemSchema),
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
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        keyIngredients: z.string().nullable(),
        brandId: z.string().nullable(),
        isActive: z.boolean(),
        isDeleted: z.boolean(),
        frontImageUrl: z.string().nullable(),
        tags: z.array(z.string()),
        metaTitle: z.string().nullable(),
        metaDescription: z.string().nullable(),
        metaKeywords: z.string().nullable(),
        seoKeyword: z.string().nullable(),
        model: z.string().nullable(),
        ean: z.string().nullable(),
        requiresShipping: z.boolean(),
        outOfStockStatus: OutOfStockStatusEnum,
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
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  GetProductDetails: {
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
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        keyIngredients: z.string().nullable(),
        brandId: z.string().nullable(),
        brand: z
          .object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            logoUrl: z.string().nullable(),
          })
          .nullable()
          .optional(),
        isActive: z.boolean(),
        isDeleted: z.boolean(),
        frontImageUrl: z.string().nullable(),
        tags: z.array(z.string()),
        metaTitle: z.string().nullable(),
        metaDescription: z.string().nullable(),
        metaKeywords: z.string().nullable(),
        seoKeyword: z.string().nullable(),
        model: z.string().nullable(),
        ean: z.string().nullable(),
        requiresShipping: z.boolean(),
        outOfStockStatus: OutOfStockStatusEnum,
        dimensionLength: z.number().nullable(),
        dimensionWidth: z.number().nullable(),
        dimensionHeight: z.number().nullable(),
        lengthClassId: z.string().nullable(),
        lengthClass: z
          .object({ id: z.string(), name: z.string(), unit: z.string() })
          .nullable()
          .optional(),
        weightGrams: z.number().nullable(),
        weightClassId: z.string().nullable(),
        weightClass: z
          .object({ id: z.string(), name: z.string(), unit: z.string() })
          .nullable()
          .optional(),
        taxClassId: z.string().nullable(),
        taxClass: z
          .object({ id: z.string(), name: z.string(), rate: z.number() })
          .nullable()
          .optional(),
        sortOrder: z.number(),
        viewCount: z.number(),
        purchasedCount: z.number(),
        categories: z
          .array(
            z.object({
              category: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                parentId: z.string().nullable(),
              }),
            }),
          )
          .optional(),
        filterValues: z
          .array(
            z.object({
              filterValue: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                filterGroupId: z.string(),
              }),
            }),
          )
          .optional(),
        relatedProducts: z
          .array(
            z.object({
              relatedProduct: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                frontImageUrl: z.string().nullable(),
              }),
              sortOrder: z.number(),
            }),
          )
          .optional(),
        variants: z.array(VariantDetailSchema).optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
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
      data: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        keyIngredients: z.string().nullable(),
        brandId: z.string().nullable(),
        brand: z
          .object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            logoUrl: z.string().nullable(),
          })
          .nullable()
          .optional(),
        isActive: z.boolean(),
        isDeleted: z.boolean(),
        frontImageUrl: z.string().nullable(),
        tags: z.array(z.string()),
        metaTitle: z.string().nullable(),
        metaDescription: z.string().nullable(),
        metaKeywords: z.string().nullable(),
        seoKeyword: z.string().nullable(),
        model: z.string().nullable(),
        ean: z.string().nullable(),
        requiresShipping: z.boolean(),
        outOfStockStatus: OutOfStockStatusEnum,
        dimensionLength: z.number().nullable(),
        dimensionWidth: z.number().nullable(),
        dimensionHeight: z.number().nullable(),
        lengthClassId: z.string().nullable(),
        weightGrams: z.number().nullable(),
        weightClassId: z.string().nullable(),
        taxClassId: z.string().nullable(),
        taxClass: z
          .object({ id: z.string(), name: z.string(), rate: z.number() })
          .nullable()
          .optional(),
        sortOrder: z.number(),
        viewCount: z.number(),
        purchasedCount: z.number(),
        categories: z
          .array(
            z.object({
              category: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                parentId: z.string().nullable(),
              }),
            }),
          )
          .optional(),
        filterValues: z
          .array(
            z.object({
              filterValue: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                filterGroupId: z.string(),
              }),
            }),
          )
          .optional(),
        relatedProducts: z
          .array(
            z.object({
              relatedProduct: z.object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                frontImageUrl: z.string().nullable(),
              }),
              sortOrder: z.number(),
            }),
          )
          .optional(),
        variants: z.array(VariantDetailSchema).optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
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
      data: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            brandId: z.string().nullable(),
            brand: z
              .object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                logoUrl: z.string().nullable(),
              })
              .nullable()
              .optional(),
            taxClassId: z.string().nullable(),
            taxClass: z
              .object({ id: z.string(), name: z.string(), rate: z.number() })
              .nullable()
              .optional(),
            lengthClassId: z.string().nullable(),
            lengthClass: z
              .object({ id: z.string(), name: z.string(), unit: z.string() })
              .nullable()
              .optional(),
            weightClassId: z.string().nullable(),
            weightClass: z
              .object({ id: z.string(), name: z.string(), unit: z.string() })
              .nullable()
              .optional(),
            categories: z
              .array(
                z.object({
                  category: z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    parentId: z.string().nullable(),
                  }),
                }),
              )
              .optional(),
            filterValues: z
              .array(
                z.object({
                  filterValue: z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    filterGroupId: z.string(),
                  }),
                }),
              )
              .optional(),
            isActive: z.boolean(),
            frontImageUrl: z.string().nullable(),
            sortOrder: z.number(),
            outOfStockStatus: OutOfStockStatusEnum,
            createdAt: z.date(),
            updatedAt: z.date(),
            variants: z.array(VariantListItemSchema),
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
      data: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            brandId: z.string().nullable(),
            brand: z
              .object({
                id: z.string(),
                name: z.string(),
                slug: z.string(),
                logoUrl: z.string().nullable(),
              })
              .nullable()
              .optional(),
            taxClassId: z.string().nullable(),
            taxClass: z
              .object({ id: z.string(), name: z.string(), rate: z.number() })
              .nullable()
              .optional(),
            lengthClassId: z.string().nullable(),
            lengthClass: z
              .object({ id: z.string(), name: z.string(), unit: z.string() })
              .nullable()
              .optional(),
            weightClassId: z.string().nullable(),
            weightClass: z
              .object({ id: z.string(), name: z.string(), unit: z.string() })
              .nullable()
              .optional(),
            categories: z
              .array(
                z.object({
                  category: z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    parentId: z.string().nullable(),
                  }),
                }),
              )
              .optional(),
            filterValues: z
              .array(
                z.object({
                  filterValue: z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    filterGroupId: z.string(),
                  }),
                }),
              )
              .optional(),
            isActive: z.boolean(),
            frontImageUrl: z.string().nullable(),
            sortOrder: z.number(),
            outOfStockStatus: OutOfStockStatusEnum,
            createdAt: z.date(),
            updatedAt: z.date(),
            variants: z.array(VariantListItemSchema),
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
      data: z.object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            slug: z.string(),
            description: z.string().nullable(),
            brandId: z.string().nullable(),
            isActive: z.boolean(),
            frontImageUrl: z.string().nullable(),
            sortOrder: z.number(),
            createdAt: z.date(),
            updatedAt: z.date(),
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
      data: z.array(VariantDetailSchema),
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
  [K in keyof typeof ProductTypes]: z.infer<(typeof ProductTypes)[K]["response"]>;
};