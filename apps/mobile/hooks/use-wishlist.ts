import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} from "@/services/wishlist.service";

interface WishlistState {
    itemIdsByVariantId: Record<string, string>;
    itemIdsByProductId: Record<string, string>;
    loadingVariantId: string | null;
    toggleWishlist: (variantId: string, productId?: string) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [itemIdsByVariantId, setItemIdsByVariantId] = useState<
        Record<string, string>
    >({});
    const [itemIdsByProductId, setItemIdsByProductId] = useState<
        Record<string, string>
    >({});
    const [loadingVariantId, setLoadingVariantId] = useState<string | null>(null);

    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setItemIdsByVariantId({});
            setItemIdsByProductId({});
            return;
        }

        try {
            const response = await getWishlist();
            const nextItems = response.data.items.reduce<{
                byVariantId: Record<string, string>;
                byProductId: Record<string, string>;
            }>(
                (items, item) => {
                    const variant = item.productVariant;
                    if (variant?.id) {
                        items.byVariantId[variant.id] = item.id;
                    }
                    if (variant?.productId) {
                        items.byProductId[variant.productId] = item.id;
                    }
                    return items;
                },
                { byVariantId: {}, byProductId: {} },
            );
            setItemIdsByVariantId(nextItems.byVariantId);
            setItemIdsByProductId(nextItems.byProductId);
        } catch (error) {
            console.error("Failed to load wishlist:", error);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        void refreshWishlist();
    }, [refreshWishlist]);

    const toggleWishlist = useCallback(
        async (variantId: string, productId?: string) => {
            if (!isAuthenticated || loadingVariantId) return;

            setLoadingVariantId(variantId);
            try {
                const wishlistItemId =
                    itemIdsByVariantId[variantId] ||
                    (productId ? itemIdsByProductId[productId] : undefined);
                if (wishlistItemId) {
                    await removeFromWishlist(wishlistItemId);
                    setItemIdsByVariantId((items) => {
                        const nextItems = { ...items };
                        for (const [id, itemId] of Object.entries(nextItems)) {
                            if (itemId === wishlistItemId) delete nextItems[id];
                        }
                        return nextItems;
                    });
                    setItemIdsByProductId((items) => {
                        const nextItems = { ...items };
                        if (productId) delete nextItems[productId];
                        return nextItems;
                    });
                } else {
                    const response = await addToWishlist(variantId);
                    const addedVariant = response.data.item.productVariant;
                    setItemIdsByVariantId((items) => ({
                        ...items,
                        [addedVariant.id]: response.data.item.id,
                    }));
                    setItemIdsByProductId((items) => ({
                        ...items,
                        [addedVariant.productId]: response.data.item.id,
                    }));
                }
            } catch (error) {
                console.error("Wishlist action failed:", error);
            } finally {
                setLoadingVariantId(null);
            }
        },
        [
            isAuthenticated,
            itemIdsByVariantId,
            itemIdsByProductId,
            loadingVariantId,
        ],
    );

    return createElement(
        WishlistContext.Provider,
        {
            value: {
                itemIdsByVariantId,
                itemIdsByProductId,
                loadingVariantId,
                toggleWishlist,
                refreshWishlist,
            },
        },
        children,
    );
}

export function useWishlist(): WishlistState {
    const wishlist = useContext(WishlistContext);
    if (!wishlist) {
        throw new Error("useWishlist must be used within WishlistProvider");
    }
    return wishlist;
}
