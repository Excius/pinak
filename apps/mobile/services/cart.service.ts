import { apiRequest } from "./api";
import type { CartApi } from '@repo/types';

// Type imports for cart service
type GetCartResponse = CartApi.ResponseTypes['GetCart'];
type AddToCartResponse = CartApi.ResponseTypes['AddToCart'];
type UpdateCartItemResponse = CartApi.ResponseTypes['UpdateCartItem'];
type RemoveCartItemResponse = CartApi.ResponseTypes['RemoveCartItem'];
type ClearCartResponse = CartApi.ResponseTypes['ClearCart'];

// Get cart for current user
export async function getCart() {
    const response = await apiRequest<GetCartResponse>('get', '/cart');
    return response;
}

// Add item to cart (product variant or combo kit)
export async function addToCart(payload: {
    productVariantId?: string;
    comboKitId?: string;
    quantity: number;
}) {
    try {
        const response = await apiRequest<AddToCartResponse>(
            'post',
            '/cart/items',
            payload
        );
        return response;
    } catch (error: any) {
        // Backward-compatible fallback for older API deployments
        // that expose POST /cart instead of POST /cart/items.
        const status = error?.status || error?.response?.status;
        if (status !== 404) {
            throw error;
        }

        try {
            const response = await apiRequest<AddToCartResponse>(
                'post',
                '/cart',
                payload
            );
            return response;
        } catch (legacyError: any) {
            const legacyStatus = legacyError?.status || legacyError?.response?.status;
            if (legacyStatus === 404) {
                const detailedError = new Error(
                    'Add to cart endpoint not found on server. Tried POST /cart/items and POST /cart.'
                );
                (detailedError as any).status = 404;
                (detailedError as any).response = legacyError?.response;
                throw detailedError;
            }

            throw legacyError;
        }
    }
}

// Update cart item quantity
export async function updateCartItem(itemId: string, quantity: number) {
    const response = await apiRequest<UpdateCartItemResponse>(
        'put',
        `/cart/items/${itemId}`,
        { quantity }
    );
    return response;
}

// Remove item from cart
export async function removeCartItem(itemId: string) {
    const response = await apiRequest<RemoveCartItemResponse>(
        'delete',
        `/cart/items/${itemId}`,
        {}
    );
    return response;
}

// Clear entire cart
export async function clearCart() {
    const response = await apiRequest<ClearCartResponse>(
        'delete',
        '/cart',
        {}
    );
    return response;
}
