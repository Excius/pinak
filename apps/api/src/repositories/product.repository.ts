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
      ...(pagination.search && {
        OR: [
          { name: { contains: pagination.search, mode: "insensitive" } },
          { description: { contains: pagination.search, mode: "insensitive" } },
          { tags: { hasSome: [pagination.search] } },
        ],
      }),
      ...(pagination.categoryId && {
        categories: { some: { categoryId: pagination.categoryId } },
      }),
      ...(pagination.brand && {
        brand: { OR: [{ slug: pagination.brand }, { name: pagination.brand }] },
      }),
      // Filter by faceted filter values (AND across multiple values)
      ...(pagination.filterValueIds &&
        pagination.filterValueIds.length > 0 && {
          AND: pagination.filterValueIds.map((fvId) => ({
            filterValues: { some: { filterValueId: fvId } },
          })),
        }),
      // Price / stock / tags filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock ||
        pagination.tags) && {
        variants: {
          some: {
            isDeleted: false,
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
            ...(pagination.tags && { tags: { hasSome: pagination.tags } }),
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
            brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
            taxClass: { select: { id: true, name: true, rate: true } },
            lengthClass: { select: { id: true, name: true, unit: true } },
            weightClass: { select: { id: true, name: true, unit: true } },
            categories: { include: { category: true } },
            filterValues: { include: { filterValue: true } },
            variants: {
              where: pagination.inStock
                ? { stock: { gt: 0 }, isDeleted: false }
                : { isDeleted: false },
              take: 1, // Just get one variant for preview
              include: {
                images: {
                  where: { isPrimary: true, isDeleted: false },
                  take: 1,
                },
                optionValues: {
                  include: { optionValue: { include: { option: true } } },
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
      include: {
        brand: true,
        taxClass: true,
        lengthClass: true,
        weightClass: true,
        categories: { include: { category: true } },
        filterValues: { include: { filterValue: true } },
        relatedProducts: {
          include: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                frontImageUrl: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isDeleted: false },
          include: {
            images: {
              where: { isDeleted: false },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            },
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        },
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
      categories: { some: { categoryId } },
      isDeleted: false,
      ...(pagination.isActive !== undefined && {
        isActive: pagination.isActive,
      }),
      ...(pagination.brand && {
        brand: { OR: [{ slug: pagination.brand }, { name: pagination.brand }] },
      }),
      // Faceted filter values (AND across all selected values)
      ...(pagination.filterValueIds &&
        pagination.filterValueIds.length > 0 && {
          AND: pagination.filterValueIds.map((fvId) => ({
            filterValues: { some: { filterValueId: fvId } },
          })),
        }),
      // Price / stock / tags filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock ||
        pagination.tags) && {
        variants: {
          some: {
            isDeleted: false,
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
            ...(pagination.tags && { tags: { hasSome: pagination.tags } }),
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
            brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
            taxClass: { select: { id: true, name: true, rate: true } },
            lengthClass: { select: { id: true, name: true, unit: true } },
            weightClass: { select: { id: true, name: true, unit: true } },
            categories: { include: { category: true } },
            filterValues: { include: { filterValue: true } },
            variants: {
              where: pagination.inStock
                ? { stock: { gt: 0 }, isDeleted: false }
                : { isDeleted: false },
              take: 1, // Just get one variant for preview
              include: {
                images: {
                  where: { isPrimary: true, isDeleted: false },
                  take: 1,
                },
                optionValues: {
                  include: { optionValue: { include: { option: true } } },
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
              brand: { select: { id: true, name: true, slug: true, logoUrl: true } };
              taxClass: { select: { id: true, name: true, rate: true } };
              lengthClass: { select: { id: true, name: true, unit: true } };
              weightClass: { select: { id: true, name: true, unit: true } };
              categories: { include: { category: true } };
              filterValues: { include: { filterValue: true } };
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
                brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
                taxClass: { select: { id: true, name: true, rate: true } },
                lengthClass: { select: { id: true, name: true, unit: true } },
                weightClass: { select: { id: true, name: true, unit: true } },
                categories: { include: { category: true } },
                filterValues: { include: { filterValue: true } },
                variants: {
                  where: { stock: { gt: 0 } },
                  orderBy: { price: "asc" },
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
              categories: { include: { category: true } };
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
                categories: { include: { category: true } },
                variants: {
                  where: { stock: { gt: 0 } },
                  orderBy: { price: "asc" },
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
      include: {
        images: true,
        optionValues: {
          include: { optionValue: { include: { option: true } } },
        },
      },
    });
  }

  getProductWithDetails(id: string) {
    return this.prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        brand: true,
        categories: { include: { category: true } },
        taxClass: true,
        lengthClass: true,
        weightClass: true,
        filterValues: { include: { filterValue: true } },
        relatedProducts: {
          include: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                frontImageUrl: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isDeleted: false },
          include: {
            images: {
              where: { isDeleted: false },
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            },
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        },
      },
    });
  }

  // Admin-specific methods
  getProductByIdAdmin(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        taxClass: true,
        lengthClass: true,
        weightClass: true,
        categories: { include: { category: true } },
        filterValues: {
          include: { filterValue: { include: { filterGroup: true } } },
        },
        variants: {
          include: {
            images: true,
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        },
        relatedProducts: {
          include: {
            relatedProduct: {
              select: {
                id: true,
                name: true,
                slug: true,
                frontImageUrl: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        relatedTo: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                frontImageUrl: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        featuredProducts: {
          include: { section: true },
        },
      },
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
      ...(pagination.search && {
        OR: [
          { name: { contains: pagination.search, mode: "insensitive" } },
          { description: { contains: pagination.search, mode: "insensitive" } },
        ],
      }),
      ...(pagination.categoryId && {
        categories: { some: { categoryId: pagination.categoryId } },
      }),
      ...(pagination.brand && {
        brand: { OR: [{ slug: pagination.brand }, { name: pagination.brand }] },
      }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock ||
        pagination.tags) && {
        variants: {
          some: {
            isDeleted: false,
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
            ...(pagination.tags && { tags: { hasSome: pagination.tags } }),
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
            brand: { select: { id: true, name: true, slug: true } },
            variants: {
              where: { isDeleted: false },
              include: {
                images: { where: { isDeleted: false } },
                optionValues: {
                  include: { optionValue: { include: { option: true } } },
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

  getDeletedProductsAdmin(pagination: ProductPaginationOptions) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const orderBy: Prisma.ProductOrderByWithRelationInput = pagination.sortBy
      ? { [pagination.sortBy]: pagination.sortOrder || "asc" }
      : { createdAt: "desc" };

    const where: Prisma.ProductWhereInput = {
      isDeleted: true,
      ...(pagination.categoryId && {
        categories: { some: { categoryId: pagination.categoryId } },
      }),
      ...(pagination.brand && {
        brand: { OR: [{ slug: pagination.brand }, { name: pagination.brand }] },
      }),
      // Price filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock ||
        pagination.tags) && {
        variants: {
          some: {
            ...(pagination.minPrice && { price: { gte: pagination.minPrice } }),
            ...(pagination.maxPrice && { price: { lte: pagination.maxPrice } }),
            ...(pagination.inStock && { stock: { gt: 0 } }),
            ...(pagination.tags && { tags: { hasSome: pagination.tags } }),
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
      ...(pagination.categoryId && {
        categories: { some: { categoryId: pagination.categoryId } },
      }),
      ...(pagination.brand && {
        brand: { OR: [{ slug: pagination.brand }, { name: pagination.brand }] },
      }),
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

  incrementProductViewCount(productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  }

  incrementProductPurchasedCount(productId: string, quantity = 1) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { purchasedCount: { increment: quantity } },
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
    // If image is primary, perform both unset + create in a single transaction to avoid races
    if (data.isPrimary) {
      return this.prisma.$transaction(async (tx) => {
        await tx.productImage.updateMany({
          where: { productVariantId: variantId, isPrimary: true },
          data: { isPrimary: false },
        });
        return tx.productImage.create({
          data: { ...data, variant: { connect: { id: variantId } } },
        });
      });
    }

    return this.prisma.productImage.create({
      data: { ...data, variant: { connect: { id: variantId } } },
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

  // ── Service-layer validation helpers ──────────────────────────────────────

  /** Fetch a single variant by PK (no soft-delete filter — for admin validation). */
  getVariantById(id: string) {
    return this.prisma.productVariant.findUnique({ where: { id } });
  }

  /** Check SKU uniqueness across all variants. */
  findVariantBySku(sku: string) {
    return this.prisma.productVariant.findUnique({ where: { sku } });
  }

  /** Fetch a product image row by PK. */
  getProductImageById(id: string) {
    return this.prisma.productImage.findUnique({ where: { id } });
  }

  /** Resolve legacy size/shade strings to the matching OptionValue row. */
  findOptionValueByNameAndValue(optionName: string, value: string) {
    return this.prisma.optionValue.findFirst({
      where: { value, option: { name: optionName } },
      include: { option: true },
    });
  }

  /** Fetch OptionValues with their parent Option (used in SKU generation). */
  findOptionValuesWithOptions(ids: string[]) {
    return this.prisma.optionValue.findMany({
      where: { id: { in: ids } },
      include: { option: true },
    });
  }

  /** Look up a Brand by its PK. */
  findBrandById(id: string) {
    return this.prisma.brand.findUnique({ where: { id } });
  }

  /** Look up a Brand by slug or name (first match). */
  findBrandBySlugOrName(slugOrName: string) {
    return this.prisma.brand.findFirst({
      where: { OR: [{ slug: slugOrName }, { name: slugOrName }] },
    });
  }

  /** Create a new Brand row. */
  createBrand(name: string, slug: string) {
    return this.prisma.brand.create({ data: { name, slug } });
  }

  /** Look up a Category by PK (for existence checks inside the product service). */
  findCategoryById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  /** Look up a FeaturedSection by PK. */
  getFeaturedSectionById(id: string) {
    return this.prisma.featuredSection.findUnique({ where: { id } });
  }

  /** Check whether a product is already present in a featured section. */
  isProductInFeaturedSection(sectionId: string, productId: string) {
    return this.prisma.featuredProduct.findFirst({
      where: { sectionId, productId },
    });
  }

  /**
   * Count active references that block a **soft**-delete of a variant:
   * returns [cartCount, orderCount, reservationCount, wishlistCount, comboKitCount].
   */
  getVariantSoftDeleteDependencies(id: string) {
    return Promise.all([
      this.prisma.cartItem.count({ where: { productVariantId: id } }),
      this.prisma.orderItem.count({
        where: {
          productVariantId: id,
          order: { isDeleted: false, status: { not: "CANCELLED" } },
        },
      }),
      this.prisma.inventoryReservation.count({
        where: { productVariantId: id, expiresAt: { gt: new Date() } },
      }),
      this.prisma.wishlistItem.count({ where: { productVariantId: id } }),
      this.prisma.comboKitItem.count({ where: { productVariantId: id } }),
    ]);
  }

  /**
   * Count all references that block a **hard**-delete of a variant:
   * returns [cartCount, orderCount, wishlistCount, reservationCount, comboKitCount, imageCount].
   */
  getVariantHardDeleteDependencies(id: string) {
    return Promise.all([
      this.prisma.cartItem.count({ where: { productVariantId: id } }),
      this.prisma.orderItem.count({
        where: {
          productVariantId: id,
          order: { isDeleted: false, status: { not: "CANCELLED" } },
        },
      }),
      this.prisma.wishlistItem.count({ where: { productVariantId: id } }),
      this.prisma.inventoryReservation.count({
        where: { productVariantId: id },
      }),
      this.prisma.comboKitItem.count({ where: { productVariantId: id } }),
      this.prisma.productImage.count({ where: { productVariantId: id } }),
    ]);
  }

  /**
   * Collect all dependency counts needed before hard-deleting a product.
   * Returns a structured object rather than a positional array for clarity.
   */
  async getProductHardDeleteDependencies(id: string) {
    const variantRows = await this.prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const variantIds = variantRows.map((v) => v.id);

    const [
      productOrderCount,
      variantOrderCount,
      cartCount,
      wishlistCount,
      reservationCount,
      featuredCount,
      reviewCount,
      comboKitCount,
      activeVariantCount,
    ] = await Promise.all([
      this.prisma.orderItem.count({
        where: {
          productId: id,
          order: { isDeleted: false, status: { not: "CANCELLED" } },
        },
      }),
      variantIds.length
        ? this.prisma.orderItem.count({
            where: {
              productVariantId: { in: variantIds },
              order: { isDeleted: false, status: { not: "CANCELLED" } },
            },
          })
        : Promise.resolve(0),
      variantIds.length
        ? this.prisma.cartItem.count({
            where: { productVariantId: { in: variantIds } },
          })
        : Promise.resolve(0),
      variantIds.length
        ? this.prisma.wishlistItem.count({
            where: { productVariantId: { in: variantIds } },
          })
        : Promise.resolve(0),
      variantIds.length
        ? this.prisma.inventoryReservation.count({
            where: { productVariantId: { in: variantIds } },
          })
        : Promise.resolve(0),
      this.prisma.featuredProduct.count({ where: { productId: id } }),
      this.prisma.review.count({ where: { productId: id } }),
      variantIds.length
        ? this.prisma.comboKitItem.count({
            where: { productVariantId: { in: variantIds } },
          })
        : Promise.resolve(0),
      this.prisma.productVariant.count({
        where: { productId: id, isDeleted: false },
      }),
    ]);

    return {
      productOrderCount,
      variantOrderCount,
      cartCount,
      wishlistCount,
      reservationCount,
      featuredCount,
      reviewCount,
      comboKitCount,
      activeVariantCount,
    };
  }
}
