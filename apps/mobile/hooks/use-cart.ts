import { useState, useCallback } from 'react';
import * as cartService from '@/services/cart.service';
import Toast from 'react-native-toast-message';
import { getAccessToken } from '@/utils/token';

export interface CartItem {
    id: string;
    itemType: 'PRODUCT_VARIANT' | 'COMBO_KIT';
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    availableStock: number;
    productVariantId: string | null;
    comboKitId: string | null;
    productVariant?: {
        id: string;
        sku: string;
        price: number;
        isActive: boolean;
        image?: {
            id: string;
            url: string;
            altText: string | null;
            isPrimary: boolean;
            sortOrder: number;
        } | null;
        optionValues?: Array<{
            optionName: string;
            valueName: string;
        }>;
        product?: {
            id: string;
            name: string;
            slug: string;
            frontImageUrl: string | null;
            brand?: {
                id: string;
                name: string;
                slug: string;
                logoUrl: string | null;
            } | null;
        };
    } | null;
    comboKit?: {
        id: string;
        name: string;
        slug: string;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
    } | null;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    total: number;
    createdAt: Date;
    updatedAt: Date;
}

interface UseCartReturn {
    cart: Cart | null;
    loading: boolean;
    error: string | null;
    itemCount: number;
    fetchCart: () => Promise<void>;
    addToCart: (productVariantId?: string, comboKitId?: string, quantity?: number) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

export function useCart(): UseCartReturn {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getErrorMessage = (err: any, fallback: string) => {
        return err?.response?.data?.message || err?.message || fallback;
    };

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            if (!token) {
                setCart(null);
                return;
            }

            const response = await cartService.getCart();
            setCart(response.data);
        } catch (err: any) {
            const status = err?.status || err?.response?.status;
            if (status === 404) {
                setCart(null);
                setError(null);
                return;
            }

            const errorMessage = getErrorMessage(err, 'Failed to fetch cart');
            setError(errorMessage);
            console.error('Fetch cart error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (
        productVariantId?: string,
        comboKitId?: string,
        quantity: number = 1
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cartService.addToCart({
                productVariantId,
                comboKitId,
                quantity,
            });
            setCart(response.data);
            Toast.show({
                type: 'success',
                text1: 'Added to Cart',
                text2: 'Item added successfully',
                position: 'bottom',
            });
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to add to cart');
            setError(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
                position: 'bottom',
            });
            console.error('Add to cart error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateItem = useCallback(async (itemId: string, quantity: number) => {
        setLoading(true);
        setError(null);
        try {
            if (quantity <= 0) {
                await removeItem(itemId);
                return;
            }
            const response = await cartService.updateCartItem(itemId, quantity);
            setCart(response.data);
            Toast.show({
                type: 'success',
                text1: 'Updated',
                text2: 'Cart item updated',
                position: 'bottom',
            });
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to update cart');
            setError(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
                position: 'bottom',
            });
            console.error('Update cart error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const removeItem = useCallback(async (itemId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cartService.removeCartItem(itemId);
            setCart(response.data);
            Toast.show({
                type: 'success',
                text1: 'Removed',
                text2: 'Item removed from cart',
                position: 'bottom',
            });
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to remove item');
            setError(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
                position: 'bottom',
            });
            console.error('Remove item error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await cartService.clearCart();
            setCart(response.data);
            Toast.show({
                type: 'success',
                text1: 'Cleared',
                text2: 'Cart cleared successfully',
                position: 'bottom',
            });
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to clear cart');
            setError(errorMessage);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
                position: 'bottom',
            });
            console.error('Clear cart error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Calculate item count
    const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

    return {
        cart,
        loading,
        error,
        itemCount,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
    };
}
