import { apiRequest } from "./api";
import type { WishlistApi } from "@repo/types";

// Type imports for wishlist service
type GetWishlistResponse = WishlistApi.ResponseTypes["GetWishlist"];
type AddToWishlistResponse = WishlistApi.ResponseTypes["AddToWishlist"];
type RemoveFromWishlistResponse = WishlistApi.ResponseTypes["RemoveFromWishlist"];
type ClearWishlistResponse = WishlistApi.ResponseTypes["ClearWishlist"];

/**
 * Wishlist Service
 * Handles user's wishlist operations (save/unsave products)
 */

/**
 * Get user's complete wishlist
 * @returns User's wishlist with all saved product variants
 */
export async function getWishlist() {
    const response = await apiRequest<GetWishlistResponse>("get", "/wishlist");
    return response;
}

/**
 * Add product variant to wishlist
 * @param productVariantId - ID of the product variant to add
 * @returns Updated wishlist item
 */
export async function addToWishlist(productVariantId: string) {
    const response = await apiRequest<AddToWishlistResponse>(
        "post",
        "/wishlist/items",
        {
            productVariantId,
        }
    );
    return response;
}

/**
 * Remove product variant from wishlist
 * @param itemId - ID of the wishlist item to remove
 * @returns Confirmation of removal
 */
export async function removeFromWishlist(itemId: string) {
    const response = await apiRequest<RemoveFromWishlistResponse>(
        "delete",
        `/wishlist/items/${itemId}`
    );
    return response;
}

/**
 * Clear entire user's wishlist
 * @returns Confirmation with count of deleted items
 */
export async function clearWishlist() {
    const response = await apiRequest<ClearWishlistResponse>(
        "delete",
        "/wishlist"
    );
    return response;
}
