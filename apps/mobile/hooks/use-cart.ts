import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

function useCartState(): UseCartReturn {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cartRef = useRef<Cart | null>(null);
    const updateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const pendingQuantities = useRef<Record<string, number>>({});
    const updateRequests = useRef<Record<string, number>>({});

    const setCartState = useCallback((nextCart: Cart | null) => {
        cartRef.current = nextCart;
        setCart(nextCart);
    }, []);

    const getErrorMessage = (err: any, fallback: string) => {
        return err?.response?.data?.message || err?.message || fallback;
    };

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            if (!token) {
                setCartState(null);
                return;
            }

            const response = await cartService.getCart();
            setCartState(response.data);
        } catch (err: any) {
            const status = err?.status || err?.response?.status;
            if (status === 404) {
                setCartState(null);
                setError(null);
                return;
            }

            const errorMessage = getErrorMessage(err, 'Failed to fetch cart');
            setError(errorMessage);
            console.error('Fetch cart error:', err);
        } finally {
            setLoading(false);
        }
    }, [setCartState]);

    const addToCart = useCallback(async (
        productVariantId?: string,
        comboKitId?: string,
        quantity: number = 1
    ) => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            if (!token) {
                setCartState(null);
                Toast.show({
                    type: 'info',
                    text1: 'Login Required',
                    text2: 'Please login to add items to cart',
                    position: 'bottom',
                });
                return;
            }

            const response = await cartService.addToCart({
                productVariantId,
                comboKitId,
                quantity,
            });
            setCartState(response.data);
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
    }, [setCartState]);

    const updateItem = useCallback(async (itemId: string, quantity: number) => {
        setError(null);
        if (quantity <= 0) return;

        const currentCart = cartRef.current;
        const currentItem = currentCart?.items.find((item) => item.id === itemId);
        if (!currentCart || !currentItem) return;

        pendingQuantities.current[itemId] = quantity;
        const optimisticCart = {
            ...currentCart,
            items: currentCart.items.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        quantity,
                        lineTotal: item.unitPrice * quantity,
                    }
                    : item,
            ),
            totalQuantity: currentCart.totalQuantity + quantity - currentItem.quantity,
            subtotal: currentCart.subtotal + (quantity - currentItem.quantity) * currentItem.unitPrice,
            total: currentCart.total + (quantity - currentItem.quantity) * currentItem.unitPrice,
        };
        setCartState(optimisticCart);

        if (updateTimers.current[itemId]) clearTimeout(updateTimers.current[itemId]);
        updateTimers.current[itemId] = setTimeout(async () => {
            const requestedQuantity = pendingQuantities.current[itemId];
            const requestVersion = (updateRequests.current[itemId] ?? 0) + 1;
            updateRequests.current[itemId] = requestVersion;

            try {
                const token = await getAccessToken();
                if (!token) return;
                const response = await cartService.updateCartItem(itemId, requestedQuantity);
                if (updateRequests.current[itemId] === requestVersion) {
                    setCartState(response.data);
                }
            } catch (err: any) {
                const errorMessage = getErrorMessage(err, 'Failed to update cart');
                setError(errorMessage);
                console.error('Update cart error:', err);
                void fetchCart();
            }
        }, 300);
    }, [fetchCart, setCartState]);

    const removeItem = useCallback(async (itemId: string) => {
        if (updateTimers.current[itemId]) {
            clearTimeout(updateTimers.current[itemId]);
            delete updateTimers.current[itemId];
        }
        delete pendingQuantities.current[itemId];
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            if (!token) {
                setCartState(null);
                return;
            }

            const response = await cartService.removeCartItem(itemId);
            setCartState(response.data);
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
    }, [setCartState]);

    const clearCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getAccessToken();
            if (!token) {
                setCartState(null);
                return;
            }

            const response = await cartService.clearCart();
            setCartState(response.data);
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
    }, [setCartState]);

    useEffect(() => () => {
        Object.values(updateTimers.current).forEach(clearTimeout);
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

const CartContext = createContext<UseCartReturn | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const cart = useCartState();
    return createElement(CartContext.Provider, { value: cart }, children);
}

export function useCart(): UseCartReturn {
    const cart = useContext(CartContext);
    if (!cart) throw new Error('useCart must be used within CartProvider');
    return cart;
}
