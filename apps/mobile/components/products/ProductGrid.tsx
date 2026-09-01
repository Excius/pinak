import { useCallback, useEffect, useState } from "react";
import { View, FlatList, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ProductCard } from "./ProductCard";
import { getProductsByCategory } from "@/services/product.service";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/AuthContext";
import {
  mapProductsToCardItems,
  type ProductCardItem,
} from "@/utils/mappers/product.mapper";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";

interface ProductGridProps {
  categoryId: string;
}

export function ProductGrid({ categoryId }: ProductGridProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Record<string, string>>({});

  const loadProducts = useCallback(async () => {
    if (!categoryId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getProductsByCategory(categoryId, 1, 20, {
        inStock: true,
      });
      setProducts(mapProductsToCardItems(response.data.items));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistItems({});
      return;
    }

    const loadWishlist = async () => {
      try {
        const response = await getWishlist();
        const items = response.data.items.reduce<Record<string, string>>(
          (savedItems, item) => {
            savedItems[item.productVariant.id] = item.id;
            return savedItems;
          },
          {},
        );
        setWishlistItems(items);
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    };

    void loadWishlist();
  }, [isAuthenticated]);

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/product/${productId}`);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (
    productId: string,
    variantId: string | undefined,
    isFavorite: boolean,
  ) => {
    if (!variantId) {
      console.warn("No variant ID available for product:", productId);
      return;
    }

    try {
      setWishlistLoading(productId);

      if (isFavorite) {
        const response = await addToWishlist(variantId);
        setWishlistItems((previous) => ({
          ...previous,
          [variantId]: response.data.item.id,
        }));
      } else {
        const wishlistItemId = wishlistItems[variantId];
        if (!wishlistItemId) return;

        await removeFromWishlist(wishlistItemId);
        setWishlistItems((previous) => {
          const next = { ...previous };
          delete next[variantId];
          return next;
        });
      }
    } catch (err) {
      console.error("Wishlist action failed:", err);
      // Optionally show toast error here
    } finally {
      setWishlistLoading(null);
    }
  };

  if (isLoading) {
    return (
      <View className="py-10 items-center justify-center">
        <ActivityIndicator size="small" color="#C9A962" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-6 py-8">
        <Text className="text-sm text-text-secondary">{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View className="px-6 py-8">
        <Text className="text-sm text-text-secondary">
          No products available in this category yet.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View className="w-1/2 p-2">
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item.id)}
            onAddToCart={() => {
              if (item.canAddToCart && item.variantId) {
                void addToCart(item.variantId, undefined, 1);
              }
            }}
            onWishlistToggle={(isFavorite) =>
              handleWishlistToggle(item.id, item.variantId, isFavorite)
            }
            isFavorite={Boolean(item.variantId && wishlistItems[item.variantId])}
            isWishlistLoading={wishlistLoading === item.id}
          />
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 40 }}
    />
  );
}
