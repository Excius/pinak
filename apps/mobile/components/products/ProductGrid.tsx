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
import { useWishlist } from "@/hooks/use-wishlist";

interface ProductGridProps {
  categoryId: string;
}

export function ProductGrid({ categoryId }: ProductGridProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const {
    itemIdsByVariantId,
    itemIdsByProductId,
    loadingVariantId,
    toggleWishlist,
  } = useWishlist();
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/product/${productId}`);
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
            onWishlistToggle={() => {
              if (item.variantId && isAuthenticated) {
                void toggleWishlist(item.variantId, item.id);
              }
            }}
            isFavorite={Boolean(
              (item.variantId && itemIdsByVariantId[item.variantId]) ||
              itemIdsByProductId[item.id],
            )}
            isWishlistLoading={loadingVariantId === item.variantId}
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
