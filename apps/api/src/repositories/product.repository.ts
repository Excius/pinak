import { PrismaClient, Prisma } from "../generated/prisma/client.js";
import {
  ProductPaginationOptions,
  PaginatedResponse,
} from "../types/pagination.types.js";
import { NotFoundError } from "../lib/error.js";
import { syncProductFilterIndex } from "../lib/filterIndex.js";

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

  /**
   * Runs read-only queries (e.g. list + count) on the shared pool. These used to run in an
   * interactive transaction, which pins a connection and made busy pages fail with P2028.
   */
  private runReadOnly<T>(fn: (db: PrismaClient) => Promise<T>): Promise<T> {
    return fn(this.prisma);
  }

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
      where: { id, isDeleted: false, isActive: true },
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
      // Match products containing any selected faceted filter value.
      ...(pagination.filterValueIds &&
        pagination.filterValueIds.length > 0 && {
          filterValues: {
            some: { filterValueId: { in: pagination.filterValueIds } },
          },
        }),
      // Price / stock / tags filtering through variants
      ...((pagination.minPrice ||
        pagination.maxPrice ||
        pagination.inStock ||
        pagination.tags) && {
        variants: {
          some: {
            isDeleted: false,
            isActive: true,
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

    return this.runReadOnly(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            brand: {
              select: { id: true, name: true, slug: true, logoUrl: true },
            },
            taxClass: { select: { id: true, name: true, rate: true } },
            lengthClass: { select: { id: true, name: true, unit: true } },
            weightClass: { select: { id: true, name: true, unit: true } },
            categories: { include: { category: true } },
            filterValues: { include: { filterValue: true } },
            variants: {
              where: pagination.inStock
                ? { stock: { gt: 0 }, isDeleted: false, isActive: true }
                : { isDeleted: false, isActive: true },
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
        isActive: true,
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
          where: { isDeleted: false, isActive: true },
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
      // Match products containing any selected faceted filter value.
      ...(pagination.filterValueIds &&
        pagination.filterValueIds.length > 0 && {
          filterValues: {
            some: { filterValueId: { in: pagination.filterValueIds } },
          },
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

    return this.runReadOnly(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            brand: {
              select: { id: true, name: true, slug: true, logoUrl: true },
            },
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
              brand: {
                select: { id: true; name: true; slug: true; logoUrl: true };
              };
              taxClass: { select: { id: true; name: true; rate: true } };
              lengthClass: { select: { id: true; name: true; unit: true } };
              weightClass: { select: { id: true; name: true; unit: true } };
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

    return this.runReadOnly(async (tx) => {
      const [featuredProducts, total] = await Promise.all([
        tx.featuredProduct.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            product: {
              include: {
                brand: {
                  select: { id: true, name: true, slug: true, logoUrl: true },
                },
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

    return this.runReadOnly(async (tx) => {
      const [featuredProducts, total] = await Promise.all([
        tx.featuredProduct.findMany({
          where: {
            sectionId,
            product: { isDeleted: false, isActive: true },
          },
          skip,
          take,
          orderBy,
          include: {
            product: {
              include: {
                brand: {
                  select: { id: true, name: true, slug: true, logoUrl: true },
                },
                taxClass: { select: { id: true, name: true, rate: true } },
                categories: { include: { category: true } },
                variants: {
                  where: { stock: { gt: 0 }, isDeleted: false, isActive: true },
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
        isActive: true,
        ...filters,
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        taxClass: { select: { id: true, name: true, rate: true } },
        lengthClass: { select: { id: true, name: true, unit: true } },
        weightClass: { select: { id: true, name: true, unit: true } },
        categories: { include: { category: true } },
        filterValues: { include: { filterValue: true } },
        variants: {
          where: { isDeleted: false, isActive: true },
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
    });
  }

  getProductVariants(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId, isDeleted: false, isActive: true },
      // Stable order so the storefront always opens the same (first) variant
      orderBy: { createdAt: "asc" },
      include: {
        images: true,
        optionValues: {
          include: { optionValue: { include: { option: true } } },
        },
        product: { select: { taxClass: true } },
      },
    });
  }

  getProductWithDetails(id: string) {
    return this.prisma.product.findFirst({
      where: { id, isDeleted: false, isActive: true },
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
          where: { isDeleted: false, isActive: true },
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
          orderBy: { createdAt: "asc" },
          include: {
            images: true,
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
            filterValues: {
              include: { filterValue: { include: { filterGroup: true } } },
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

    return this.runReadOnly(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            brand: { select: { id: true, name: true, slug: true } },
            taxClass: { select: { id: true, name: true, rate: true } },
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

    return this.runReadOnly(async (tx) => {
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
      ...(pagination.search && {
        OR: [
          { name: { contains: pagination.search, mode: "insensitive" } },
          { description: { contains: pagination.search, mode: "insensitive" } },
          { model: { contains: pagination.search, mode: "insensitive" } },
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

    return this.runReadOnly(async (tx) => {
      const [products, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            brand: { select: { id: true, name: true, slug: true } },
            taxClass: { select: { id: true, name: true, rate: true } },
            variants: {
              where: { isDeleted: false },
              include: {
                images: { where: { isDeleted: false } },
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
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: { isActive },
      });
      await tx.productVariant.updateMany({
        where: { productId: id, isDeleted: false },
        data: { isActive },
      });
      return product;
    });
  }

  bulkUpdateProductStatus(productIds: string[], isActive: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const productResult = await tx.product.updateMany({
        where: { id: { in: productIds }, isDeleted: false },
        data: { isActive },
      });
      await tx.productVariant.updateMany({
        where: { productId: { in: productIds }, isDeleted: false },
        data: { isActive },
      });
      return productResult.count;
    });
  }

  findProductByNameOrSlug(
    name: string,
    slug: string,
    options?: { includeDeleted?: boolean },
  ) {
    return this.prisma.product.findFirst({
      where: {
        ...(options?.includeDeleted ? {} : { isDeleted: false }),
        OR: [
          { name: { equals: name.trim(), mode: "insensitive" } },
          { slug: { equals: slug.trim(), mode: "insensitive" } },
        ],
      },
      include: {
        variants: options?.includeDeleted
          ? true
          : { where: { isDeleted: false } },
        brand: true,
        taxClass: true,
      },
    });
  }

  /**
   * Check if a product slug already exists in the database (including inactive & deleted).
   */
  findProductBySlugRaw(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true, isDeleted: true, isActive: true, name: true },
    });
  }

  getProductsForExport(filters: {
    status?: "ALL" | "ACTIVE" | "INACTIVE";
    brandId?: string;
    categoryId?: string;
    search?: string;
  }) {
    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
      ...(filters.status === "ACTIVE" ? { isActive: true } : {}),
      ...(filters.status === "INACTIVE" ? { isActive: false } : {}),
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.categoryId
        ? { categories: { some: { categoryId: filters.categoryId } } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { model: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    return this.prisma.product.findMany({
      where,
      include: {
        brand: true,
        taxClass: true,
        categories: {
          include: {
            category: true,
          },
        },
        variants: {
          where: { isDeleted: false },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
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

  // Deleting/restoring a variant changes which filters its product exposes.
  softDeleteProductVariant(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id },
        data: { isDeleted: true },
      });
      await syncProductFilterIndex(tx, variant.productId);
      return variant;
    });
  }

  restoreProductVariant(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id },
        data: { isDeleted: false },
      });
      await syncProductFilterIndex(tx, variant.productId);
      return variant;
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

  /**
   * Permanently removes a product and everything that hangs off it, atomically.
   * Variants and their images have no cascade, so they are removed explicitly.
   * Order items from cancelled orders are detached from the product/variants
   * (the FKs are nullable); their original ids/SKU are written into
   * `variantDetails` so the order history stays traceable.
   *
   * Returns the image URLs stored for the product so the caller can
   * remove the files from object storage after the commit.
   */
  hardDeleteProduct(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUniqueOrThrow({
        where: { id },
        select: { frontImageUrl: true },
      });
      const variants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true, sku: true },
      });
      const variantIds = variants.map((v) => v.id);
      const skuByVariantId = new Map(variants.map((v) => [v.id, v.sku]));

      const orderItems = await tx.orderItem.findMany({
        where: {
          OR: [
            { productId: id },
            ...(variantIds.length
              ? [{ productVariantId: { in: variantIds } }]
              : []),
          ],
        },
        select: { id: true, productVariantId: true, variantDetails: true },
      });
      for (const item of orderItems) {
        const existing =
          item.variantDetails &&
          typeof item.variantDetails === "object" &&
          !Array.isArray(item.variantDetails)
            ? (item.variantDetails as Record<string, Prisma.InputJsonValue>)
            : item.variantDetails != null
              ? { previousVariantDetails: item.variantDetails as Prisma.InputJsonValue }
              : {};
        await tx.orderItem.update({
          where: { id: item.id },
          data: {
            productId: null,
            productVariantId: null,
            variantDetails: {
              ...existing,
              deletedProductId: id,
              ...(item.productVariantId
                ? {
                    deletedVariantId: item.productVariantId,
                    deletedVariantSku: skuByVariantId.get(item.productVariantId) ?? null,
                  }
                : {}),
            },
          },
        });
      }

      const imageUrls: string[] = [];
      if (product.frontImageUrl) imageUrls.push(product.frontImageUrl);

      if (variantIds.length > 0) {
        const images = await tx.productImage.findMany({
          where: { productVariantId: { in: variantIds } },
          select: { url: true },
        });
        imageUrls.push(...images.map((img) => img.url));
        await tx.productImage.deleteMany({
          where: { productVariantId: { in: variantIds } },
        });
        await tx.productVariant.deleteMany({ where: { id: { in: variantIds } } });
      }

      await tx.product.delete({ where: { id } });
      return { imageUrls };
    });
  }

  hardDeleteProductVariant(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.delete({ where: { id } });
      await syncProductFilterIndex(tx, variant.productId);
      return variant;
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

  getAllVariantImages(variantId: string) {
    return this.prisma.productImage.findMany({
      where: { productVariantId: variantId },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });
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
      where: {
        OR: [
          { slug: { equals: slugOrName.trim(), mode: "insensitive" } },
          { name: { equals: slugOrName.trim(), mode: "insensitive" } },
        ],
      },
    });
  }

  /** Create a new Brand row with unique slug guarantee. */
  async createBrand(name: string, slug: string) {
    let candidateSlug = slug;
    let counter = 1;
    while (await this.prisma.brand.findUnique({ where: { slug: candidateSlug } })) {
      candidateSlug = `${slug}-${counter}`;
      counter++;
    }
    return this.prisma.brand.create({ data: { name, slug: candidateSlug } });
  }

  /** Look up a Category by PK (for existence checks inside the product service). */
  findCategoryById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  /** Look up a Category by slug or name. */
  findCategoryBySlugOrName(slugOrName: string) {
    return this.prisma.category.findFirst({
      where: {
        OR: [
          { slug: { equals: slugOrName.trim(), mode: "insensitive" } },
          { name: { equals: slugOrName.trim(), mode: "insensitive" } },
        ],
      },
    });
  }

  /** Create a new Category with unique slug guarantee. */
  async createCategory(name: string, slug: string) {
    let candidateSlug = slug;
    let counter = 1;
    while (await this.prisma.category.findUnique({ where: { slug: candidateSlug } })) {
      candidateSlug = `${slug}-${counter}`;
      counter++;
    }
    return this.prisma.category.create({ data: { name, slug: candidateSlug } });
  }

  /** Look up a TaxClass by rate with tolerance. */
  async findTaxClassByRate(ratePercent: number) {
    const classes = await this.prisma.taxClass.findMany();
    return (
      classes.find((tc) => Math.abs(tc.rate - ratePercent) < 0.05) ?? null
    );
  }

  /** Create or find a TaxClass safely without name collisions. */
  async createTaxClass(name: string, rate: number) {
    const existing = await this.prisma.taxClass.findFirst({
      where: {
        OR: [
          { rate: { gte: rate - 0.01, lte: rate + 0.01 } },
          { name: { equals: name.trim(), mode: "insensitive" } },
        ],
      },
    });
    if (existing) return existing;
    return this.prisma.taxClass.create({ data: { name, rate } });
  }

  /**
   * Creates product and variant atomically with isActive: false (for spreadsheet import review).
   */
  async createImportedProductAndVariant(params: {
    name: string;
    slug: string;
    brandId?: string;
    taxClassId?: string;
    categoryIds?: string[];
    hsn?: string;
    mrpPaise: number;
    sellingPricePaise?: number;
    stock?: number;
    sku: string;
    ean?: string;
    weightGrams?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // In-transaction collision check for slug
      let slugToUse = params.slug;
      const existingSlug = await tx.product.findUnique({
        where: { slug: slugToUse },
        select: { id: true },
      });
      if (existingSlug) {
        slugToUse = `${slugToUse}-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;
      }

      // In-transaction collision check for SKU
      let skuToUse = params.sku;
      const existingSku = await tx.productVariant.findUnique({
        where: { sku: skuToUse },
        select: { id: true },
      });
      if (existingSku) {
        skuToUse = `${skuToUse}-${Date.now().toString(36)}`;
      }

      const product = await tx.product.create({
        data: {
          name: params.name,
          slug: slugToUse,
          brandId: params.brandId,
          taxClassId: params.taxClassId,
          model: params.hsn,
          tags: params.hsn ? [`HSN:${params.hsn}`] : [],
          requiresShipping: true,
          isActive: false, // Inactive on import so admin can review and activate
          isDeleted: false,
          ...(params.categoryIds?.length
            ? {
                categories: {
                  create: params.categoryIds.map((categoryId) => ({ categoryId })),
                },
              }
            : {}),
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: skuToUse,
          price: params.mrpPaise,
          sellingPrice: params.sellingPricePaise ?? null,
          stock: params.stock ?? 0,
          ean: params.ean ?? null,
          weightGrams: params.weightGrams ?? null,
          isActive: false, // Inactive on import
          isDeleted: false,
        },
      });

      return { product, variant };
    });
  }

  /**
   * Updates existing product and its variant for spreadsheet import.
   * Restores isDeleted: false if the product or variant was soft-deleted.
   */
  async updateImportedProductAndVariant(params: {
    productId: string;
    variantId?: string;
    /** Always add a new variant (new SKU on an existing product) instead of updating one. */
    createVariant?: boolean;
    brandId?: string;
    taxClassId?: string;
    categoryIds?: string[];
    hsn?: string;
    mrpPaise: number;
    sellingPricePaise?: number;
    stock?: number;
    sku?: string;
    ean?: string;
    weightGrams?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.product.findUniqueOrThrow({
        where: { id: params.productId },
        select: { isDeleted: true, tags: true },
      });
      const wasDeleted = current.isDeleted;

      const product = await tx.product.update({
        where: { id: params.productId },
        data: {
          isDeleted: false, // restore if soft-deleted
          // A restored product goes back through review rather than straight to the storefront
          ...(wasDeleted ? { isActive: false } : {}),
          ...(params.brandId ? { brandId: params.brandId } : {}),
          ...(params.taxClassId ? { taxClassId: params.taxClassId } : {}),
          ...(params.hsn
            ? {
                model: params.hsn,
                tags: [
                  ...current.tags.filter((t) => !t.startsWith("HSN:")),
                  `HSN:${params.hsn}`,
                ],
              }
            : {}),
        },
      });

      if (params.categoryIds?.length) {
        // Additive: existing category links are kept, duplicates ignored
        await tx.productCategory.createMany({
          data: params.categoryIds.map((categoryId) => ({
            productId: params.productId,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }

      let variant;
      if (params.variantId && !params.createVariant) {
        const currentVariant = await tx.productVariant.findUniqueOrThrow({
          where: { id: params.variantId },
          select: { isDeleted: true },
        });
        variant = await tx.productVariant.update({
          where: { id: params.variantId },
          data: {
            isDeleted: false, // restore if soft-deleted
            ...(currentVariant.isDeleted || wasDeleted ? { isActive: false } : {}),
            price: params.mrpPaise,
            ...(params.sellingPricePaise !== undefined
              ? { sellingPrice: params.sellingPricePaise }
              : {}),
            ...(params.stock !== undefined ? { stock: params.stock } : {}),
            ...(params.ean ? { ean: params.ean } : {}),
            ...(params.weightGrams ? { weightGrams: params.weightGrams } : {}),
          },
        });
      } else {
        const firstVariant = params.createVariant
          ? null
          : await tx.productVariant.findFirst({
              where: { productId: params.productId },
            });
        if (firstVariant) {
          variant = await tx.productVariant.update({
            where: { id: firstVariant.id },
            data: {
              isDeleted: false, // restore if soft-deleted
              ...(firstVariant.isDeleted || wasDeleted ? { isActive: false } : {}),
              price: params.mrpPaise,
              ...(params.sellingPricePaise !== undefined
                ? { sellingPrice: params.sellingPricePaise }
                : {}),
              ...(params.stock !== undefined ? { stock: params.stock } : {}),
              ...(params.ean ? { ean: params.ean } : {}),
              ...(params.weightGrams ? { weightGrams: params.weightGrams } : {}),
            },
          });
        } else {
          let skuToUse = params.sku || `SKU-${Date.now()}`;
          const existingSku = await tx.productVariant.findUnique({
            where: { sku: skuToUse },
            select: { id: true },
          });
          if (existingSku) {
            skuToUse = `${skuToUse}-${Date.now().toString(36)}`;
          }
          variant = await tx.productVariant.create({
            data: {
              productId: params.productId,
              sku: skuToUse,
              price: params.mrpPaise,
              sellingPrice: params.sellingPricePaise ?? null,
              stock: params.stock ?? 0,
              ean: params.ean ?? null,
              weightGrams: params.weightGrams ?? null,
              isActive: false,
              isDeleted: false,
            },
          });
        }
      }

      return { product, variant };
    });
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
      featuredCount,
      reviewCount,
      comboKitCount,
      activeVariantCount,
    };
  }

  // --- BEST SELLER FUNCTIONALITY ---

  /**
   * Helper to get top products by aggregated order items within a timeframe.
   */
  private async getTopSellingProductIds(
    timeframe: "week" | "month" | "all_time",
    categoryId?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<{ productId: string; unitsSold: number; totalRevenue: number }[]> {
    if (timeframe === "all_time" && !categoryId) {
      // For all time without category, we can just use the purchasedCount column on product
      // but if we want revenue metrics, we still need to hit OrderItem.
      // So we hit OrderItem for consistency, or we optimize if just getting IDs.
    }

    const dateLimit = new Date();
    if (timeframe === "week") dateLimit.setDate(dateLimit.getDate() - 7);
    if (timeframe === "month") dateLimit.setMonth(dateLimit.getMonth() - 1);

    const whereCondition: Prisma.OrderItemWhereInput = {
      productId: { not: null },
      ...(timeframe !== "all_time" && { createdAt: { gte: dateLimit } }),
      ...(categoryId && {
        product: {
          categories: { some: { categoryId } },
        },
      }),
    };

    const topItems = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: whereCondition,
      _sum: {
        quantity: true,
        price: true, // we can sum up price*quantity by doing custom query or doing it in code,
        // but prisma doesn't support sum of multiplication easily without raw SQL.
        // For now, we'll just sort by units sold.
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
      skip,
    });

    // To get revenue, we might need a separate query per product if we want exact revenue
    // or just raw SQL. We will use raw SQL to efficiently get both unitsSold and grossRevenue
    // grouped by productId.

    let timeFilter = "";
    if (timeframe === "week")
      timeFilter = `AND oi."createdAt" >= NOW() - INTERVAL '7 days'`;
    if (timeframe === "month")
      timeFilter = `AND oi."createdAt" >= NOW() - INTERVAL '1 month'`;

    let categoryFilter = "";
    if (categoryId) {
      categoryFilter = `
        AND EXISTS (
          SELECT 1 FROM "ProductCategory" pc 
          WHERE pc."productId" = oi."productId" 
          AND pc."categoryId" = '${categoryId}'
        )
      `;
    }

    // Use raw query for efficient SUM(quantity) and SUM(price * quantity)
    const rawData = await this.prisma.$queryRawUnsafe<
      { productId: string; unitsSold: number; totalRevenue: number }[]
    >(`
      SELECT 
        oi."productId" as "productId", 
        SUM(oi.quantity)::int as "unitsSold", 
        SUM(oi.price * oi.quantity)::int as "totalRevenue"
      FROM "OrderItem" oi
      WHERE oi."productId" IS NOT NULL
      ${timeFilter}
      ${categoryFilter}
      GROUP BY oi."productId"
      ORDER BY "unitsSold" DESC
      LIMIT ${limit} OFFSET ${skip}
    `);

    return rawData;
  }

  async getBestSellers(
    pagination: ProductPaginationOptions,
    timeframe: "week" | "month" | "all_time" = "all_time",
    categoryId?: string,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const topSellingData = await this.getTopSellingProductIds(
      timeframe,
      categoryId,
      take,
      skip,
    );

    const productIds = topSellingData.map((d) => d.productId);

    // If no sales in timeframe
    if (productIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: pagination.page,
          limit: take,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
        isActive: true,
      },
      include: {
        brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
        taxClass: { select: { id: true, name: true, rate: true } },
        lengthClass: { select: { id: true, name: true, unit: true } },
        weightClass: { select: { id: true, name: true, unit: true } },
        categories: { include: { category: true } },
        filterValues: { include: { filterValue: true } },
        variants: {
          where: { isDeleted: false, stock: { gt: 0 } },
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

    // Map back to maintain the descending sales order
    const orderedProducts = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as typeof products;

    // For total count, we'd theoretically need a count query. We'll use raw for total.
    const totalCountQuery = await this.prisma.$queryRawUnsafe<
      { count: number }[]
    >(`
      SELECT COUNT(DISTINCT oi."productId")::int as count
      FROM "OrderItem" oi
      WHERE oi."productId" IS NOT NULL
      ${timeframe === "week" ? `AND oi."createdAt" >= NOW() - INTERVAL '7 days'` : ""}
      ${timeframe === "month" ? `AND oi."createdAt" >= NOW() - INTERVAL '1 month'` : ""}
      ${
        categoryId
          ? `AND EXISTS (
              SELECT 1 FROM "ProductCategory" pc 
              WHERE pc."productId" = oi."productId" 
              AND pc."categoryId" = '${categoryId}'
            )`
          : ""
      }
    `);
    const total = totalCountQuery[0]?.count || 0;
    const totalPages = Math.ceil(total / take);

    return {
      data: orderedProducts,
      pagination: {
        page: pagination.page,
        limit: take,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };
  }

  async getBestSellersAdmin(
    pagination: ProductPaginationOptions,
    timeframe: "week" | "month" | "all_time" = "all_time",
    categoryId?: string,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const topSellingData = await this.getTopSellingProductIds(
      timeframe,
      categoryId,
      take,
      skip,
    );

    const productIds = topSellingData.map((d) => d.productId);

    if (productIds.length === 0) {
      return {
        items: [],
        pagination: {
          page: pagination.page,
          limit: take,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isDeleted: false,
      },
      include: {
        brand: true,
        taxClass: true,
        lengthClass: true,
        weightClass: true,
        categories: { include: { category: true } },
        filterValues: { include: { filterValue: true } },
        variants: {
          where: { isDeleted: false, isActive: true },
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

    const orderedItems = topSellingData
      .map((data) => {
        const product = products.find((p) => p.id === data.productId);
        if (!product) return null;
        return {
          product,
          salesMetrics: {
            unitsSold: data.unitsSold,
            totalRevenue: data.totalRevenue,
            timeframe,
          },
        };
      })
      .filter(Boolean);

    const totalCountQuery = await this.prisma.$queryRawUnsafe<
      { count: number }[]
    >(`
      SELECT COUNT(DISTINCT oi."productId")::int as count
      FROM "OrderItem" oi
      WHERE oi."productId" IS NOT NULL
      ${timeframe === "week" ? `AND oi."createdAt" >= NOW() - INTERVAL '7 days'` : ""}
      ${timeframe === "month" ? `AND oi."createdAt" >= NOW() - INTERVAL '1 month'` : ""}
      ${
        categoryId
          ? `AND EXISTS (
              SELECT 1 FROM "ProductCategory" pc 
              WHERE pc."productId" = oi."productId" 
              AND pc."categoryId" = '${categoryId}'
            )`
          : ""
      }
    `);
    const total = totalCountQuery[0]?.count || 0;
    const totalPages = Math.ceil(total / take);

    return {
      items: orderedItems,
      pagination: {
        page: pagination.page,
        limit: take,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
    };
  }

  async getBestSellerAnalytics(
    timeframe: "week" | "month" | "all_time" = "month",
  ) {
    let timeFilter = "";
    if (timeframe === "week")
      timeFilter = `AND oi."createdAt" >= NOW() - INTERVAL '7 days'`;
    if (timeframe === "month")
      timeFilter = `AND oi."createdAt" >= NOW() - INTERVAL '1 month'`;

    const rawData = await this.prisma.$queryRawUnsafe<
      { totalUnitsSold: number; grossRevenue: number }[]
    >(`
      SELECT 
        COALESCE(SUM(oi.quantity), 0)::int as "totalUnitsSold", 
        COALESCE(SUM(oi.price * oi.quantity), 0)::int as "grossRevenue"
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE oi."productId" IS NOT NULL
      AND o.status != 'CANCELLED'
      ${timeFilter}
    `);

    // Optionally get top category by joining ProductCategory
    const topCatData = await this.prisma.$queryRawUnsafe<{ name: string }[]>(`
      SELECT c.name, SUM(oi.quantity)::int as "qty"
      FROM "OrderItem" oi
      JOIN "Order" o ON o.id = oi."orderId"
      JOIN "ProductCategory" pc ON pc."productId" = oi."productId"
      JOIN "Category" c ON c.id = pc."categoryId"
      WHERE oi."productId" IS NOT NULL
      AND o.status != 'CANCELLED'
      ${timeFilter}
      GROUP BY c.id, c.name
      ORDER BY "qty" DESC
      LIMIT 1
    `);

    return {
      totalUnitsSold: rawData[0]?.totalUnitsSold || 0,
      grossRevenue: rawData[0]?.grossRevenue || 0,
      topCategory: topCatData[0]?.name || null,
      timeframe,
    };
  }
}
