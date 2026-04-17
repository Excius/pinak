import { useCallback, useEffect, useState } from "react";
import { View, FlatList, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ProductCard } from "./ProductCard";
import { getProductsByCategory } from "@/services/product.service";
import {
  mapProductsToCardItems,
  type ProductCardItem,
} from "@/utils/mappers/product.mapper";
import { addToWishlist, removeFromWishlist } from "@/services/wishlist.service";

interface ProductGridProps {
  categoryId: string;
}

export function ProductGrid({ categoryId }: ProductGridProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

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

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId: string, variantId: string | undefined, isFavorite: boolean) => {
    if (!variantId) {
      console.warn("No variant ID available for product:", productId);
      return;
    }

    try {
      setWishlistLoading(productId);
      
      if (isFavorite) {
        // Add to wishlist
        await addToWishlist(variantId);
      } else {
        // For remove, we would need the wishlist item ID
        // This requires fetching the wishlist first or tracking it separately
        console.log("Remove from wishlist:", variantId);
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
            onWishlistToggle={(isFavorite) =>
              handleWishlistToggle(item.id, item.variantId, isFavorite)
            }
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
