import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

import { ProductCard } from "@/components/products/ProductCard";
import { getBestSellers } from "@/services/product.service";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { mapProductsToCardItems } from "@/utils/mappers/product.mapper";

const PAGE_SIZE = 8;

export function BestSellers() {
  const router = useRouter();
  const { addToCart } = useCart();
  const {
    itemIdsByVariantId,
    itemIdsByProductId,
    loadingVariantId,
    toggleWishlist,
  } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBestSellers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBestSellers(1, PAGE_SIZE, "all_time");
      const mappedProducts = mapProductsToCardItems(response.data.items as any);

      setProducts(mappedProducts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load best sellers",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBestSellers();
  }, []);

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/product/${productId}` as never);
  };

  const handleAddToCart = (product: {
    canAddToCart?: boolean;
    variantId?: string;
  }) => {
    if (product.canAddToCart && product.variantId) {
      void addToCart(product.variantId, undefined, 1);
    }
  };

  return (
    <View className="overflow-hidden rounded-t-[2.5rem] border-t border-surface-border bg-surface">
      <View className="items-center border-b border-surface-border px-4 py-3 pt-2">
        <Text className="pt-4 text-xs font-bold uppercase tracking-widest text-primary">
          Customer Favorites
        </Text>
        <Text className="mt-1 text-2xl font-bold font-display text-text-primary">
          Best Sellers
        </Text>
      </View>

      {loading ? (
        <View className="items-center justify-center px-4 py-10">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      ) : error ? (
        <View className="px-4 py-6">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : (
        <View className="px-4 py-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingRight: 8 }}
          >
            {products.map((product) => (
              <View key={product.id} className="w-[180px]">
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                  onWishlistToggle={() => {
                    if (product.variantId) {
                      void toggleWishlist(product.variantId, product.id);
                    }
                  }}
                  isFavorite={Boolean(
                    (product.variantId &&
                      itemIdsByVariantId[product.variantId]) ||
                    itemIdsByProductId[product.id],
                  )}
                  isWishlistLoading={loadingVariantId === product.variantId}
                />
              </View>
            ))}

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/bestsellers" as never)}
              className="ml-1 w-[160px] items-center justify-center rounded-3xl border border-dashed border-primary bg-primary/5 px-4 py-6"
            >
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={22}
                  color="#C9A962"
                />
              </View>
              <Text className="text-center text-sm font-bold uppercase tracking-[0.18em] text-primary">
                See more
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
