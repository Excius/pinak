import type {
  ComboKitDiscountType,
  ComboKitPricingStrategy,
} from "../../generated/prisma/enums.js";

type ComboPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ComboProductImageRecord = {
  id: string;
  url: string;
  isPrimary: boolean;
  altText: string | null;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
};

type ComboOptionRecord = {
  id: string;
  name: string;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type ComboOptionValueRecord = {
  id: string;
  optionId: string;
  value: string;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  option?: ComboOptionRecord;
};

type ComboVariantOptionValueRecord = {
  variantId?: string;
  optionValueId?: string;
  optionValue?: ComboOptionValueRecord;
};

type ComboProductVariantRecord = {
  id: string;
  productId?: string;
  sku: string;
  ean?: string | null;
  tags?: string[];
  price: number;
  comparePrice?: number | null;
  stock: number;
  weightGrams?: number | null;
  weightClassId?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  images?: ComboProductImageRecord[];
  optionValues?: ComboVariantOptionValueRecord[];
  product?: {
    taxClass?: {
      rate: number;
    } | null;
  } | null;
};

type ComboKitItemRecord = {
  id: string;
  comboKitId?: string;
  productVariantId: string;
  quantity: number;
  sortOrder: number;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  isRequired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  productVariant?: ComboProductVariantRecord | null;
};

type ComboKitRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  audience: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  seoKeyword: string | null;
  price: number;
  pricingStrategy: ComboKitPricingStrategy;
  discountType: ComboKitDiscountType | null;
  discountValue: number | null;
  tags: string[];
  sortOrder: number;
  viewCount: number;
  purchasedCount: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  images?: Array<{
    id: string;
    comboKitId: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  items: ComboKitItemRecord[];
};

type ComboKitListResult = {
  data: ComboKitRecord[];
  pagination: ComboPagination;
};

export type PublicComboKitVariant = {
  id: string;
  sku: string;
  price: number;
  taxAmount?: number;
  priceWithTax?: number;
  comparePriceWithTax?: number | null;
  stock: number;
  imageUrl: string | null;
  optionValues: Array<{
    optionName: string;
    value: string;
  }>;
};

export type PublicComboKitItem = {
  id: string;
  productVariantId: string;
  quantity: number;
  sortOrder: number;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  isRequired: boolean;
  productVariant: PublicComboKitVariant | null;
};

export type PublicComboKit = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  audience: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  seoKeyword: string | null;
  price: number;
  pricingStrategy: ComboKitPricingStrategy;
  discountType: ComboKitDiscountType | null;
  discountValue: number | null;
  tags: string[];
  viewCount: number;
  purchasedCount: number;
  isActive: boolean;
  images: Array<{
    id: string;
    comboKitId: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  items: PublicComboKitItem[];
};

export type PublicComboKitList = {
  items: PublicComboKit[];
  pagination: ComboPagination;
};

export type AdminComboKitVariant = {
  id: string;
  productId?: string;
  sku: string;
  ean?: string | null;
  tags: string[];
  price: number;
  taxAmount?: number;
  priceWithTax?: number;
  comparePrice?: number | null;
  comparePriceWithTax?: number | null;
  stock: number;
  weightGrams?: number | null;
  weightClassId?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  images: ComboProductImageRecord[];
  optionValues: ComboVariantOptionValueRecord[];
};

export type AdminComboKitItem = {
  id: string;
  comboKitId?: string;
  productVariantId: string;
  quantity: number;
  sortOrder: number;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  isRequired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  productVariant: AdminComboKitVariant | null;
};

export type AdminComboKit = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  audience: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  seoKeyword: string | null;
  price: number;
  pricingStrategy: ComboKitPricingStrategy;
  discountType: ComboKitDiscountType | null;
  discountValue: number | null;
  tags: string[];
  sortOrder: number;
  viewCount: number;
  purchasedCount: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    comboKitId: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  items: AdminComboKitItem[];
};

export type AdminComboKitList = {
  items: AdminComboKit[];
  pagination: ComboPagination;
};

const getPrimaryImageUrl = (
  images: ComboProductImageRecord[] | undefined,
): string | null => {
  if (!images || images.length === 0) {
    return null;
  }

  const visibleImages = images.filter((image) => !image.isDeleted);
  const primary =
    visibleImages.find((image) => image.isPrimary) ?? visibleImages[0];
  return primary?.url ?? null;
};

const toPublicComboKitVariant = (
  variant: ComboProductVariantRecord,
): PublicComboKitVariant => {
  const taxRate = variant.product?.taxClass?.rate ?? 0;
  const price = variant.price;
  const comparePrice = variant.comparePrice ?? (variant as any).compareAtPrice ?? null;
  const taxAmount = Math.round((price * taxRate) / 100);
  const priceWithTax = price + taxAmount;
  const comparePriceWithTax = comparePrice != null
    ? comparePrice + Math.round((comparePrice * taxRate) / 100)
    : null;

  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    taxAmount,
    priceWithTax,
    comparePriceWithTax,
    stock: variant.stock,
    imageUrl: getPrimaryImageUrl(variant.images),
    optionValues: (variant.optionValues ?? [])
      .map((entry) => {
        const optionName = entry.optionValue?.option?.name;
        const value = entry.optionValue?.value;
        if (!optionName || !value) {
          return null;
        }
        return {
          optionName,
          value,
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          optionName: string;
          value: string;
        } => entry !== null,
      ),
  };
};

const toAdminComboKitVariant = (
  variant: ComboProductVariantRecord,
): AdminComboKitVariant => {
  const taxRate = variant.product?.taxClass?.rate ?? 0;
  const price = variant.price;
  const comparePrice = variant.comparePrice ?? (variant as any).compareAtPrice ?? null;
  const taxAmount = Math.round((price * taxRate) / 100);
  const priceWithTax = price + taxAmount;
  const comparePriceWithTax = comparePrice != null
    ? comparePrice + Math.round((comparePrice * taxRate) / 100)
    : null;

  return {
    id: variant.id,
    ...(variant.productId !== undefined && {
      productId: variant.productId,
    }),
    sku: variant.sku,
    ...(variant.ean !== undefined && { ean: variant.ean }),
    tags: variant.tags ?? [],
    price: variant.price,
    taxAmount,
    priceWithTax,
    ...(variant.comparePrice !== undefined && {
      comparePrice: variant.comparePrice,
    }),
    comparePriceWithTax,
    stock: variant.stock,
    ...(variant.weightGrams !== undefined && { weightGrams: variant.weightGrams }),
    ...(variant.weightClassId !== undefined && {
      weightClassId: variant.weightClassId,
    }),
    ...(variant.isActive !== undefined && { isActive: variant.isActive }),
    ...(variant.isDeleted !== undefined && { isDeleted: variant.isDeleted }),
    ...(variant.createdAt !== undefined && { createdAt: variant.createdAt }),
    ...(variant.updatedAt !== undefined && { updatedAt: variant.updatedAt }),
    images: variant.images ?? [],
    optionValues: variant.optionValues ?? [],
  };
};

export const toPublicComboKitItem = (
  item: ComboKitItemRecord,
): PublicComboKitItem => ({
  id: item.id,
  productVariantId: item.productVariantId,
  quantity: item.quantity,
  sortOrder: item.sortOrder,
  ...(item.originalPrice !== undefined && { originalPrice: item.originalPrice }),
  ...(item.discountedPrice !== undefined && {
    discountedPrice: item.discountedPrice,
  }),
  isRequired: item.isRequired,
  productVariant: item.productVariant
    ? toPublicComboKitVariant(item.productVariant)
    : null,
});

export const toPublicComboKitItems = (
  items: ComboKitItemRecord[],
): PublicComboKitItem[] => items.map(toPublicComboKitItem);

export const toPublicComboKit = (comboKit: ComboKitRecord): PublicComboKit => ({
  id: comboKit.id,
  name: comboKit.name,
  slug: comboKit.slug,
  description: comboKit.description,
  audience: comboKit.audience,
  metaTitle: comboKit.metaTitle,
  metaDescription: comboKit.metaDescription,
  metaKeywords: comboKit.metaKeywords,
  seoKeyword: comboKit.seoKeyword,
  price: comboKit.price,
  pricingStrategy: comboKit.pricingStrategy,
  discountType: comboKit.discountType,
  discountValue: comboKit.discountValue,
  tags: comboKit.tags,
  viewCount: comboKit.viewCount,
  purchasedCount: comboKit.purchasedCount,
  isActive: comboKit.isActive,
  images: (comboKit.images ?? []).map((img) => ({
    id: img.id,
    comboKitId: img.comboKitId,
    url: img.url,
    altText: img.altText,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  })),
  items: toPublicComboKitItems(comboKit.items),
});

export const toPublicComboKitList = (
  result: ComboKitListResult,
): PublicComboKitList => ({
  items: result.data.map(toPublicComboKit),
  pagination: result.pagination,
});

export const toAdminComboKitItem = (
  item: ComboKitItemRecord,
): AdminComboKitItem => ({
  id: item.id,
  ...(item.comboKitId !== undefined && {
    comboKitId: item.comboKitId,
  }),
  productVariantId: item.productVariantId,
  quantity: item.quantity,
  sortOrder: item.sortOrder,
  ...(item.originalPrice !== undefined && { originalPrice: item.originalPrice }),
  ...(item.discountedPrice !== undefined && {
    discountedPrice: item.discountedPrice,
  }),
  isRequired: item.isRequired,
  ...(item.createdAt !== undefined && { createdAt: item.createdAt }),
  ...(item.updatedAt !== undefined && { updatedAt: item.updatedAt }),
  productVariant: item.productVariant
    ? toAdminComboKitVariant(item.productVariant)
    : null,
});

export const toAdminComboKitItems = (
  items: ComboKitItemRecord[],
): AdminComboKitItem[] => items.map(toAdminComboKitItem);

export const toAdminComboKit = (comboKit: ComboKitRecord): AdminComboKit => ({
  id: comboKit.id,
  name: comboKit.name,
  slug: comboKit.slug,
  description: comboKit.description,
  audience: comboKit.audience,
  metaTitle: comboKit.metaTitle,
  metaDescription: comboKit.metaDescription,
  metaKeywords: comboKit.metaKeywords,
  seoKeyword: comboKit.seoKeyword,
  price: comboKit.price,
  pricingStrategy: comboKit.pricingStrategy,
  discountType: comboKit.discountType,
  discountValue: comboKit.discountValue,
  tags: comboKit.tags,
  sortOrder: comboKit.sortOrder,
  viewCount: comboKit.viewCount,
  purchasedCount: comboKit.purchasedCount,
  isActive: comboKit.isActive,
  isDeleted: comboKit.isDeleted,
  createdAt: comboKit.createdAt,
  updatedAt: comboKit.updatedAt,
  images: (comboKit.images ?? []).map((img) => ({
    id: img.id,
    comboKitId: img.comboKitId,
    url: img.url,
    altText: img.altText,
    isPrimary: img.isPrimary,
    sortOrder: img.sortOrder,
  })),
  items: toAdminComboKitItems(comboKit.items),
});

export const toAdminComboKitList = (
  result: ComboKitListResult,
): AdminComboKitList => ({
  items: result.data.map(toAdminComboKit),
  pagination: result.pagination,
});
