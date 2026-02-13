import { z } from "zod";

export const ProductTypes = {
  GetProducts: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      search: z.string().optional(),
      categoryId: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      brand: z.string().optional(),
      inStock: z.coerce.boolean().optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        data: z.array(z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
          brand: z.string().nullable(),
          isActive: z.boolean(),
          categoryId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
          variants: z.array(z.object({
            id: z.string(),
            sku: z.string(),
            shade: z.string().nullable(),
            size: z.string().nullable(),
            price: z.number(),
            stock: z.number(),
          })),
        })),
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
      id: z.string(),
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
        brand: z.string().nullable(),
        isActive: z.boolean(),
        categoryId: z.string(),
        category: z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
        }).optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
        variants: z.array(z.object({
          id: z.string(),
          sku: z.string(),
          shade: z.string().nullable(),
          size: z.string().nullable(),
          price: z.number(),
          stock: z.number(),
          images: z.array(z.object({
            id: z.string(),
            url: z.string(),
            isPrimary: z.boolean(),
            altText: z.string().nullable(),
          })).optional(),
        })).optional(),
      }),
    }),
  },

  GetProductBySlug: {
    body: z.object({}),
    params: z.object({
      slug: z.string(),
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
        brand: z.string().nullable(),
        isActive: z.boolean(),
        categoryId: z.string(),
        category: z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
        }).optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
        variants: z.array(z.object({
          id: z.string(),
          sku: z.string(),
          shade: z.string().nullable(),
          size: z.string().nullable(),
          price: z.number(),
          stock: z.number(),
          images: z.array(z.object({
            id: z.string(),
            url: z.string(),
            isPrimary: z.boolean(),
            altText: z.string().nullable(),
          })).optional(),
        })).optional(),
      }),
    }),
  },

  GetProductsWithCategory: {
    body: z.object({}),
    params: z.object({
      categoryId: z.string(),
    }),
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        data: z.array(z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
          brand: z.string().nullable(),
          isActive: z.boolean(),
          categoryId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })),
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
        data: z.array(z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
          brand: z.string().nullable(),
          isActive: z.boolean(),
          categoryId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })),
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
        data: z.array(z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
          brand: z.string().nullable(),
          isActive: z.boolean(),
          categoryId: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })),
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
      productId: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(z.object({
        id: z.string(),
        sku: z.string(),
        shade: z.string().nullable(),
        size: z.string().nullable(),
        price: z.number(),
        stock: z.number(),
        images: z.array(z.object({
          id: z.string(),
          url: z.string(),
          isPrimary: z.boolean(),
          altText: z.string().nullable(),
        })),
      })),
    }),
  },

  // Admin types
  GetAllProductsAdmin: {
    body: z.object({}),
    params: z.object({}),
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        data: z.array(z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
          brand: z.string().nullable(),
          isActive: z.boolean(),
          categoryId: z.string(),
          isDeleted: z.boolean(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })),
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
      name: z.string().min(1).max(255),
      slug: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      brand: z.string().optional(),
      categoryId: z.string(),
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
        brand: z.string().nullable(),
        isActive: z.boolean(),
        categoryId: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  UpdateProduct: {
    body: z.object({
      name: z.string().min(1).max(255).optional(),
      slug: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      brand: z.string().optional(),
      categoryId: z.string().optional(),
      isActive: z.coerce.boolean().optional(),
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
        name: z.string(),
        slug: z.string(),
        description: z.string().nullable(),
        brand: z.string().nullable(),
        isActive: z.boolean(),
        categoryId: z.string(),
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
      sku: z.string().min(1).max(100),
      shade: z.string().optional(),
      size: z.string().optional(),
      price: z.coerce.number().min(0),
      stock: z.coerce.number().min(0).default(0),
    }),
    params: z.object({
      productId: z.string(),
    }),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        sku: z.string(),
        shade: z.string().nullable(),
        size: z.string().nullable(),
        price: z.number(),
        stock: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  UpdateProductVariant: {
    body: z.object({
      sku: z.string().min(1).max(100).optional(),
      shade: z.string().optional(),
      size: z.string().optional(),
      price: z.coerce.number().min(0).optional(),
      stock: z.coerce.number().min(0).optional(),
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
        sku: z.string(),
        shade: z.string().nullable(),
        size: z.string().nullable(),
        price: z.number(),
        stock: z.number(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },

  AddProductImage: {
    body: z.object({
      url: z.string().url(),
      altText: z.string().optional(),
    }),
    params: z.object({
      variantId: z.string(),
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
      imageId: z.string(),
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
      newStock: z.coerce.number().min(0),
    }),
    params: z.object({
      variantId: z.string(),
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
    body: z.array(z.object({
      variantId: z.string(),
      newStock: z.coerce.number().min(0),
    })),
    params: z.object({}),
    query: z.object({}),
    response: z.object({
      message: z.string(),
      success: z.boolean(),
      data: z.array(z.object({
        id: z.string(),
        stock: z.number(),
      })),
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

  // TODO: Add validation schemas for future features
  // - BulkProductOperations
  // - ProductAnalytics
  // - ProductReviews
  // - CategoryManagement
  // - BulkImport
  // - BulkExport
  // - SearchSuggestions
  // - ImageUpload (multipart/form-data)
  // - AdvancedFiltering
  // - ProductRecommendations
};