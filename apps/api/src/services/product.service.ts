import { ProductRepository } from "../repositories/product.repository.js";
import { deleteObject, uploadBuffer } from "../lib/s3.js";
import appConfig from "../lib/config.js";
import { ProductPaginationOptions } from "../types/pagination.types.js";
import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import logger from "../lib/logger.js";

// Input types that extend Prisma types with additional fields for API input
type ProductCreateInputWithExtras = Prisma.ProductCreateInput & {
  categoryId?: string;
};

type ProductUpdateInputWithExtras = Prisma.ProductUpdateInput & {
  categoryId?: string;
};

// DTOs accepted from controllers (may include legacy / user-friendly fields)
type ProductCreateDTO = ProductCreateInputWithExtras & {
  brand?:
    | string
    | Prisma.BrandCreateNestedOneWithoutProductsInput
    | Prisma.BrandWhereUniqueInput;
  categoryId?: string;
  optionValueIds?: string[];
  optionValues?: unknown;
  size?: string;
  shade?: string;
};

type ProductUpdateDTO = ProductUpdateInputWithExtras & {
  brand?:
    | string
    | Prisma.BrandCreateNestedOneWithoutProductsInput
    | Prisma.BrandWhereUniqueInput;
  categoryId?: string;
  optionValueIds?: string[];
  optionValues?: unknown;
  size?: string;
  shade?: string;
};

type VariantCreateDTO = Prisma.ProductVariantCreateInput & {
  optionValueIds?: string[];
  optionValues?: unknown;
  size?: string;
  shade?: string;
};

type VariantUpdateDTO = Prisma.ProductVariantUpdateInput & {
  optionValueIds?: string[];
  optionValues?: unknown;
  size?: string;
  shade?: string;
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

  async getBestSellers(
    pagination: ProductPaginationOptions,
    timeframe: "week" | "month" | "all_time" = "all_time",
    categoryId?: string,
  ) {
    return this.productRepository.getBestSellers(
      pagination,
      timeframe,
      categoryId,
    );
  }

  async getBestSellersAdmin(
    pagination: ProductPaginationOptions,
    timeframe: "week" | "month" | "all_time" = "all_time",
    categoryId?: string,
  ) {
    return this.productRepository.getBestSellersAdmin(
      pagination,
      timeframe,
      categoryId,
    );
  }

  async getBestSellerAnalytics(
    timeframe: "week" | "month" | "all_time" = "month",
  ) {
    return this.productRepository.getBestSellerAnalytics(timeframe);
  }

  async searchProducts(query: string, filters: Prisma.ProductWhereInput = {}) {
    return this.productRepository.searchProducts(query, filters);
  }

  async getProductVariants(productId: string) {
    return this.productRepository.getProductVariants(productId);
  }

  async getVariantById(variantId: string) {
    return this.productRepository.prismaClient.productVariant.findFirst({
      where: { id: variantId, isDeleted: false },
      include: {
        images: {
          where: { isDeleted: false },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        },
        optionValues: {
          include: { optionValue: { include: { option: true } } },
        },
      },
    });
  }

  async getVariantByIdAdmin(variantId: string) {
    return this.productRepository.prismaClient.productVariant.findUnique({
      where: { id: variantId },
      include: {
        images: true,
        optionValues: {
          include: { optionValue: { include: { option: true } } },
        },
        product: true,
      },
    });
  }

  async getProductWithDetails(id: string) {
    return this.productRepository.getProductWithDetails(id);
  }

  // Metrics
  async incrementViewCount(productId: string) {
    return this.productRepository.incrementProductViewCount(productId);
  }

  async incrementPurchasedCount(productId: string, quantity = 1) {
    return this.productRepository.incrementProductPurchasedCount(
      productId,
      quantity,
    );
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
    const sanitizedData: ProductCreateDTO = { ...data };

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
    if (sanitizedData.brand && typeof sanitizedData.brand === "string") {
      sanitizedData.brand = await this.resolveBrandInput(
        (sanitizedData.brand as string).trim(),
      );
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

    // Transform categoryId to proper Prisma structure (many-to-many)
    if (sanitizedData.categoryId) {
      sanitizedData.categories = {
        create: [{ category: { connect: { id: sanitizedData.categoryId } } }],
      } as unknown as Prisma.ProductCreateInput["categories"];
      delete sanitizedData.categoryId;
    }

    // Set default values
    sanitizedData.isActive = sanitizedData.isActive ?? true;
    sanitizedData.isDeleted = false;

    try {
      return await this.productRepository.createProduct(
        sanitizedData as Prisma.ProductCreateInput,
      );
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Product with this slug already exists");
      throw err;
    }
  }

  async updateProduct(id: string, data: ProductUpdateInputWithExtras) {
    // Business logic validation and data transformation

    // Validate product exists
    const existingProduct = await this.productRepository.getProductById(id);
    if (!existingProduct) {
      throw new ValidationError("Product not found");
    }

    const sanitizedData: ProductUpdateDTO = { ...data };

    // Handle slug updates with uniqueness validation
    if (sanitizedData.slug && typeof sanitizedData.slug === "string") {
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
    if (sanitizedData.brand && typeof sanitizedData.brand === "string") {
      sanitizedData.brand = await this.resolveBrandInput(
        (sanitizedData.brand as string).trim(),
      );
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

    // Transform categoryId to proper Prisma structure (many-to-many)
    // Use connectOrCreate so re-sending the same categoryId on update is idempotent.
    if (sanitizedData.categoryId) {
      const catId = sanitizedData.categoryId;
      sanitizedData.categories = {
        connectOrCreate: [
          {
            where: {
              productId_categoryId: { productId: id, categoryId: catId },
            },
            create: { category: { connect: { id: catId } } },
          },
        ],
      } as unknown as Prisma.ProductUpdateInput["categories"];
      delete sanitizedData.categoryId;
    }

    try {
      return await this.productRepository.updateProduct(
        id,
        sanitizedData as Prisma.ProductUpdateInput,
      );
    } catch (err) {
      if (isPrismaP2002(err))
        throw new ValidationError("Product with this slug already exists");
      throw err;
    }
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

    const sanitizedData: VariantCreateDTO = { ...data };

    // Generate SKU if not provided (may use option values)
    if (!sanitizedData.sku) {
      const product = await this.productRepository.getProductById(productId);
      if (product) {
        sanitizedData.sku = await this.generateSKU(product.name, sanitizedData);
      }
    }

    // Validate SKU uniqueness
    if (sanitizedData.sku) {
      const existingVariant = await this.productRepository.findVariantBySku(
        sanitizedData.sku as string,
      );
      if (existingVariant) {
        throw new ValidationError(
          "Product variant with this SKU already exists",
        );
      }
    }

    // Support explicit optionValueIds *and* legacy `size` / `shade` strings
    const explicitOptionValueIds = (sanitizedData.optionValueIds ??
      sanitizedData.optionValues) as unknown;
    const attachOptionValueIds: string[] = [];

    if (
      Array.isArray(explicitOptionValueIds) &&
      explicitOptionValueIds.length
    ) {
      attachOptionValueIds.push(...(explicitOptionValueIds as string[]));
      delete sanitizedData.optionValueIds;
      delete sanitizedData.optionValues;
    }

    // Resolve legacy size/shade strings to OptionValue rows (if present)
    if (sanitizedData.size) {
      const ov = await this.productRepository.findOptionValueByNameAndValue(
        "Size",
        sanitizedData.size as string,
      );
      if (ov) attachOptionValueIds.push(ov.id);
      delete sanitizedData.size;
    }
    if (sanitizedData.shade) {
      const ov = await this.productRepository.findOptionValueByNameAndValue(
        "Shade",
        sanitizedData.shade as string,
      );
      if (ov) attachOptionValueIds.push(ov.id);
      delete sanitizedData.shade;
    }

    if (attachOptionValueIds.length) {
      sanitizedData.optionValues = {
        create: attachOptionValueIds.map((ovId) => ({
          optionValue: { connect: { id: ovId } },
        })),
      };
    }

    // Sanitize tags
    if (sanitizedData.tags) {
      sanitizedData.tags = (sanitizedData.tags as string[])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
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
    const existingVariant = await this.productRepository.getVariantById(id);
    if (!existingVariant) {
      throw new ValidationError("Product variant not found");
    }

    const sanitizedData: VariantUpdateDTO = { ...data };

    // Handle SKU updates with uniqueness validation
    if (sanitizedData.sku && sanitizedData.sku !== existingVariant.sku) {
      const skuExists = await this.productRepository.findVariantBySku(
        sanitizedData.sku as string,
      );
      if (skuExists) {
        throw new ValidationError(
          "Product variant with this SKU already exists",
        );
      }
    }

    // Map legacy `size` / `shade` strings into OptionValue connects (append)
    const attachOptionValueIds: string[] = [];
    if (sanitizedData.size) {
      const ov = await this.productRepository.findOptionValueByNameAndValue(
        "Size",
        sanitizedData.size as string,
      );
      if (ov) attachOptionValueIds.push(ov.id);
      delete sanitizedData.size;
    }
    if (sanitizedData.shade) {
      const ov = await this.productRepository.findOptionValueByNameAndValue(
        "Shade",
        sanitizedData.shade as string,
      );
      if (ov) attachOptionValueIds.push(ov.id);
      delete sanitizedData.shade;
    }

    // Map explicit optionValueIds into nested creates (append)
    const explicitOptionValueIds = (sanitizedData.optionValueIds ??
      sanitizedData.optionValues) as unknown;
    if (
      Array.isArray(explicitOptionValueIds) &&
      explicitOptionValueIds.length
    ) {
      attachOptionValueIds.push(...(explicitOptionValueIds as string[]));
      delete sanitizedData.optionValueIds;
      delete sanitizedData.optionValues;
    }

    if (attachOptionValueIds.length) {
      sanitizedData.optionValues = {
        create: attachOptionValueIds.map((ovId) => ({
          optionValue: { connect: { id: ovId } },
        })),
      };
    }

    // Sanitize tags
    if (sanitizedData.tags) {
      sanitizedData.tags = (sanitizedData.tags as string[])
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
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
    fileBuffer?: Buffer,
    contentType?: string,
  ) {
    // Business logic validation and data transformation

    // Validate variant exists
    const variant = await this.productRepository.getVariantById(variantId);
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    const sanitizedData = { ...data };

    // Sanitize alt text
    if (sanitizedData.altText) {
      sanitizedData.altText = (sanitizedData.altText as string).trim();
    }

    // Sanitize isPrimary (default to false)
    if (sanitizedData.isPrimary === undefined) {
      sanitizedData.isPrimary = false;
    } else {
      sanitizedData.isPrimary = Boolean(sanitizedData.isPrimary);
    }

    // Require an uploaded file (server-side upload only)
    if (!fileBuffer) {
      throw new ValidationError("Image file is required");
    }

    if (!appConfig.S3_ENABLED) {
      throw new ValidationError("S3 is not enabled on the server");
    }

    // Determine extension from contentType
    let ext = "bin";
    if (contentType) {
      if (contentType.includes("jpeg") || contentType.includes("jpg"))
        ext = "jpg";
      else if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("webp")) ext = "webp";
      else if (contentType.includes("gif")) ext = "gif";
      else if (contentType.includes("svg")) ext = "svg";
    }

    // Get variant to know productId
    const variantRow = await this.productRepository.getVariantById(variantId);
    const productId = variantRow?.productId || "unknown";

    const rand = Math.random().toString(36).slice(2, 8);
    const timestamp = Date.now();
    const key = `products/${productId}/${variantId}/${timestamp}-${rand}.${ext}`;

    const publicUrl = await uploadBuffer(
      fileBuffer,
      key,
      contentType,
      true, // make product images public
    );
    sanitizedData.url = publicUrl;

    // Set variant ID and defaults
    sanitizedData.variant = {
      connect: { id: variantId },
    };

    // repository.addProductImage handles primary-image transactionally now
    return this.productRepository.addProductImage(variantId, sanitizedData);
  }

  async updateProductImage(
    id: string,
    data: Prisma.ProductImageUpdateInput,
    fileBuffer?: Buffer,
    contentType?: string,
  ) {
    // Validate image exists
    const image = await this.productRepository.getProductImageById(id);
    if (!image) {
      throw new ValidationError("Image not found");
    }

    const sanitizedData: Prisma.ProductImageUpdateInput = { ...data };

    if (sanitizedData.altText) {
      sanitizedData.altText = (sanitizedData.altText as string).trim();
    }

    // If a new file is provided, upload it and remove the old S3 object if possible
    if (fileBuffer) {
      if (!appConfig.S3_ENABLED) {
        throw new ValidationError("S3 is not enabled on the server");
      }

      let ext = "bin";
      if (contentType) {
        if (contentType.includes("jpeg") || contentType.includes("jpg"))
          ext = "jpg";
        else if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("gif")) ext = "gif";
        else if (contentType.includes("svg")) ext = "svg";
      }

      const variantId = image.productVariantId;
      const variantRow = await this.productRepository.getVariantById(variantId);
      const productId = variantRow?.productId || "unknown";

      const rand = Math.random().toString(36).slice(2, 8);
      const timestamp = Date.now();
      const key = `products/${productId}/${variantId}/${timestamp}-${rand}.${ext}`;

      const publicUrl = await uploadBuffer(
        fileBuffer,
        key,
        contentType,
        true, // make product images public
      );
      sanitizedData.url = publicUrl;

      // Try to delete old S3 object if the URL maps to our bucket
      try {
        const oldKey = this.extractS3KeyFromUrl(image.url);
        if (oldKey) {
          await deleteObject(oldKey);
        }
      } catch (err) {
        logger.warn(
          { id, err },
          "Failed to delete old S3 object for image update",
        );
      }
    }

    // Update DB record
    const updated =
      await this.productRepository.prismaClient.productImage.update({
        where: { id },
        data: sanitizedData,
      });

    return updated;
  }

  async setPrimaryImage(imageId: string) {
    // Business logic validation

    // Validate image exists
    const image = await this.productRepository.getProductImageById(imageId);
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
    const variant = await this.productRepository.getVariantById(id);
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    if (variant.isDeleted) {
      throw new ValidationError("Product variant is already deleted");
    }

    // Prevent deletion when the variant is referenced by active carts/orders/reservations/etc.
    const [cartCount, orderCount, wishlistCount, comboKitCount] =
      await this.productRepository.getVariantSoftDeleteDependencies(id);

    if (cartCount > 0) {
      throw new ValidationError(
        "Cannot delete variant: it exists in user carts",
      );
    }
    if (orderCount > 0) {
      throw new ValidationError(
        "Cannot delete variant: it is referenced by existing orders",
      );
    }
    if (wishlistCount > 0) {
      throw new ValidationError(
        "Cannot delete variant: it is present in user wishlists",
      );
    }
    if (comboKitCount > 0) {
      throw new ValidationError(
        "Cannot delete variant: it is part of a combo kit",
      );
    }

    return this.productRepository.softDeleteProductVariant(id);
  }

  async restoreProductVariant(id: string) {
    return this.productRepository.restoreProductVariant(id);
  }

  async getAllVariantImages(variantId: string) {
    const variant = await this.productRepository.getVariantById(variantId);
    if (!variant) {
      throw new NotFoundError("Product variant not found");
    }
    return this.productRepository.getAllVariantImages(variantId);
  }

  async softDeleteImage(id: string) {
    const image = await this.productRepository.getProductImageById(id);
    if (!image) throw new NotFoundError("Image not found");
    return this.productRepository.softDeleteImage(id);
  }

  async restoreImage(id: string) {
    const image = await this.productRepository.getProductImageById(id);
    if (!image) throw new NotFoundError("Image not found");
    return this.productRepository.restoreImage(id);
  }

  async addProductToFeatured(sectionId: string, productId: string) {
    // Business logic validation

    // Validate section exists
    const section =
      await this.productRepository.getFeaturedSectionById(sectionId);
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
      await this.productRepository.isProductInFeaturedSection(
        sectionId,
        productId,
      );
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
    const variant = await this.productRepository.getVariantById(variantId);
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
      const variant = await this.productRepository.getVariantById(
        update.variantId,
      );
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

    // Collect all dependency counts via the repository
    const {
      productOrderCount,
      variantOrderCount,
      cartCount,
      wishlistCount,
      featuredCount,
      reviewCount,
      comboKitCount,
      activeVariantCount,
    } = await this.productRepository.getProductHardDeleteDependencies(id);

    const blockers: string[] = [];
    if (productOrderCount || variantOrderCount) blockers.push("orders");
    if (cartCount) blockers.push("carts");
    if (wishlistCount) blockers.push("wishlists");
    if (featuredCount) blockers.push("featured sections");
    if (reviewCount) blockers.push("reviews");
    if (comboKitCount) blockers.push("combo kits");
    if (activeVariantCount) blockers.push("active variants");

    if (blockers.length > 0) {
      logger.warn(
        `Preventing hard-delete for product ${id} due to dependencies: ${blockers.join(", ")}`,
      );
      throw new ValidationError(
        `Cannot hard-delete product: dependent resources exist (${blockers.join(", ")}). Delete or detach those resources first.`,
      );
    }

    return this.productRepository.hardDeleteProduct(id);
  }

  async hardDeleteProductVariant(id: string) {
    // Business logic validation

    // Validate variant exists
    const variant = await this.productRepository.getVariantById(id);
    if (!variant) {
      throw new ValidationError("Product variant not found");
    }

    // Prevent hard-delete when variant is referenced elsewhere
    const [cartCount, orderCount, wishlistCount, comboKitCount, imageCount] =
      await this.productRepository.getVariantHardDeleteDependencies(id);

    const blockers: string[] = [];
    if (cartCount) blockers.push(`${cartCount} cart item(s)`);
    if (orderCount) blockers.push(`${orderCount} order item(s)`);
    if (wishlistCount) blockers.push(`${wishlistCount} wishlist item(s)`);
    if (comboKitCount) blockers.push(`${comboKitCount} combo kit item(s)`);
    if (imageCount) blockers.push(`${imageCount} image(s)`);

    if (blockers.length > 0) {
      logger.warn(
        `Preventing hard-delete for variant ${id} due to dependencies: ${blockers.join(", ")}`,
      );
      throw new ValidationError(
        `Cannot hard-delete product variant — dependent resources exist: ${blockers.join(", ")}`,
      );
    }

    return this.productRepository.hardDeleteProductVariant(id);
  }

  async hardDeleteImage(id: string) {
    // Attempt to delete object from S3 if it belongs to our bucket
    const image = await this.productRepository.getProductImageById(id);
    if (!image) {
      throw new ValidationError("Image not found");
    }

    if (appConfig.S3_ENABLED && image.url) {
      try {
        const key = this.extractS3KeyFromUrl(image.url);
        if (key) {
          await deleteObject(key);
        }
      } catch (err) {
        // Log and continue to remove DB record anyway
        logger.warn({ id, err }, "Failed to delete S3 object for image");
      }
    }

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

  /**
   * Try to extract the S3 object key from a public S3 URL that our helper produces.
   * Returns null when it cannot determine a key for deletion.
   */
  private extractS3KeyFromUrl(urlStr: string): string | null {
    try {
      const u = new URL(urlStr);

      // No custom endpoint — handle AWS standard public URLs
      // 1) virtual-hosted-style: https://{bucket}.s3.amazonaws.com/{key} or https://{bucket}.s3.{region}.amazonaws.com/{key}
      const host = u.hostname;
      const path = u.pathname.replace(/^\//, "");

      if (host === `${appConfig.S3_BUCKET}.s3.amazonaws.com`) {
        return decodeURIComponent(path);
      }
      if (host.endsWith(`.s3.amazonaws.com`)) {
        // may be {bucket}.s3.amazonaws.com
        const parts = host.split(".");
        const bucketPart = parts[0];
        if (bucketPart === appConfig.S3_BUCKET) return decodeURIComponent(path);
      }

      // 2) path-style: https://s3.{region}.amazonaws.com/{bucket}/{key}
      const bucket = appConfig.S3_BUCKET;
      if (!bucket) return null;

      if (host.startsWith("s3.") && path.startsWith(`${bucket}/`)) {
        return decodeURIComponent(path.slice(bucket.length + 1));
      }

      return null;
    } catch {
      return null;
    }
  }

  private async validateCategoryExists(categoryId: string): Promise<boolean> {
    try {
      const category =
        await this.productRepository.findCategoryById(categoryId);
      return !!category;
    } catch (error) {
      logger.warn(
        { categoryId, err: error },
        `Error validating category existence for ID ${categoryId}:`,
      );
      return false;
    }
  }

  /**
   * Resolve a raw brand string (id, slug, or name) to a Prisma connect input.
   * Creates a new Brand row when no match is found.
   */
  private async resolveBrandInput(
    brandInput: string,
  ): Promise<Prisma.BrandCreateNestedOneWithoutProductsInput> {
    let brandRecord = await this.productRepository.findBrandById(brandInput);
    if (!brandRecord) {
      brandRecord =
        await this.productRepository.findBrandBySlugOrName(brandInput);
    }
    if (!brandRecord) {
      brandRecord = await this.productRepository.createBrand(
        brandInput,
        this.generateSlug(brandInput),
      );
    }
    return { connect: { id: brandRecord.id } };
  }

  private async validateProductExists(productId: string): Promise<boolean> {
    try {
      const product = await this.productRepository.getProductById(productId);
      return !!product;
    } catch (error) {
      logger.warn(
        { productId, err: error },
        `Error validating product existence for ID ${productId}:`,
      );
      return false;
    }
  }

  private async generateSKU(
    productName: string,
    variantData: Partial<VariantCreateDTO>,
  ): Promise<string> {
    const baseName = productName.substring(0, 3).toUpperCase();

    // Try to derive size/shade from provided optionValues (preferred)
    let sizeStr = "";
    let shadeStr = "";

    const rawCreates = variantData.optionValues?.create;
    type OptCreate = { optionValue?: { connect?: { id?: string } } };
    const optionValueCreates = Array.isArray(rawCreates)
      ? (rawCreates as OptCreate[])
      : rawCreates
        ? [rawCreates as OptCreate]
        : [];
    const explicitIds: string[] = [];
    for (const item of optionValueCreates) {
      const id = item?.optionValue?.connect?.id;
      if (id) explicitIds.push(id);
    }
    if (variantData.optionValueIds) {
      explicitIds.push(...(variantData.optionValueIds as string[]));
    }

    if (explicitIds.length) {
      const rows =
        await this.productRepository.findOptionValuesWithOptions(explicitIds);
      const sizeOv = rows.find((r) => r.option?.name?.toLowerCase() === "size");
      const shadeOv = rows.find(
        (r) => r.option?.name?.toLowerCase() === "shade",
      );
      if (sizeOv) sizeStr = `-${sizeOv.value.toUpperCase()}`;
      if (shadeOv) shadeStr = `-${shadeOv.value.toUpperCase()}`;
    }

    // Fallback to legacy fields if optionValues didn't provide them
    if (!sizeStr && variantData.size) {
      sizeStr = `-${(variantData.size as string).toUpperCase()}`;
    }
    if (!shadeStr && variantData.shade) {
      shadeStr = `-${(variantData.shade as string).toUpperCase()}`;
    }

    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    return `${baseName}${sizeStr}${shadeStr}-${timestamp}`;
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
