import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import {
  ProductPaginationOptions,
  PaginatedResponse,
} from "../types/pagination.types.js";
import { NotFoundError } from "../lib/error.js";

// TODO: Implement analytics and reporting features
// - Product view tracking and analytics
// - Sales performance metrics
// - Inventory movement reports
// - Product popularity analytics
// - Category performance reports
// - Stock level reporting
// - Product lifecycle analytics

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  // Expose prisma client for service layer business logic
  get prismaClient() {
    return this.prisma;
  }
  /**
   * Fetch a product by its ID, ensuring it's not marked as deleted.
   * @param id
   * @returns
   */
  getProductById(id: string) {
    return this.prisma.product.findFirst({
      where: { id, isDeleted: false },
    });
  }

  getProducts(pagination: ProductPaginationOptions) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(pagination.isActive !== undefined && {
        isActive: pagination.isActive,
      }),
      ...(pagination.categoryId && { categoryId: pagination.categoryId }),
      ...(pagination.brand && { brand: pagination.brand }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock) && {
        variants: {
          some: {
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
          },
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = pagination.sortBy
      ? { [pagination.sortBy]: pagination.sortOrder || "asc" }
      : { createdAt: "desc" };

    return this.prisma.$transaction(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            variants: {
              where: pagination.inStock ? { stock: { gt: 0 } } : {},
              take: 1, // Just get one variant for preview
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        }),
        tx.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: products,
        pagination: {
          page: pagination.page,
          limit: take,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      };
    });
  }

  /**
   * Fetch a product by its slug, ensuring it's not marked as deleted.
   * @param slug
   * @returns
   */
  getProductBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: {
        slug,
        isDeleted: false,
      },
    });
  }

  /**
   * Fetch products by category with pagination, filtering, and sorting options.
   * @param categoryId
   * @param pagination
   * @returns
   */
  getProductsWithCategory(
    categoryId: string,
    pagination: ProductPaginationOptions,
  ): Promise<
    PaginatedResponse<
      Prisma.ProductGetPayload<{
        include: {
          variants: {
            include: {
              images: true;
            };
          };
        };
      }>
    >
  > {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    // Build where clause with proper typing
    const where: Prisma.ProductWhereInput = {
      categoryId,
      isDeleted: false,
      ...(pagination.isActive !== undefined && {
        isActive: pagination.isActive,
      }),
      ...(pagination.brand && { brand: pagination.brand }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock) && {
        variants: {
          some: {
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
          },
        },
      }),
    };

    // Build orderBy with proper typing
    const orderBy: Prisma.ProductOrderByWithRelationInput = pagination.sortBy
      ? { [pagination.sortBy]: pagination.sortOrder || "asc" }
      : { createdAt: "desc" };

    return this.prisma.$transaction(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            variants: {
              where: pagination.inStock ? { stock: { gt: 0 } } : {},
              take: 1, // Just get one variant for preview
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        }),
        tx.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: products,
        pagination: {
          page: pagination.page,
          limit: take,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      };
    });
  }

  /**
   * Fetch featured products for a given section type with pagination.
   * @param sectionType
   * @param pagination
   * @returns
   */
  getFeaturedProducts(
    pagination?: ProductPaginationOptions,
    sectionId?: string,
  ): Promise<
    PaginatedResponse<
      Prisma.FeaturedProductGetPayload<{
        include: {
          product: {
            include: {
              category: true;
              variants: {
                include: { images: true };
              };
            };
          };
          section: true;
        };
      }>
    >
  > {
    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 20;

    const where: Prisma.FeaturedProductWhereInput = sectionId
      ? {
          sectionId,
        }
      : {};

    const orderBy: Prisma.FeaturedProductOrderByWithRelationInput[] = [
      { section: { priority: "desc" } },
      { createdAt: "desc" },
    ];

    return this.prisma.$transaction(async (tx) => {
      const [featuredProducts, total] = await Promise.all([
        tx.featuredProduct.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            product: {
              include: {
                category: true,
                variants: {
                  where: { stock: { gt: 0 } },
                  take: 1,
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            section: true,
          },
        }),
        tx.featuredProduct.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: featuredProducts,
        pagination: {
          page: pagination?.page || 1,
          limit: take,
          total,
          totalPages,
          hasNext: (pagination?.page || 1) < totalPages,
          hasPrev: (pagination?.page || 1) > 1,
        },
      };
    });
  }

  /**
   * Fetch featured products for a specific section ID with pagination.
   * @param sectionId
   * @param pagination
   * @returns
   */
  getFeaturedProductsBySection(
    sectionId: string,
    pagination?: ProductPaginationOptions,
  ): Promise<
    PaginatedResponse<
      Prisma.FeaturedProductGetPayload<{
        include: {
          product: {
            include: {
              category: true;
              variants: {
                include: { images: true };
              };
            };
          };
          section: true;
        };
      }>
    >
  > {
    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 20;

    const orderBy: Prisma.FeaturedProductOrderByWithRelationInput = {
      createdAt: "desc",
    };

    return this.prisma.$transaction(async (tx) => {
      const [featuredProducts, total] = await Promise.all([
        tx.featuredProduct.findMany({
          where: { sectionId },
          skip,
          take,
          orderBy,
          include: {
            product: {
              include: {
                category: true,
                variants: {
                  where: { stock: { gt: 0 } },
                  take: 1,
                  include: {
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            section: true,
          },
        }),
        tx.featuredProduct.count({ where: { sectionId } }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: featuredProducts,
        pagination: {
          page: pagination?.page || 1,
          limit: take,
          total,
          totalPages,
          hasNext: (pagination?.page || 1) < totalPages,
          hasPrev: (pagination?.page || 1) > 1,
        },
      };
    });
  }

  searchProducts(query: string, filters: Prisma.ProductWhereInput) {
    return this.prisma.product.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        isDeleted: false,
        ...filters,
      },
    });
  }

  getProductVariants(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId, isDeleted: false },
      include: { images: true },
    });
  }

  getProductWithDetails(id: string) {
    return this.prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: true,
        variants: {
          where: { stock: { gt: 0 } },
          include: {
            images: true,
          },
        },
      },
    });
  }

  // Admin-specific methods
  getProductByIdAdmin(id: string) {
    return this.prisma.product.findFirst({
      where: { id },
    });
  }

  getAllProductsAdmin(pagination: ProductPaginationOptions) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(pagination.isActive !== undefined && {
        isActive: pagination.isActive,
      }),
      ...(pagination.categoryId && { categoryId: pagination.categoryId }),
      ...(pagination.brand && { brand: pagination.brand }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock) && {
        variants: {
          some: {
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
          },
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = pagination.sortBy
      ? { [pagination.sortBy]: pagination.sortOrder || "asc" }
      : { createdAt: "desc" };

    return this.prisma.$transaction(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            variants: {
              include: {
                images: true,
              },
            },
          },
        }),
        tx.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: products,
        pagination: {
          page: pagination.page,
          limit: take,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      };
    });
  }

  getDeletedProductsAdmin(pagination: ProductPaginationOptions) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const orderBy: Prisma.ProductOrderByWithRelationInput = pagination.sortBy
      ? { [pagination.sortBy]: pagination.sortOrder || "asc" }
      : { createdAt: "desc" };

    const where: Prisma.ProductWhereInput = {
      isDeleted: true,
      ...(pagination.categoryId && { categoryId: pagination.categoryId }),
      ...(pagination.brand && { brand: pagination.brand }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock) && {
        variants: {
          some: {
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
          },
        },
      }),
    };

    return this.prisma.$transaction(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            variants: {
              include: {
                images: true,
              },
            },
          },
        }),
        tx.product.count({ where: { isDeleted: true } }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: products,
        pagination: {
          page: pagination.page,
          limit: take,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      };
    });
  }

  getProductsByStatusAdmin(
    status: "ACTIVE" | "INACTIVE",
    pagination: ProductPaginationOptions,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      isActive: status === "ACTIVE",
      ...(pagination.categoryId && { categoryId: pagination.categoryId }),
      ...(pagination.brand && { brand: pagination.brand }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock) && {
        variants: {
          some: {
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
          },
        },
      }),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = pagination.sortBy
      ? { [pagination.sortBy]: pagination.sortOrder || "asc" }
      : { createdAt: "desc" };

    return this.prisma.$transaction(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            variants: {
              include: {
                images: true,
              },
            },
          },
        }),
        tx.product.count({ where }),
      ]);

      const totalPages = Math.ceil(total / take);

      return {
        data: products,
        pagination: {
          page: pagination.page,
          limit: take,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      };
    });
  }

  // Create/Update Operations admin methods
  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
    });
  }

  updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  updateProductStatus(id: string, isActive: boolean) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
  }

  createProductVariant(
    productId: string,
    data: Prisma.ProductVariantCreateInput,
  ) {
    return this.prisma.productVariant.create({
      data: {
        ...data,
        product: { connect: { id: productId } },
      },
    });
  }

  updateProductVariant(id: string, data: Prisma.ProductVariantUpdateInput) {
    return this.prisma.productVariant.update({
      where: { id },
      data,
    });
  }

  addProductImage(variantId: string, data: Prisma.ProductImageCreateInput) {
    return this.prisma.productImage.create({
      data: {
        ...data,
        variant: { connect: { id: variantId } },
      },
    });
  }

  setPrimaryImage(imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findUnique({
        where: { id: imageId },
        include: { variant: true },
      });

      if (!image) {
        throw new NotFoundError("Image not found");
      }

      // Unset previous primary image
      await tx.productImage.updateMany({
        where: {
          productVariantId: image.productVariantId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });

      // Set new primary image
      return tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  softDeleteProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restoreProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  softDeleteProductVariant(id: string) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restoreProductVariant(id: string) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  softDeleteImage(id: string) {
    return this.prisma.productImage.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  restoreImage(id: string) {
    return this.prisma.productImage.update({
      where: { id },
      data: { isDeleted: false },
    });
  }

  addProductToFeatured(sectionId: string, productId: string) {
    return this.prisma.featuredProduct.create({
      data: {
        section: { connect: { id: sectionId } },
        product: { connect: { id: productId } },
      },
    });
  }

  removeProductFromFeatured(featuredProductId: string) {
    return this.prisma.featuredProduct.delete({
      where: { id: featuredProductId },
    });
  }

  getOutOfStockProducts() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        variants: {
          some: {
            stock: 0,
          },
        },
      },
      include: {
        variants: {
          where: { stock: 0 },
          include: { images: true },
        },
      },
    });
  }

  getLowStockProducts(threshold: number) {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        variants: {
          some: {
            stock: { gt: 0, lte: threshold },
          },
        },
      },
      include: {
        variants: {
          where: { stock: { gt: 0, lte: threshold } },
          include: { images: true },
        },
      },
    });
  }

  updateVariantStock(variantId: string, newStock: number) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });
  }

  bulkUpdateVariantStock(updates: { variantId: string; newStock: number }[]) {
    return this.prisma.$transaction(
      updates.map((update) =>
        this.prisma.productVariant.update({
          where: { id: update.variantId },
          data: { stock: update.newStock },
        }),
      ),
    );
  }

  hardDeleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  hardDeleteProductVariant(id: string) {
    return this.prisma.productVariant.delete({
      where: { id },
    });
  }

  hardDeleteImage(id: string) {
    return this.prisma.productImage.delete({
      where: { id },
    });
  }
}
