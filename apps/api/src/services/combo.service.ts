import { Prisma } from "../generated/prisma/client.js";
import { ValidationError, NotFoundError } from "../lib/error.js";
import logger from "../lib/logger.js";
import {
  ComboRepository,
  ComboKitListFilters,
  ComboKitItemUpdateInput,
} from "../repositories/combo.repository.js";

type ComboKitPricingStrategy = "FIXED_PRICE" | "CALCULATED" | "DYNAMIC";
type ComboKitDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

type ComboKitItemDTO = {
  productVariantId: string;
  quantity: number;
  sortOrder?: number;
  originalPrice?: number;
  discountedPrice?: number;
  isRequired?: boolean;
};

type ComboKitCreateDTO = {
  name: string;
  slug?: string;
  description?: string;
  audience?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  seoKeyword?: string;
  imageUrl?: string;
  pricingStrategy?: ComboKitPricingStrategy;
  discountType?: ComboKitDiscountType;
  discountValue?: number;
  tags?: string[];
  sortOrder?: number;
  price: number;
  isActive?: boolean;
  items?: ComboKitItemDTO[];
};

type ComboKitUpdateDTO = Partial<ComboKitCreateDTO>;

type ComboKitStatusDTO = {
  isActive: boolean;
};

type ComboKitPricingDTO = {
  price?: number;
  pricingStrategy?: ComboKitPricingStrategy;
  discountType?: ComboKitDiscountType | null;
  discountValue?: number | null;
};

type ComboKitMetadataDTO = {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  seoKeyword?: string;
  tags?: string[];
  imageUrl?: string | null;
  sortOrder?: number;
};

type SanitizedComboKitCreatePayload = {
  name: string;
  slug: string;
  description: string | null;
  audience: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  seoKeyword: string | null;
  imageUrl: string | null;
  pricingStrategy: ComboKitPricingStrategy;
  discountType?: ComboKitDiscountType;
  discountValue?: number;
  tags: string[];
  sortOrder: number;
  price: number;
  isActive: boolean;
  items: ComboKitItemDTO[];
};

export class ComboService {
  constructor(private comboRepository: ComboRepository) {}

  async getComboKits(filters: ComboKitListFilters) {
    return this.comboRepository.getComboKits({
      ...filters,
      includeDeleted: false,
    });
  }

  async getComboKitById(id: string) {
    return this.comboRepository.getComboKitById(id, false);
  }

  async getComboKitBySlug(slug: string) {
    return this.comboRepository.getComboKitBySlug(slug);
  }

  async searchComboKits(
    query: string,
    page: number,
    limit: number,
    isActive?: boolean,
  ) {
    return this.comboRepository.getComboKits({
      page,
      limit,
      search: query,
      isActive,
      includeDeleted: false,
    });
  }

  async getComboKitItems(id: string) {
    const comboKit = await this.comboRepository.getComboKitById(id, false);
    if (!comboKit) {
      throw new NotFoundError("Combo kit not found");
    }

    return this.comboRepository.getComboKitItems(id);
  }

  async getAllComboKitsAdmin(filters: ComboKitListFilters) {
    return this.comboRepository.getComboKits({
      ...filters,
      includeDeleted: true,
    });
  }

  async getDeletedComboKitsAdmin(filters: ComboKitListFilters) {
    return this.comboRepository.getComboKits({
      ...filters,
      includeDeleted: true,
      onlyDeleted: true,
    });
  }

  async getInactiveComboKitsAdmin(filters: ComboKitListFilters) {
    return this.comboRepository.getComboKits({
      ...filters,
      includeDeleted: false,
      isActive: false,
    });
  }

  async getComboKitByIdAdmin(id: string) {
    const comboKit = await this.comboRepository.getComboKitById(id, true);
    if (!comboKit) {
      throw new NotFoundError("Combo kit not found");
    }

    return comboKit;
  }

  async createComboKit(data: ComboKitCreateDTO) {
    const sanitized = this.sanitizeCreatePayload(data);

    const existing = await this.comboRepository.getComboKitBySlug(
      sanitized.slug,
    );
    if (existing) {
      throw new ValidationError("Combo kit with this slug already exists");
    }

    const normalizedItems = await this.normalizeAndValidateItems(
      sanitized.items ?? [],
    );
    const finalPrice = this.resolvePrice(
      sanitized.price,
      sanitized.pricingStrategy,
      normalizedItems,
    );

    this.validateDiscount(
      sanitized.discountType,
      sanitized.discountValue,
      finalPrice,
    );

    const createInput: Prisma.ComboKitCreateInput = {
      name: sanitized.name,
      slug: sanitized.slug,
      description: sanitized.description,
      audience: sanitized.audience,
      metaTitle: sanitized.metaTitle,
      metaDescription: sanitized.metaDescription,
      metaKeywords: sanitized.metaKeywords,
      seoKeyword: sanitized.seoKeyword,
      imageUrl: sanitized.imageUrl,
      pricingStrategy: sanitized.pricingStrategy,
      discountType: sanitized.discountType,
      discountValue: sanitized.discountValue,
      tags: sanitized.tags,
      sortOrder: sanitized.sortOrder,
      price: finalPrice,
      isActive: sanitized.isActive,
      items:
        normalizedItems.length > 0
          ? {
              create: normalizedItems.map((item) => ({
                productVariant: {
                  connect: {
                    id: item.productVariantId,
                  },
                },
                quantity: item.quantity,
                sortOrder: item.sortOrder,
                originalPrice: item.originalPrice,
                discountedPrice: item.discountedPrice,
                isRequired: item.isRequired,
              })),
            }
          : undefined,
    };

    return this.comboRepository.createComboKit(createInput);
  }

  async updateComboKit(id: string, data: ComboKitUpdateDTO) {
    const existing = await this.comboRepository.getComboKitById(id, true);
    if (!existing) {
      throw new NotFoundError("Combo kit not found");
    }

    const sanitized = this.sanitizeUpdatePayload(data);

    if (sanitized.slug && sanitized.slug !== existing.slug) {
      const slugExists = await this.comboRepository.getComboKitBySlug(
        sanitized.slug,
      );
      if (slugExists) {
        throw new ValidationError("Combo kit with this slug already exists");
      }
    }

    const updatedItems =
      sanitized.items !== undefined
        ? await this.normalizeAndValidateItems(sanitized.items)
        : [];

    const effectivePricingStrategy =
      sanitized.pricingStrategy ??
      (existing.pricingStrategy as ComboKitPricingStrategy);

    const effectivePrice = this.resolvePrice(
      sanitized.price ?? existing.price,
      effectivePricingStrategy,
      sanitized.items !== undefined
        ? updatedItems
        : existing.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            sortOrder: item.sortOrder,
            originalPrice: item.originalPrice ?? undefined,
            discountedPrice: item.discountedPrice ?? undefined,
            isRequired: item.isRequired,
          })),
    );

    const discountType =
      sanitized.discountType === undefined
        ? (existing.discountType as ComboKitDiscountType | null)
        : sanitized.discountType;

    const discountValue =
      sanitized.discountValue === undefined
        ? existing.discountValue
        : sanitized.discountValue;

    this.validateDiscount(
      discountType ?? undefined,
      discountValue ?? undefined,
      effectivePrice,
    );

    const updateInput: Prisma.ComboKitUpdateInput = {
      ...(sanitized.name !== undefined && { name: sanitized.name }),
      ...(sanitized.slug !== undefined && { slug: sanitized.slug }),
      ...(sanitized.description !== undefined && {
        description: sanitized.description,
      }),
      ...(sanitized.audience !== undefined && { audience: sanitized.audience }),
      ...(sanitized.metaTitle !== undefined && {
        metaTitle: sanitized.metaTitle,
      }),
      ...(sanitized.metaDescription !== undefined && {
        metaDescription: sanitized.metaDescription,
      }),
      ...(sanitized.metaKeywords !== undefined && {
        metaKeywords: sanitized.metaKeywords,
      }),
      ...(sanitized.seoKeyword !== undefined && {
        seoKeyword: sanitized.seoKeyword,
      }),
      ...(sanitized.imageUrl !== undefined && { imageUrl: sanitized.imageUrl }),
      ...(sanitized.pricingStrategy !== undefined && {
        pricingStrategy: sanitized.pricingStrategy,
      }),
      ...(sanitized.discountType !== undefined && {
        discountType: sanitized.discountType,
      }),
      ...(sanitized.discountValue !== undefined && {
        discountValue: sanitized.discountValue,
      }),
      ...(sanitized.tags !== undefined && { tags: sanitized.tags }),
      ...(sanitized.sortOrder !== undefined && {
        sortOrder: sanitized.sortOrder,
      }),
      ...(sanitized.isActive !== undefined && { isActive: sanitized.isActive }),
      price: effectivePrice,
    };

    const updated = await this.comboRepository.updateComboKit(id, updateInput);

    if (sanitized.items !== undefined) {
      await this.comboRepository.bulkSetComboKitItems(id, updatedItems);
      return this.getComboKitByIdAdmin(id);
    }

    return updated;
  }

  async updateComboKitStatus(id: string, data: ComboKitStatusDTO) {
    await this.assertComboKitExists(id, true);
    return this.comboRepository.updateComboKitStatus(id, data.isActive);
  }

  async updateComboKitPricing(id: string, data: ComboKitPricingDTO) {
    const comboKit = await this.assertComboKitExists(id, true);

    const strategy =
      data.pricingStrategy ??
      (comboKit.pricingStrategy as ComboKitPricingStrategy);
    const items = comboKit.items.map((item) => ({
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      sortOrder: item.sortOrder,
      originalPrice: item.originalPrice ?? undefined,
      discountedPrice: item.discountedPrice ?? undefined,
      isRequired: item.isRequired,
    }));

    const computedPrice = this.resolvePrice(
      data.price ?? comboKit.price,
      strategy,
      items,
    );

    const discountType =
      data.discountType === undefined
        ? (comboKit.discountType as ComboKitDiscountType | null)
        : data.discountType;

    const discountValue =
      data.discountValue === undefined
        ? comboKit.discountValue
        : data.discountValue;

    this.validateDiscount(
      discountType ?? undefined,
      discountValue ?? undefined,
      computedPrice,
    );

    return this.comboRepository.updateComboKitPricing(id, {
      ...(data.pricingStrategy !== undefined && {
        pricingStrategy: data.pricingStrategy,
      }),
      ...(data.discountType !== undefined && {
        discountType: data.discountType,
      }),
      ...(data.discountValue !== undefined && {
        discountValue: data.discountValue,
      }),
      price: computedPrice,
    });
  }

  async updateComboKitMetadata(id: string, data: ComboKitMetadataDTO) {
    await this.assertComboKitExists(id, true);

    const sanitized = {
      ...(data.metaTitle !== undefined && {
        metaTitle: data.metaTitle.trim() || null,
      }),
      ...(data.metaDescription !== undefined && {
        metaDescription: data.metaDescription.trim() || null,
      }),
      ...(data.metaKeywords !== undefined && {
        metaKeywords: data.metaKeywords.trim() || null,
      }),
      ...(data.seoKeyword !== undefined && {
        seoKeyword: data.seoKeyword.trim() || null,
      }),
      ...(data.tags !== undefined && {
        tags: this.normalizeTags(data.tags),
      }),
      ...(data.imageUrl !== undefined && {
        imageUrl: data.imageUrl,
      }),
      ...(data.sortOrder !== undefined && {
        sortOrder: data.sortOrder,
      }),
    };

    return this.comboRepository.updateComboKitMetadata(id, sanitized);
  }

  async addComboKitItem(comboKitId: string, data: ComboKitItemDTO) {
    const comboKit = await this.assertComboKitExists(comboKitId, true);
    const normalizedItems = await this.normalizeAndValidateItems([data]);
    const normalized = normalizedItems[0];
    if (!normalized) {
      throw new ValidationError("Unable to process combo kit item");
    }

    const duplicate = comboKit.items.find(
      (item) => item.productVariantId === normalized.productVariantId,
    );
    if (duplicate) {
      throw new ValidationError(
        "Product variant already exists in this combo kit",
      );
    }

    return this.comboRepository.addComboKitItem(comboKitId, normalized);
  }

  async updateComboKitItem(
    comboKitId: string,
    itemId: string,
    data: ComboKitItemUpdateInput,
  ) {
    await this.assertComboKitExists(comboKitId, true);

    const existingItem = await this.comboRepository.getComboKitItemById(itemId);
    if (!existingItem || existingItem.comboKitId !== comboKitId) {
      throw new NotFoundError("Combo kit item not found");
    }

    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new ValidationError("Quantity must be at least 1");
    }

    if (
      data.originalPrice !== undefined &&
      data.discountedPrice !== undefined &&
      data.discountedPrice > data.originalPrice
    ) {
      throw new ValidationError(
        "discountedPrice cannot be greater than originalPrice",
      );
    }

    return this.comboRepository.updateComboKitItem(itemId, data);
  }

  async removeComboKitItem(comboKitId: string, itemId: string) {
    await this.assertComboKitExists(comboKitId, true);

    const existingItem = await this.comboRepository.getComboKitItemById(itemId);
    if (!existingItem || existingItem.comboKitId !== comboKitId) {
      throw new NotFoundError("Combo kit item not found");
    }

    return this.comboRepository.removeComboKitItem(itemId);
  }

  async reorderComboKitItems(
    comboKitId: string,
    items: Array<{ id: string; sortOrder: number }>,
  ) {
    await this.assertComboKitExists(comboKitId, true);

    if (items.length === 0) {
      throw new ValidationError("items is required");
    }

    return this.comboRepository.reorderComboKitItems(comboKitId, items);
  }

  async bulkSetComboKitItems(comboKitId: string, items: ComboKitItemDTO[]) {
    await this.assertComboKitExists(comboKitId, true);
    const normalized = await this.normalizeAndValidateItems(items);

    if (normalized.length === 0) {
      throw new ValidationError("At least one combo item is required");
    }

    return this.comboRepository.bulkSetComboKitItems(comboKitId, normalized);
  }

  async softDeleteComboKit(id: string) {
    await this.assertComboKitExists(id, true);
    return this.comboRepository.softDeleteComboKit(id);
  }

  async restoreComboKit(id: string) {
    const comboKit = await this.comboRepository.getComboKitById(id, true);
    if (!comboKit) {
      throw new NotFoundError("Combo kit not found");
    }

    return this.comboRepository.restoreComboKit(id);
  }

  async hardDeleteComboKit(id: string) {
    await this.assertComboKitExists(id, true);

    const dependencies = await this.comboRepository.countComboKitReferences(id);
    const blockers: string[] = [];

    if (dependencies.cartCount > 0) {
      blockers.push("carts");
    }

    if (dependencies.orderCount > 0) {
      blockers.push("orders");
    }

    if (blockers.length > 0) {
      logger.warn(
        `Preventing hard-delete for combo kit ${id} due to dependencies: ${blockers.join(", ")}`,
      );
      throw new ValidationError(
        `Cannot hard-delete combo kit: dependent resources exist (${blockers.join(", ")}). Delete or detach those resources first.`,
      );
    }

    return this.comboRepository.hardDeleteComboKit(id);
  }

  async getComboKitDependencies(id: string) {
    await this.assertComboKitExists(id, true);
    return this.comboRepository.countComboKitReferences(id);
  }

  async getComboKitAnalytics(id: string) {
    const analytics = await this.comboRepository.getComboKitAnalytics(id);
    if (!analytics.comboKit) {
      throw new NotFoundError("Combo kit not found");
    }

    return analytics;
  }

  async incrementComboKitView(id: string) {
    await this.assertComboKitExists(id, false);
    return this.comboRepository.incrementComboKitViewCount(id);
  }

  async incrementComboKitPurchase(id: string, quantity: number) {
    await this.assertComboKitExists(id, true);
    if (quantity <= 0) {
      throw new ValidationError("quantity must be at least 1");
    }

    return this.comboRepository.incrementComboKitPurchasedCount(id, quantity);
  }

  private async assertComboKitExists(id: string, includeDeleted: boolean) {
    const comboKit = await this.comboRepository.getComboKitById(
      id,
      includeDeleted,
    );
    if (!comboKit) {
      throw new NotFoundError("Combo kit not found");
    }

    return comboKit;
  }

  private sanitizeCreatePayload(
    data: ComboKitCreateDTO,
  ): SanitizedComboKitCreatePayload {
    const name = data.name?.trim();
    if (!name) {
      throw new ValidationError("name is required");
    }

    const pricingStrategy = data.pricingStrategy ?? "FIXED_PRICE";

    return {
      name,
      slug: this.sanitizeOrGenerateSlug(data.slug, name),
      description: data.description?.trim() || null,
      audience: data.audience?.trim() || null,
      metaTitle: data.metaTitle?.trim() || null,
      metaDescription: data.metaDescription?.trim() || null,
      metaKeywords: data.metaKeywords?.trim() || null,
      seoKeyword: data.seoKeyword?.trim() || null,
      imageUrl: data.imageUrl?.trim() || null,
      pricingStrategy,
      discountType: data.discountType,
      discountValue: data.discountValue,
      tags: this.normalizeTags(data.tags ?? []),
      sortOrder: data.sortOrder ?? 0,
      price: data.price,
      isActive: data.isActive ?? true,
      items: data.items ?? [],
    };
  }

  private sanitizeUpdatePayload(data: ComboKitUpdateDTO): ComboKitUpdateDTO {
    const sanitized: ComboKitUpdateDTO = {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.slug !== undefined && {
        slug: this.sanitizeSlug(data.slug),
      }),
      ...(data.description !== undefined && {
        description: data.description.trim() || undefined,
      }),
      ...(data.audience !== undefined && {
        audience: data.audience.trim() || undefined,
      }),
      ...(data.metaTitle !== undefined && {
        metaTitle: data.metaTitle.trim() || undefined,
      }),
      ...(data.metaDescription !== undefined && {
        metaDescription: data.metaDescription.trim() || undefined,
      }),
      ...(data.metaKeywords !== undefined && {
        metaKeywords: data.metaKeywords.trim() || undefined,
      }),
      ...(data.seoKeyword !== undefined && {
        seoKeyword: data.seoKeyword.trim() || undefined,
      }),
      ...(data.imageUrl !== undefined && {
        imageUrl: data.imageUrl.trim() || undefined,
      }),
      ...(data.pricingStrategy !== undefined && {
        pricingStrategy: data.pricingStrategy,
      }),
      ...(data.discountType !== undefined && {
        discountType: data.discountType,
      }),
      ...(data.discountValue !== undefined && {
        discountValue: data.discountValue,
      }),
      ...(data.tags !== undefined && {
        tags: this.normalizeTags(data.tags),
      }),
      ...(data.sortOrder !== undefined && {
        sortOrder: data.sortOrder,
      }),
      ...(data.price !== undefined && {
        price: data.price,
      }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
      ...(data.items !== undefined && {
        items: data.items,
      }),
    };

    if (sanitized.name !== undefined && sanitized.name.length === 0) {
      throw new ValidationError("name cannot be empty");
    }

    return sanitized;
  }

  private sanitizeOrGenerateSlug(
    slug: string | undefined,
    fallback: string,
  ): string {
    if (slug && slug.trim().length > 0) {
      return this.sanitizeSlug(slug);
    }

    return this.sanitizeSlug(fallback);
  }

  private sanitizeSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private normalizeTags(tags: string[]): string[] {
    const set = new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0),
    );

    return Array.from(set);
  }

  private async normalizeAndValidateItems(items: ComboKitItemDTO[]) {
    const normalized: Array<{
      productVariantId: string;
      quantity: number;
      sortOrder: number;
      originalPrice?: number;
      discountedPrice?: number;
      isRequired: boolean;
    }> = [];

    const seenVariantIds = new Set<string>();

    for (const [index, item] of items.entries()) {
      const productVariantId = item.productVariantId?.trim();
      if (!productVariantId) {
        throw new ValidationError(
          "productVariantId is required for every combo item",
        );
      }

      if (seenVariantIds.has(productVariantId)) {
        throw new ValidationError(
          `Duplicate productVariantId in combo items: ${productVariantId}`,
        );
      }
      seenVariantIds.add(productVariantId);

      const variant =
        await this.comboRepository.findProductVariantById(productVariantId);
      if (!variant) {
        throw new ValidationError(
          `Product variant not found or inactive: ${productVariantId}`,
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new ValidationError("quantity must be an integer >= 1");
      }

      const originalPrice = item.originalPrice ?? variant.price;
      const discountedPrice = item.discountedPrice;

      if (originalPrice < 0) {
        throw new ValidationError("originalPrice cannot be negative");
      }

      if (discountedPrice !== undefined && discountedPrice < 0) {
        throw new ValidationError("discountedPrice cannot be negative");
      }

      if (discountedPrice !== undefined && discountedPrice > originalPrice) {
        throw new ValidationError(
          "discountedPrice cannot be greater than originalPrice",
        );
      }

      normalized.push({
        productVariantId,
        quantity: item.quantity,
        sortOrder: item.sortOrder ?? index,
        originalPrice,
        discountedPrice,
        isRequired: item.isRequired ?? true,
      });
    }

    return normalized;
  }

  private resolvePrice(
    explicitPrice: number,
    pricingStrategy: ComboKitPricingStrategy,
    items: Array<{
      quantity: number;
      originalPrice?: number;
      discountedPrice?: number;
    }>,
  ): number {
    if (pricingStrategy === "FIXED_PRICE") {
      if (!Number.isInteger(explicitPrice) || explicitPrice < 0) {
        throw new ValidationError("price must be an integer >= 0");
      }
      return explicitPrice;
    }

    if (items.length === 0) {
      throw new ValidationError(
        "At least one item is required for CALCULATED or DYNAMIC pricing",
      );
    }

    const calculatedPrice = items.reduce((sum, item) => {
      const effectiveItemPrice =
        item.discountedPrice ?? item.originalPrice ?? 0;
      return sum + effectiveItemPrice * item.quantity;
    }, 0);

    return calculatedPrice;
  }

  private validateDiscount(
    discountType: ComboKitDiscountType | undefined,
    discountValue: number | undefined,
    price: number,
  ) {
    if (discountType && discountValue === undefined) {
      throw new ValidationError(
        "discountValue is required when discountType is set",
      );
    }

    if (!discountType && discountValue !== undefined) {
      throw new ValidationError(
        "discountType is required when discountValue is set",
      );
    }

    if (!discountType || discountValue === undefined) {
      return;
    }

    if (discountType === "PERCENTAGE") {
      if (discountValue <= 0 || discountValue > 100) {
        throw new ValidationError("Percentage discount must be > 0 and <= 100");
      }
    }

    if (discountType === "FIXED_AMOUNT") {
      if (discountValue <= 0) {
        throw new ValidationError("Fixed amount discount must be > 0");
      }
      if (discountValue > price) {
        throw new ValidationError(
          "Fixed amount discount cannot exceed combo price",
        );
      }
    }
  }
}
