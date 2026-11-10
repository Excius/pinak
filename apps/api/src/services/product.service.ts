import { ProductRepository } from "../repositories/product.repository.js";
import { deleteObject, uploadBuffer, extractS3KeyFromUrl } from "../lib/s3.js";
import appConfig from "../lib/config.js";
import { ProductPaginationOptions } from "../types/pagination.types.js";
import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError, BaseError } from "../lib/error.js";
import { isPrismaP2002 } from "../lib/prisma-errors.js";
import logger from "../lib/logger.js";
import {
  parseSpreadsheet,
  generateInventoryCSV,
  generateInventoryXLSX,
  type InventoryExportRow,
} from "../lib/spreadsheet.js";

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
  taxClassId?: string | null;
  optionValueIds?: string[];
  optionValues?: unknown;
  size?: string;
  shade?: string;
};

type VariantUpdateDTO = Prisma.ProductVariantUpdateInput & {
  taxClassId?: string | null;
  optionValueIds?: string[];
  optionValues?: unknown;
  size?: string;
  shade?: string;
};

const MAX_IMPORT_ROWS = 5000;

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
        product: {
          include: { taxClass: true },
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
        product: {
          include: { taxClass: true },
        },
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
    if (typeof sanitizedData.brand === "string") {
      const brandStr = sanitizedData.brand.trim();
      if (brandStr !== "") {
        sanitizedData.brand = await this.resolveBrandInput(brandStr);
      } else {
        delete sanitizedData.brand;
      }
    }

    // Validate and transform categoryId to proper Prisma structure (many-to-many)
    if ("categoryId" in sanitizedData) {
      const catId = sanitizedData.categoryId;
      if (typeof catId === "string" && catId.trim() !== "") {
        const categoryExists = await this.validateCategoryExists(catId.trim());
        if (!categoryExists) {
          throw new ValidationError("Invalid category ID");
        }
        sanitizedData.categories = {
          create: [{ category: { connect: { id: catId.trim() } } }],
        } as unknown as Prisma.ProductCreateInput["categories"];
      }
      delete sanitizedData.categoryId;
    }

    // Clean up variant-only or extra DTO keys if present
    delete sanitizedData.optionValueIds;
    delete sanitizedData.optionValues;
    delete sanitizedData.size;
    delete sanitizedData.shade;

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
    if (typeof sanitizedData.brand === "string") {
      const brandStr = sanitizedData.brand.trim();
      if (brandStr !== "") {
        sanitizedData.brand = await this.resolveBrandInput(brandStr);
      } else {
        delete sanitizedData.brand;
      }
    }

    // Validate and transform categoryId to proper Prisma structure (many-to-many)
    // Use connectOrCreate so re-sending the same categoryId on update is idempotent.
    if ("categoryId" in sanitizedData) {
      const catId = sanitizedData.categoryId;
      if (typeof catId === "string" && catId.trim() !== "") {
        const categoryExists = await this.validateCategoryExists(catId.trim());
        if (!categoryExists) {
          throw new ValidationError("Invalid category ID");
        }
        sanitizedData.categories = {
          connectOrCreate: [
            {
              where: {
                productId_categoryId: {
                  productId: id,
                  categoryId: catId.trim(),
                },
              },
              create: { category: { connect: { id: catId.trim() } } },
            },
          ],
        } as unknown as Prisma.ProductUpdateInput["categories"];
      }
      delete sanitizedData.categoryId;
    }

    // Clean up variant-only or extra DTO keys if present
    delete sanitizedData.optionValueIds;
    delete sanitizedData.optionValues;
    delete sanitizedData.size;
    delete sanitizedData.shade;

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

  async bulkUpdateProductStatus(productIds: string[], isActive: boolean) {
    if (!productIds || productIds.length === 0) {
      throw new ValidationError("At least one product ID must be provided");
    }
    const updatedCount = await this.productRepository.bulkUpdateProductStatus(
      productIds,
      isActive,
    );
    return { updatedCount, isActive };
  }

  /**
   * Imports products and variants from spreadsheet buffer or CSV string.
   * All newly imported products are created with isActive: false so admin can verify them.
   */
  async importInventory(
    bufferOrString: Buffer | string,
    filename?: string,
  ) {
    const parseResult = parseSpreadsheet(bufferOrString, filename);
    const { items, skippedRows } = parseResult;

    if (items.length === 0 && skippedRows.length === 0) {
      throw new ValidationError(
        "The spreadsheet does not contain any recognizable product rows. Ensure headers contain at least 'Name' and 'MRP'.",
      );
    }

    if (items.length > MAX_IMPORT_ROWS) {
      throw new ValidationError(
        `Too many rows (${items.length}). Import at most ${MAX_IMPORT_ROWS} products per file.`,
      );
    }

    let createdProducts = 0;
    let updatedProducts = 0;
    let createdVariants = 0;
    let updatedVariants = 0;
    const errors: { row: number; name?: string; error: string }[] = [];

    // Add skipped rows as validation errors/notes
    for (const skipped of skippedRows) {
      errors.push({
        row: skipped.rowNumber,
        name: skipped.raw[0] || undefined,
        error: skipped.reason,
      });
    }

    // Cache brand, tax, category Lookups to minimize queries
    const brandCache = new Map<string, string>(); // name -> brandId
    const taxCache = new Map<number, string>(); // ratePercent -> taxClassId
    const categoryCache = new Map<string, string>(); // lowercase name -> categoryId
    const usedSlugsInBatch = new Set<string>();
    const usedSkusInBatch = new Set<string>();

    for (const item of items) {
      try {
        // 1. Resolve Brand
        let brandId: string | undefined = undefined;
        const brandName = (item.parentGroup || "").trim();
        if (brandName) {
          const lowerBrand = brandName.toLowerCase();
          if (brandCache.has(lowerBrand)) {
            brandId = brandCache.get(lowerBrand);
          } else {
            let brand = await this.productRepository.findBrandBySlugOrName(brandName);
            if (!brand) {
              brand = await this.productRepository.createBrand(
                brandName,
                this.generateSlug(brandName),
              );
            }
            brandId = brand.id;
            brandCache.set(lowerBrand, brand.id);
          }
        }

        // 2. Resolve TaxClass
        let taxClassId: string | undefined = undefined;
        const taxRate = item.taxRatePercent;
        if (taxCache.has(taxRate)) {
          taxClassId = taxCache.get(taxRate);
        } else {
          let taxClass = await this.productRepository.findTaxClassByRate(taxRate);
          if (!taxClass) {
            taxClass = await this.productRepository.createTaxClass(
              `GST ${taxRate}%`,
              taxRate,
            );
          }
          taxClassId = taxClass.id;
          taxCache.set(taxRate, taxClass.id);
        }

        // 3. Resolve Category (if provided)
        // Exports join multiple categories with "; ", so accept the same on import.
        const categoryIds: string[] = [];
        const catNames = (item.category || "")
          .split(/[;|]/)
          .map((c) => c.trim())
          .filter(Boolean);
        for (const catName of catNames) {
          const lowerCat = catName.toLowerCase();
          let id = categoryCache.get(lowerCat);
          if (!id) {
            let category =
              await this.productRepository.findCategoryBySlugOrName(catName);
            if (!category) {
              category = await this.productRepository.createCategory(
                catName,
                this.generateSlug(catName),
              );
            }
            id = category.id;
            categoryCache.set(lowerCat, id);
          }
          if (!categoryIds.includes(id)) categoryIds.push(id);
        }

        // 4. Check if variant exists by SKU, or product exists by name or slug
        let existingVariant = item.sku
          ? await this.productRepository.findVariantBySku(item.sku)
          : null;

        let existingProduct: any = existingVariant?.productId
          ? await this.productRepository.getProductByIdAdmin(existingVariant.productId)
          : await this.productRepository.findProductByNameOrSlug(
              item.name,
              this.generateSlug(item.name),
              { includeDeleted: true },
            );

        if (existingProduct) {
          // Update existing product & variant
          const targetVariantId =
            existingVariant?.id ??
            existingProduct.variants?.find((v: any) => !v.isDeleted)?.id ??
            existingProduct.variants?.[0]?.id;

          // A new SKU on a product matched by name is an additional variant,
          // not a reason to overwrite the first variant's price/stock.
          const addAsNewVariant = Boolean(item.sku) && !existingVariant;

          await this.productRepository.updateImportedProductAndVariant({
            productId: existingProduct.id,
            variantId: addAsNewVariant ? undefined : targetVariantId,
            createVariant: addAsNewVariant,
            brandId,
            taxClassId,
            categoryIds,
            hsn: item.hsn,
            mrpPaise: item.mrpPaise,
            sellingPricePaise: item.sellingPricePaise,
            stock: item.stock,
            sku: item.sku,
            ean: item.ean,
            weightGrams: item.weightGrams,
          });

          updatedProducts++;
          if (targetVariantId && !addAsNewVariant) {
            updatedVariants++;
          } else {
            createdVariants++;
          }
        } else {
          // Create new product & variant (strictly isActive: false)
          const finalSlug = await this.generateUniqueProductSlug(
            item.name,
            usedSlugsInBatch,
          );

          // Generate SKU if not provided
          let finalSku = item.sku;
          if (!finalSku) {
            const brandCode = (item.parentGroup || "PIN")
              .replace(/[^a-zA-Z0-9]/g, "")
              .slice(0, 3)
              .toUpperCase();
            const nameCode = item.name
              .replace(/[^a-zA-Z0-9]/g, "")
              .slice(0, 4)
              .toUpperCase();
            const priceCode = Math.round(item.mrp);
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            finalSku = `${brandCode}-${nameCode}-${priceCode}-${randSuffix}`;
          }

          // Ensure SKU uniqueness
          let skuCandidate = finalSku;
          let skuCounter = 1;
          while (
            usedSkusInBatch.has(skuCandidate) ||
            (await this.productRepository.findVariantBySku(skuCandidate))
          ) {
            skuCandidate = `${finalSku}-${skuCounter}`;
            skuCounter++;
          }
          finalSku = skuCandidate;
          usedSkusInBatch.add(finalSku);

          await this.productRepository.createImportedProductAndVariant({
            name: item.name,
            slug: finalSlug,
            brandId,
            taxClassId,
            categoryIds,
            hsn: item.hsn,
            mrpPaise: item.mrpPaise,
            sellingPricePaise: item.sellingPricePaise,
            stock: item.stock,
            sku: finalSku,
            ean: item.ean,
            weightGrams: item.weightGrams,
          });

          createdProducts++;
          createdVariants++;
        }
      } catch (err: any) {
        logger.error(
          { row: item.rowNumber, name: item.name, err },
          "Failed to process inventory row:",
        );
        errors.push({
          row: item.rowNumber,
          name: item.name,
          // Only operational (validation-style) messages reach the client;
          // database/internal error text stays in the logs.
          error:
            err instanceof BaseError ? err.message : "Failed to import row",
        });
      }
    }

    return {
      totalProcessed: items.length,
      createdProducts,
      updatedProducts,
      createdVariants,
      updatedVariants,
      skippedCount: errors.length,
      errors,
    };
  }

  /**
   * Exports inventory as CSV string or JSON dataset.
   */
  async exportInventory(filters: {
    status?: "ALL" | "ACTIVE" | "INACTIVE";
    brandId?: string;
    categoryId?: string;
    search?: string;
    format?: "csv" | "xlsx" | "json";
  }) {
    const products = await this.productRepository.getProductsForExport(filters);
    const rows: InventoryExportRow[] = [];

    for (const p of products) {
      const categoryNames =
        p.categories?.map((c: any) => c.category?.name).filter(Boolean).join("; ") || "";
      const brandName = p.brand?.name ?? "";
      const taxRate = p.taxClass ? Math.round(p.taxClass.rate * 100) / 10000 : 0.18;
      const hsn = p.model ?? "";
      const isProductActive = p.isActive;

      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          rows.push({
            name: p.name,
            mrp: v.price / 100, // paise to Rupees
            hsn,
            parentGroup: brandName,
            taxRate,
            sku: v.sku,
            sellingPrice:
              v.sellingPrice !== null && v.sellingPrice !== undefined
                ? v.sellingPrice / 100
                : null,
            stock: v.stock,
            category: categoryNames,
            status: isProductActive && v.isActive ? "ACTIVE" : "INACTIVE",
            ean: v.ean || p.ean || "",
            weightGrams: v.weightGrams ?? p.weightGrams ?? null,
          });
        }
      } else {
        rows.push({
          name: p.name,
          mrp: 0,
          hsn,
          parentGroup: brandName,
          taxRate,
          sku: "",
          sellingPrice: null,
          stock: 0,
          category: categoryNames,
          status: isProductActive ? "ACTIVE" : "INACTIVE",
          ean: p.ean || "",
          weightGrams: p.weightGrams ?? null,
        });
      }
    }

    if (filters.format === "json") {
      return {
        items: rows,
        count: rows.length,
      };
    }

    if (filters.format === "xlsx") {
      const buffer = generateInventoryXLSX(rows);
      const filename = `inventory-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      return {
        buffer,
        filename,
        count: rows.length,
      };
    }

    const csv = generateInventoryCSV(rows);
    const filename = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return {
      csv,
      filename,
      count: rows.length,
    };
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

    if (Array.isArray(explicitOptionValueIds)) {
      attachOptionValueIds.push(...(explicitOptionValueIds as string[]));
    }
    delete sanitizedData.optionValueIds;
    delete sanitizedData.optionValues;

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

    // Validate sellingPrice
    if (
      sanitizedData.sellingPrice !== undefined &&
      sanitizedData.sellingPrice !== null
    ) {
      const sp = sanitizedData.sellingPrice as number;
      if (sp < 0) {
        throw new ValidationError("Selling price cannot be negative");
      }
      const basePrice = (sanitizedData.price as number) ?? 0;
      if (sp > basePrice) {
        throw new ValidationError(
          "Selling price cannot be greater than the main price",
        );
      }
    }

    // Validate stock (cannot be negative)
    if (sanitizedData.stock && (sanitizedData.stock as number) < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Set default stock if not provided
    sanitizedData.stock = sanitizedData.stock ?? 0;

    // Optional per-variant tax class (otherwise the variant uses its product's tax class)
    const newTaxClassId = sanitizedData.taxClassId;
    delete sanitizedData.taxClassId;
    if (newTaxClassId) {
      await this.assertTaxClassExists(newTaxClassId);
      sanitizedData.taxClass = { connect: { id: newTaxClassId } };
    }

    // Set productId
    sanitizedData.product = {
      connect: { id: productId },
    };

    return this.productRepository.createProductVariant(
      productId,
      sanitizedData,
    );
  }

  private async assertTaxClassExists(taxClassId: string) {
    const taxClass = await this.productRepository.findTaxClassById(taxClassId);
    if (!taxClass) {
      throw new ValidationError("Tax class not found");
    }
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

    // Map legacy `size` / `shade` strings and explicit optionValueIds
    const attachOptionValueIds: string[] = [];
    if (sanitizedData.size) {
      const ov = await this.productRepository.findOptionValueByNameAndValue(
        "Size",
        sanitizedData.size as string,
      );
      if (ov) attachOptionValueIds.push(ov.id);
    }
    if (sanitizedData.shade) {
      const ov = await this.productRepository.findOptionValueByNameAndValue(
        "Shade",
        sanitizedData.shade as string,
      );
      if (ov) attachOptionValueIds.push(ov.id);
    }

    const explicitOptionValueIds = (sanitizedData.optionValueIds ??
      sanitizedData.optionValues) as unknown;
    if (Array.isArray(explicitOptionValueIds)) {
      attachOptionValueIds.push(...(explicitOptionValueIds as string[]));
    }

    const hasOptionValueUpdates =
      "optionValueIds" in sanitizedData ||
      "optionValues" in sanitizedData ||
      "size" in sanitizedData ||
      "shade" in sanitizedData;

    delete sanitizedData.optionValueIds;
    delete sanitizedData.optionValues;
    delete sanitizedData.size;
    delete sanitizedData.shade;

    if (hasOptionValueUpdates) {
      sanitizedData.optionValues = {
        deleteMany: {},
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

    // Validate sellingPrice
    if (
      sanitizedData.sellingPrice !== undefined &&
      sanitizedData.sellingPrice !== null
    ) {
      const sp = sanitizedData.sellingPrice as number;
      if (sp < 0) {
        throw new ValidationError("Selling price cannot be negative");
      }
      const effectiveBasePrice =
        (sanitizedData.price as number) ?? existingVariant.price;
      if (sp > effectiveBasePrice) {
        throw new ValidationError(
          "Selling price cannot be greater than the main price",
        );
      }
    } else if (
      sanitizedData.sellingPrice === undefined &&
      sanitizedData.price !== undefined &&
      existingVariant.sellingPrice !== null &&
      existingVariant.sellingPrice !== undefined
    ) {
      const newBasePrice = sanitizedData.price as number;
      if (existingVariant.sellingPrice > newBasePrice) {
        throw new ValidationError(
          "Existing selling price cannot be greater than the new main price",
        );
      }
    }

    // Validate stock (cannot be negative)
    if (sanitizedData.stock && (sanitizedData.stock as number) < 0) {
      throw new ValidationError("Stock cannot be negative");
    }

    // Per-variant tax class: a string overrides, null clears (inherit from the product)
    if ("taxClassId" in sanitizedData) {
      const taxClassId = sanitizedData.taxClassId;
      delete sanitizedData.taxClassId;
      if (taxClassId) {
        await this.assertTaxClassExists(taxClassId);
        sanitizedData.taxClass = { connect: { id: taxClassId } };
      } else if (taxClassId === null) {
        sanitizedData.taxClass = { disconnect: true };
      }
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
        const oldKey = extractS3KeyFromUrl(image.url);
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

  async deleteImage(id: string) {
    const image = await this.productRepository.getProductImageById(id);
    if (!image) throw new NotFoundError("Image not found");

    if (image.url && appConfig.S3_ENABLED) {
      try {
        const key = extractS3KeyFromUrl(image.url);
        if (key) {
          await deleteObject(key);
        }
      } catch (err) {
        logger.warn({ id, err }, "Failed to delete S3 object for image");
      }
    }

    return this.productRepository.hardDeleteImage(id);
  }

  softDeleteImage = this.deleteImage;

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

    // Look up in any state (the public getter hides deleted/inactive products)
    const product = await this.productRepository.getProductByIdAdmin(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Permanent deletion is only allowed from the trash
    if (!product.isDeleted) {
      throw new ValidationError(
        "Only archived (soft-deleted) products can be permanently deleted. Delete the product first.",
      );
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
    } = await this.productRepository.getProductHardDeleteDependencies(id);

    const blockers: string[] = [];
    if (productOrderCount || variantOrderCount) blockers.push("orders");
    if (cartCount) blockers.push("carts");
    if (wishlistCount) blockers.push("wishlists");
    if (featuredCount) blockers.push("featured sections");
    if (reviewCount) blockers.push("reviews");
    if (comboKitCount) blockers.push("combo kits");

    if (blockers.length > 0) {
      logger.warn(
        `Preventing hard-delete for product ${id} due to dependencies: ${blockers.join(", ")}`,
      );
      throw new ValidationError(
        `Cannot hard-delete product: dependent resources exist (${blockers.join(", ")}). Delete or detach those resources first.`,
      );
    }

    const { imageUrls } = await this.productRepository.hardDeleteProduct(id);

    // Remove image files only after the DB commit so a failed delete never
    // leaves live rows pointing at missing files. Best-effort: leftovers are logged.
    if (appConfig.S3_ENABLED) {
      for (const url of new Set(imageUrls)) {
        try {
          const key = extractS3KeyFromUrl(url);
          if (key) await deleteObject(key);
        } catch (err) {
          logger.warn({ productId: id, err }, "Failed to delete S3 object for hard-deleted product");
        }
      }
    }
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

  hardDeleteImage = this.deleteImage;

  // Helper methods for business logic
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces, underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Generates a collision-free slug checked against the database (including inactive & deleted).
   */
  private async generateUniqueProductSlug(
    name: string,
    usedSlugsInBatch?: Set<string>,
  ): Promise<string> {
    let baseSlug = this.generateSlug(name);
    if (!baseSlug) {
      baseSlug = `product-${Date.now()}`;
    }

    let candidate = baseSlug;
    let counter = 1;

    while (
      usedSlugsInBatch?.has(candidate) ||
      (await this.productRepository.findProductBySlugRaw(candidate))
    ) {
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugsInBatch?.add(candidate);
    return candidate;
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
