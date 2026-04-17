import { apiRequest } from "./api";
import type { BrandApi } from "@repo/types";

// Type imports for brand service
type ListBrandsResponse = BrandApi.ResponseTypes["ListBrands"];
type GetBrandByIdResponse = BrandApi.ResponseTypes["GetBrandById"];
type GetBrandBySlugResponse = BrandApi.ResponseTypes["GetBrandBySlug"];

/**
 * Brand Service
 * Handles brand catalog and brand-specific operations
 */

/**
 * Get all brands
 * @param activeOnly - If true, returns only active brands (default: false)
 * @returns Array of all brands
 */
export async function getBrands(activeOnly: boolean = false) {
    const response = await apiRequest<ListBrandsResponse>(
        "get",
        `/brands?activeOnly=${activeOnly}`
    );
    return response;
}

/**
 * Get specific brand by ID
 * @param brandId - ID of the brand
 * @returns Brand details including logo and metadata
 */
export async function getBrandById(brandId: string) {
    const response = await apiRequest<GetBrandByIdResponse>(
        "get",
        `/brands/${brandId}`
    );
    return response;
}

/**
 * Get brand by slug
 * @param slug - URL slug of the brand
 * @returns Brand details
 */
export async function getBrandBySlug(slug: string) {
    const response = await apiRequest<GetBrandBySlugResponse>(
        "get",
        `/brands/slug/${slug}`
    );
    return response;
}
