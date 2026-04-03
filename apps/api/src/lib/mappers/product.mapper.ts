/**
 * Product Response Mappers
 * 
 * These mappers transform database entities into optimized DTOs for different consumers:
 * - Public DTOs: Lean responses for frontend (exclude internal fields, timestamps, etc.)
 * - Admin DTOs: Full responses with all fields for admin/moderator use
 */

type ProductWithRelations = any; // Type will be inferred from Prisma

/**
 * Maps product to PUBLIC response (lean - only essential data for frontend)
 */
export const toPublicProduct = (product: ProductWithRelations) => {
  if (!product) return null;

  const toLeanImage = (img: any) =>
    img
      ? {
          id: img.id,
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        }
      : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    keyIngredients: product.keyIngredients,
    frontImageUrl: product.frontImageUrl,
    tags: product.tags,
    isActive: product.isActive,
    
    // Brand - minimal data
    brand: product.brand ? {
      name: product.brand.name,
      slug: product.brand.slug,
      logoUrl: product.brand.logoUrl,
    } : null,

    // Tax info - just what's needed for price calculation
    taxClass: product.taxClass ? {
      name: product.taxClass.name,
      rate: product.taxClass.rate,
    } : null,

    // Categories - minimal data
    categories: product.categories?.map((pc: any) => ({
      id: pc.category.id,
      name: pc.category.name,
      slug: pc.category.slug,
    })) || [],

    // Variants - lean version
    variants: product.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      isActive: v.isActive,
      
      // Primary image only (lean fields)
      image: toLeanImage(v.images?.find((img: any) => img.isPrimary) || v.images?.[0] || null),
      
      // Option values
      optionValues: v.optionValues?.map((ov: any) => ({
        optionName: ov.optionValue?.option?.name,
        valueName: ov.optionValue?.name,
      })).filter((ov: any) => ov.optionName && ov.valueName) || [],
    })) || [],

    // Filter values - for faceted search
    filterValues: product.filterValues?.map((fv: any) => ({
      filterGroup: fv.filterValue?.filterGroup?.name,
      value: fv.filterValue?.name,
      slug: fv.filterValue?.slug,
    })).filter((fv: any) => fv.filterGroup && fv.value) || [],

    // Stats for display (view count, etc.)
    viewCount: product.viewCount,
    purchasedCount: product.purchasedCount,
  };
};

/**
 * Maps product list to PUBLIC response (paginated)
 */
export const toPublicProductList = (result: { data: any[], pagination: any }) => {
  return {
    // Featured queries return wrapper rows { product, section, ... }.
    // Normalize both plain product rows and wrapper rows here.
    data: result.data
      .map((item: any) => toPublicProduct(item?.product ?? item))
      .filter(Boolean),
    pagination: result.pagination,
  };
};

/**
 * Maps product to ADMIN response (full data including internal fields)
 */
export const toAdminProduct = (product: ProductWithRelations) => {
  if (!product) return null;

  return {
    // All public fields
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    keyIngredients: product.keyIngredients,
    frontImageUrl: product.frontImageUrl,
    tags: product.tags,
    isActive: product.isActive,
    
    // ADMIN-ONLY fields
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    isDeleted: product.isDeleted,
    sortOrder: product.sortOrder,
    viewCount: product.viewCount,
    purchasedCount: product.purchasedCount,

    // SEO fields (admin only)
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    metaKeywords: product.metaKeywords,
    seoKeyword: product.seoKeyword,

    // Product attributes (admin only)
    model: product.model,
    ean: product.ean,

    // Shipping & stock settings
    requiresShipping: product.requiresShipping,
    outOfStockStatus: product.outOfStockStatus,

    // Dimensions with full data
    dimensionLength: product.dimensionLength,
    dimensionWidth: product.dimensionWidth,
    dimensionHeight: product.dimensionHeight,
    lengthClassId: product.lengthClassId,
    lengthClass: product.lengthClass,

    // Weight with full data
    weightGrams: product.weightGrams,
    weightClassId: product.weightClassId,
    weightClass: product.weightClass,

    // Full brand data
    brandId: product.brandId,
    brand: product.brand,

    // Full tax data
    taxClassId: product.taxClassId,
    taxClass: product.taxClass,

    // Full categories with IDs
    categories: product.categories?.map((pc: any) => ({
      productId: pc.productId,
      categoryId: pc.categoryId,
      category: pc.category,
    })) || [],

    // Full variants with all fields
    variants: product.variants?.map((v: any) => ({
      id: v.id,
      productId: v.productId,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      costPrice: v.costPrice,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      isActive: v.isActive,
      isDeleted: v.isDeleted,
      sortOrder: v.sortOrder,
      tags: v.tags,
      
      // All images
      images: v.images || [],
      
      // All option values
      optionValues: v.optionValues || [],
      
      // Timestamps
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })) || [],

    // Full filter values with IDs
    filterValues: product.filterValues || [],

    // Related products (admin only)
    relatedProducts: product.relatedProducts || [],
    relatedTo: product.relatedTo || [],

    // Featured products (admin only)
    featuredProducts: product.featuredProducts || [],
  };
};

/**
 * Maps product list to ADMIN response (paginated)
 */
export const toAdminProductList = (result: { data: any[], pagination: any }) => {
  return {
    data: result.data.map(toAdminProduct),
    pagination: result.pagination,
  };
};

/**
 * Maps variant to PUBLIC response
 */
export const toPublicVariant = (variant: any) => {
  if (!variant) return null;

  return {
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
    lowStockThreshold: variant.lowStockThreshold,
    isActive: variant.isActive,
    
    // Images - public URLs only
    images: variant.images?.filter((img: any) => !img.isDeleted).map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })) || [],
    
    // Option values
    optionValues: variant.optionValues?.map((ov: any) => ({
      optionName: ov.optionValue?.option?.name,
      optionSlug: ov.optionValue?.option?.slug,
      valueName: ov.optionValue?.name,
      valueSlug: ov.optionValue?.slug,
    })) || [],
  };
};

/**
 * Maps variant to ADMIN response
 */
export const toAdminVariant = (variant: any) => {
  if (!variant) return null;

  return {
    // All fields
    ...variant,
    
    // Ensure timestamps are included
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };
};
