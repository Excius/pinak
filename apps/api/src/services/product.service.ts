import { ProductRepository } from "../repositories/product.repositoy.js";
import { ProductPaginationOptions } from "../types/pagination.types.js";
import { Prisma } from "../generated/prisma/client.js";
import { ValidationError } from "../lib/error.js";
import logger from "../lib/logger.js";

// Input types that extend Prisma types with additional fields for API input
type ProductCreateInputWithExtras = Prisma.ProductCreateInput & {
  categoryId?: string;
};

type ProductUpdateInputWithExtras = Prisma.ProductUpdateInput & {
  categoryId?: string;
};

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  async getProducts(pagination: ProductPaginationOptions) {
    return this.productRepository.getProducts(pagination);
  }

  async getProductById(id: string) {
    return this.productRepository.getProductById(id);
  }

  async getProductBySlug(slug: string) {
    return this.productRepository.getProductBySlug(slug);
  }

  async getProductsWithCategory(
    categoryId: string,
    pagination: ProductPaginationOptions,
  ) {
    return this.productRepository.getProductsWithCategory(
      categoryId,
      pagination,
    );
  }

  async getFeaturedProducts(
    pagination: ProductPaginationOptions,
    sectionId?: string,
  ) {
    return this.productRepository.getFeaturedProducts(pagination, sectionId);
  }

  async getFeaturedProductsBySection(
    sectionId: string,
    pagination: ProductPaginationOptions,
  ) {
    return this.productRepository.getFeaturedProductsBySection(
      sectionId,
      pagination,
    );
  }

  async searchProducts(query: string, filters: Prisma.ProductWhereInput = {}) {
    return this.productRepository.searchProducts(query, filters);
  }

  async getProductVariants(productId: string) {
    return this.productRepository.getProductVariants(productId);
  }

  async getProductWithDetails(id: string) {
    return this.productRepository.getProductWithDetails(id);
  }

  // Admin methods
  async getProductByIdAdmin(id: string) {
    return this.productRepository.getProductByIdAdmin(id);
  }

  async getAllProductsAdmin(pagination: ProductPaginationOptions) {
    return this.productRepository.getAllProductsAdmin(pagination);
  }

  async getDeletedProductsAdmin(pagination: ProductPaginationOptions) {
    return this.productRepository.getDeletedProductsAdmin(pagination);
  }

  async getProductsByStatusAdmin(
    status: "ACTIVE" | "INACTIVE",
    pagination: ProductPaginationOptions,
  ) {
    return this.productRepository.getProductsByStatusAdmin(status, pagination);
  }

  async createProduct(data: ProductCreateInputWithExtras) {
    // Business logic validation and data transformation

    // Sanitize and validate product data
    const sanitizedData: ProductCreateInputWithExtras = { ...data };

    // Generate slug if not provided or sanitize existing slug
    if (!sanitizedData.slug && sanitizedData.name) {
      sanitizedData.slug = this.generateSlug(sanitizedData.name);
    } else if (sanitizedData.slug) {
      sanitizedData.slug = this.sanitizeSlug(sanitizedData.slug);
    }

    // Validate slug uniqueness
    const existingProduct = await this.productRepository.getProductBySlug(
      sanitizedData.slug,
    );
    if (existingProduct) {
      throw new ValidationError("Product with this slug already exists");
    }

    // Sanitize text fields
    if (sanitizedData.name) {
      sanitizedData.name = (sanitizedData.name as string).trim();
    }
    if (sanitizedData.description) {
      sanitizedData.description = (sanitizedData.description as string).trim();
    }
    if (sanitizedData.brand) {
      sanitizedData.brand = (sanitizedData.brand as string).trim();
    }

    // Validate category exists
    if (sanitizedData.categoryId) {
      const categoryExists = await this.validateCategoryExists(
        sanitizedData.categoryId,
      );
      if (!categoryExists) {
        throw new ValidationError("Invalid category ID");
      }
    }

    // Transform categoryId to proper Prisma structure
    if (sanitizedData.categoryId) {
      sanitizedData.category = {
        connect: { id: sanitizedData.categoryId },
      };
      delete sanitizedData.categoryId;
    }

    // Set default values
    sanitizedData.isActive = sanitizedData.isActive ?? true;
    sanitizedData.isDeleted = false;

    return this.productRepository.createProduct(
      sanitizedData as Prisma.ProductCreateInput,
    );
  }

  async updateProduct(id: string, data: ProductUpdateInputWithExtras) {
    // Business logic validation and data transformation

    // Validate product exists
    const existingProduct = await this.productRepository.getProductById(id);
    if (!existingProduct) {
      throw new ValidationError("Product not found");
    }

    const sanitizedData: ProductUpdateInputWithExtras = { ...data };

    // Handle slug updates with uniqueness validation
    if (sanitizedData.slug && typeof sanitizedData.slug === 'string') {
      const sanitizedSlug = this.sanitizeSlug(sanitizedData.slug);

      // Check if slug is different from current
      if (sanitizedSlug !== existingProduct.slug) {
        const slugExists =
          await this.productRepository.getProductBySlug(sanitizedSlug);
        if (slugExists) {
          throw new ValidationError("Product with this slug already exists");
        }
      }

      sanitizedData.slug = sanitizedSlug;
    }

    // Sanitize text fields
    if (sanitizedData.name) {
      sanitizedData.name = (sanitizedData.name as string).trim();
    }
    if (sanitizedData.description) {
      sanitizedData.description = (sanitizedData.description as string).trim();
    }
    if (sanitizedData.brand) {
      sanitizedData.brand = (sanitizedData.brand as string).trim();
    }

    // Validate category exists if being updated
    if (sanitizedData.categoryId) {
      const categoryExists = await this.validateCategoryExists(
        sanitizedData.categoryId,
      );
      if (!categoryExists) {
        throw new ValidationError("Invalid category ID");
      }
    }

    // Transform categoryId to proper Prisma structure
    if (sanitizedData.categoryId) {
      sanitizedData.category = {
        connect: { id: sanitizedData.categoryId },
      };
      delete sanitizedData.categoryId;
    }

    return this.productRepository.updateProduct(
      id,
      sanitizedData as Prisma.ProductUpdateInput,
    );
  }

  async updateProductStatus(id: string, isActive: boolean) {
    return this.productRepository.updateProductStatus(id, isActive);
  }

  async createProductVariant(
    productId: string,
    data: Prisma.ProductVariantCreateInput,
  ) {
    // Business logic validation and data transformation

    // Validate product exists
    const productExists = await this.validateProductExists(productId);
    if (!productExists) {
      throw new ValidationError("Product not found");
    }

    const sanitizedData = { ...data };

    // Generate SKU if not provided
    if (!sanitizedData.sku) {
      // Get product name for SKU generation
      const product = await this.productRepository.getProductById(productId);
      if (product) {
        sanitizedData.sku = this.generateSKU(product.name, sanitizedData);
      }
    }

    // Validate SKU uniqueness
    if (sanitizedData.sku) {
      const existingVariant =
        await this.productRepository.prismaClient.productVariant.findUnique({
          where: { sku: sanitizedData.sku as string },
        });
      if (existingVariant) {
        throw new ValidationError(
          "Product variant with this SKU already exists",
        );
      }
    }

    // Sanitize text fields
    if (sanitizedData.shade) {
      sanitizedData.shade = (sanitizedData.shade as string).trim();
    }
    if (sanitizedData.size) {
      sanitizedData.size = (sanitizedData.size as string).trim();
    }
    if (sanitizedData.tags) {
      sanitizedData.tags = (sanitizedData.tags as string[]).map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Validate price (must be positive)
    if (sanitizedData.price && (sanitizedData.price as number) <= 0) {
      throw new ValidationError("Price must be greater than 0");
    }

    // Validate stock (cannot be negative)
    if (sanitizedData.stock && (sanitizedData.stock as number) < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Set default stock if not provided
    sanitizedData.stock = sanitizedData.stock ?? 0;

    // Set productId
    sanitizedData.product = {
      connect: { id: productId },
    };

    return this.productRepository.createProductVariant(
      productId,
      sanitizedData,
    );
  }

  async updateProductVariant(
    id: string,
    data: Prisma.ProductVariantUpdateInput,
  ) {
    // Business logic validation and data transformation

    // Validate variant exists
    const existingVariant =
      await this.productRepository.prismaClient.productVariant.findUnique({
        where: { id },
      });
    if (!existingVariant) {
      throw new ValidationError("Product variant not found");
    }

    const sanitizedData = { ...data };

    // Handle SKU updates with uniqueness validation
    if (sanitizedData.sku && sanitizedData.sku !== existingVariant.sku) {
      const skuExists =
        await this.productRepository.prismaClient.productVariant.findUnique({
          where: { sku: sanitizedData.sku as string },
        });
      if (skuExists) {
        throw new ValidationError(
          "Product variant with this SKU already exists",
        );
      }
    }

    // Sanitize text fields
    if (sanitizedData.shade) {
      sanitizedData.shade = (sanitizedData.shade as string).trim();
    }
    if (sanitizedData.size) {
      sanitizedData.size = (sanitizedData.size as string).trim();
    }
    if (sanitizedData.tags) {
      sanitizedData.tags = (sanitizedData.tags as string[]).map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Validate price (must be positive)
    if (sanitizedData.price && (sanitizedData.price as number) <= 0) {
      throw new ValidationError("Price must be greater than 0");
    }

    // Validate stock (cannot be negative)
    if (sanitizedData.stock && (sanitizedData.stock as number) < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    return this.productRepository.updateProductVariant(id, sanitizedData);
  }

  async addProductImage(
    variantId: string,
    data: Prisma.ProductImageCreateInput,
  ) {
    // Business logic validation and data transformation

    // Validate variant exists
    const variant =
      await this.productRepository.prismaClient.productVariant.findUnique({
        where: { id: variantId },
      });
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    const sanitizedData = { ...data };

    // Validate URL format
    if (sanitizedData.url) {
      try {
        new URL(sanitizedData.url as string);
      } catch {
        throw new ValidationError("Invalid image URL format");
      }
    }

    // Sanitize alt text
    if (sanitizedData.altText) {
      sanitizedData.altText = (sanitizedData.altText as string).trim();
    }

    // Set variant ID and defaults
    sanitizedData.variant = {
      connect: { id: variantId },
    };

    // If this is set as primary, unset other primary images for this variant
    if (sanitizedData.isPrimary) {
      await this.productRepository.prismaClient.productImage.updateMany({
        where: {
          productVariantId: variantId,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    return this.productRepository.addProductImage(variantId, sanitizedData);
  }

  async setPrimaryImage(imageId: string) {
    // Business logic validation

    // Validate image exists
    const image =
      await this.productRepository.prismaClient.productImage.findUnique({
        where: { id: imageId },
      });
    if (!image) {
      throw new ValidationError("Image not found");
    }

    if (image.isDeleted) {
      throw new ValidationError("Cannot set deleted image as primary");
    }

    return this.productRepository.setPrimaryImage(imageId);
  }

  async softDeleteProduct(id: string) {
    return this.productRepository.softDeleteProduct(id);
  }

  async restoreProduct(id: string) {
    return this.productRepository.restoreProduct(id);
  }

  async softDeleteProductVariant(id: string) {
    // Business logic validation

    // Validate variant exists
    const variant =
      await this.productRepository.prismaClient.productVariant.findUnique({
        where: { id },
      });
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    if (variant.isDeleted) {
      throw new ValidationError("Product variant is already deleted");
    }

    // TODO: Check if variant has active cart items or orders before deletion

    return this.productRepository.softDeleteProductVariant(id);
  }

  async restoreProductVariant(id: string) {
    return this.productRepository.restoreProductVariant(id);
  }

  async softDeleteImage(id: string) {
    return this.productRepository.softDeleteImage(id);
  }

  async restoreImage(id: string) {
    return this.productRepository.restoreImage(id);
  }

  async addProductToFeatured(sectionId: string, productId: string) {
    // Business logic validation

    // Validate section exists
    const section =
      await this.productRepository.prismaClient.featuredSection.findUnique({
        where: { id: sectionId },
      });
    if (!section) {
      throw new ValidationError("Featured section not found");
    }

    // Validate product exists and is active
    const product = await this.productRepository.getProductById(productId);
    if (!product) {
      throw new ValidationError("Product not found");
    }
    if (!product.isActive) {
      throw new ValidationError("Cannot feature inactive product");
    }

    // Check if product is already featured in this section
    const existingFeature =
      await this.productRepository.prismaClient.featuredProduct.findFirst({
        where: {
          sectionId,
          productId,
        },
      });
    if (existingFeature) {
      throw new ValidationError("Product is already featured in this section");
    }

    return this.productRepository.addProductToFeatured(sectionId, productId);
  }

  async removeProductFromFeatured(featuredProductId: string) {
    return this.productRepository.removeProductFromFeatured(featuredProductId);
  }

  async getOutOfStockProducts() {
    return this.productRepository.getOutOfStockProducts();
  }

  async getLowStockProducts(threshold: number) {
    return this.productRepository.getLowStockProducts(threshold);
  }

  async updateVariantStock(variantId: string, newStock: number) {
    // Business logic validation

    // Validate variant exists
    const variant =
      await this.productRepository.prismaClient.productVariant.findUnique({
        where: { id: variantId },
      });
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    // Validate stock value
    if (newStock < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Business rule: Log stock changes for audit trail
    const oldStock = variant.stock;
    if (oldStock !== newStock) {
      logger.info(
        `Stock change for variant ${variantId}: ${oldStock} -> ${newStock}`,
      );
    }

    return this.productRepository.updateVariantStock(variantId, newStock);
  }

  async bulkUpdateVariantStock(
    updates: { variantId: string; newStock: number }[],
  ) {
    // Business logic validation for bulk operations

    // Validate all variants exist and stock values are valid
    for (const update of updates) {
      const variant =
        await this.productRepository.prismaClient.productVariant.findUnique({
          where: { id: update.variantId },
        });
      if (!variant) {
        throw new ValidationError(
          `Product variant ${update.variantId} not found`,
        );
      }

      if (update.newStock < 0) {
        throw new ValidationError(
          `Stock cannot be negative for variant ${update.variantId}`,
        );
      }
    }

    // Log bulk stock change operation
    logger.info(`Bulk stock update for ${updates.length} variants`);

    return this.productRepository.bulkUpdateVariantStock(updates);
  }

  async hardDeleteProduct(id: string) {
    // Business logic validation

    // Validate product exists
    const product = await this.productRepository.getProductById(id);
    if (!product) {
      throw new ValidationError("Product not found");
    }

    // TODO: Check for any dependencies before hard deletion
    // This should check for orders, cart items, etc.

    return this.productRepository.hardDeleteProduct(id);
  }

  async hardDeleteProductVariant(id: string) {
    // Business logic validation

    // Validate variant exists
    const variant =
      await this.productRepository.prismaClient.productVariant.findUnique({
        where: { id },
      });
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    // TODO: Check for any dependencies before hard deletion

    return this.productRepository.hardDeleteProductVariant(id);
  }

  async hardDeleteImage(id: string) {
    return this.productRepository.hardDeleteImage(id);
  }

  // Helper methods for business logic
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  private sanitizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .trim()
      .replace(/[^\w-]/g, "") // Remove special characters except hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  private async validateCategoryExists(categoryId: string): Promise<boolean> {
    try {
      const category =
        await this.productRepository.prismaClient.category.findUnique({
          where: { id: categoryId },
        });
      return !!category;
    } catch (error) {
      logger.warn(`Error validating category existence for ID ${categoryId}:`, error);
      return false;
    }
  }

  private async validateProductExists(productId: string): Promise<boolean> {
    try {
      const product = await this.productRepository.getProductById(productId);
      return !!product;
    } catch (error) {
      logger.warn(`Error validating product existence for ID ${productId}:`, error);
      return false;
    }
  }

  private generateSKU(productName: string, variantData: Partial<Prisma.ProductVariantCreateInput>): string {
    const baseName = productName.substring(0, 3).toUpperCase();
    const size = variantData.size ? `-${variantData.size.toUpperCase()}` : "";
    const shade = variantData.shade
      ? `-${variantData.shade.toUpperCase()}`
      : "";
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp

    return `${baseName}${size}${shade}-${timestamp}`;
  }

  // TODO: Implement business logic validations
  // - Product uniqueness validation (slug conflicts)
  // - Category hierarchy validation
  // - Product variant consistency validation
  // - Price validation (minimum prices, currency handling)
  // - Stock validation (negative stock prevention)

  // TODO: Implement product lifecycle management
  // - Product approval workflow
  // - Product scheduling (publish/unpublish dates)
  // - Product versioning
  // - Product change history/audit trail

  // TODO: Implement advanced pricing features
  // - Dynamic pricing based on demand
  // - Promotional pricing
  // - Tiered pricing
  // - Currency conversion
  // - Tax calculation

  // TODO: Implement product relationships
  // - Related products (AI-powered recommendations)
  // - Product bundles/combos
  // - Cross-sell/up-sell suggestions
  // - Product dependencies

  // TODO: Implement SEO optimization
  // - Meta description generation
  // - URL slug optimization
  // - Structured data (JSON-LD)
  // - SEO-friendly redirects

  // TODO: Implement product import/export
  // - CSV import with validation
  // - Excel export with formatting
  // - API integration with external systems
  // - Data migration tools
}
