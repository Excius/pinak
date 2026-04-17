import { apiRequest } from "./api";
import type { ComboKitApi } from "@repo/types";
import { buildQueryParams } from "@/utils/query/buildQueryParams";

// Type imports for comboKit service
type GetComboKitsResponse = ComboKitApi.ResponseTypes["GetComboKits"];
type GetComboKitByIdResponse = ComboKitApi.ResponseTypes["GetComboKitById"];
type GetComboKitBySlugResponse = ComboKitApi.ResponseTypes["GetComboKitBySlug"];
type SearchComboKitsResponse = ComboKitApi.ResponseTypes["SearchComboKits"];
type GetComboKitItemsResponse = ComboKitApi.ResponseTypes["GetComboKitItems"];
type IncrementComboKitViewResponse =
    ComboKitApi.ResponseTypes["IncrementComboKitView"];
type IncrementComboKitPurchaseResponse =
    ComboKitApi.ResponseTypes["IncrementComboKitPurchase"];

// Type imports for query options
type GetComboKitsOptions = Omit<
    Partial<ComboKitApi.QueryTypes["GetComboKits"]>,
    "page" | "limit"
>;

/**
 * Combo Kit Service
 * Handles product bundle/combo kit operations
 * (curated product sets with special pricing)
 */

/**
 * Get all combo kits with pagination and filtering
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10, max: 100)
 * @param options - Additional filter options (search, tags, price range, etc.)
 * @returns Paginated list of combo kits
 */
export async function getComboKits(
    page: number = 1,
    limit: number = 10,
    options: GetComboKitsOptions = {}
) {
    const queryString = buildQueryParams({
        page,
        limit,
        ...options,
    });
    const url = queryString
        ? `/combo-kits?${queryString}`
        : "/combo-kits";

    const response = await apiRequest<GetComboKitsResponse>("get", url);
    return response;
}

/**
 * Get specific combo kit by ID with full details and items
 * @param comboKitId - ID of the combo kit
 * @returns Complete combo kit details including all items
 */
export async function getComboKitById(comboKitId: string) {
    const response = await apiRequest<GetComboKitByIdResponse>(
        "get",
        `/combo-kits/${comboKitId}`
    );
    return response;
}

/**
 * Get combo kit by slug
 * @param slug - URL slug of the combo kit
 * @returns Combo kit details
 */
export async function getComboKitBySlug(slug: string) {
    const response = await apiRequest<GetComboKitBySlugResponse>(
        "get",
        `/combo-kits/slug/${slug}`
    );
    return response;
}

/**
 * Search combo kits by query
 * @param query - Search query string
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated search results
 */
export async function searchComboKits(
    query: string,
    page: number = 1,
    limit: number = 10
) {
    const queryString = buildQueryParams({
        q: query,
        page,
        limit,
    });

    const url = queryString
        ? `/combo-kits/search?${queryString}`
        : "/combo-kits/search";

    const response = await apiRequest<SearchComboKitsResponse>("get", url);
    return response;
}

/**
 * Get items included in a combo kit
 * @param comboKitId - ID of the combo kit
 * @returns Array of items in the combo kit
 */
export async function getComboKitItems(comboKitId: string) {
    const response = await apiRequest<GetComboKitItemsResponse>(
        "get",
        `/combo-kits/${comboKitId}/items`
    );
    return response;
}

/**
 * Track a view on a combo kit (analytics)
 * @param comboKitId - ID of the combo kit
 * @returns Updated view count
 */
export async function incrementComboKitView(comboKitId: string) {
    const response = await apiRequest<IncrementComboKitViewResponse>(
        "patch",
        `/combo-kits/${comboKitId}/increment-view`
    );
    return response;
}

/**
 * Track a purchase on a combo kit (analytics)
 * @param comboKitId - ID of the combo kit
 * @returns Updated purchase count
 */
export async function incrementComboKitPurchase(comboKitId: string) {
    const response = await apiRequest<IncrementComboKitPurchaseResponse>(
        "patch",
        `/combo-kits/${comboKitId}/increment-purchase`
    );
    return response;
}
