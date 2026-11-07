import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getFeaturedSectionById } from "@/services/featuredSection.service";
import { getFeaturedProductsBySection } from "@/services/product.service";
import { ProductCard } from "@/components/products/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { mapProductsToCardItems } from "@/utils/mappers/product.mapper";

export default function FeaturedSectionDetailScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId?: string }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const {
    itemIdsByVariantId,
    itemIdsByProductId,
    loadingVariantId,
    toggleWishlist,
  } = useWishlist();
  const [sectionTitle, setSectionTitle] = useState("Collection");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionId) {
      setError("Collection not found.");
      setIsLoading(false);
      return;
    }

    const loadCollection = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [sectionResponse, productsResponse] = await Promise.all([
          getFeaturedSectionById(sectionId),
          getFeaturedProductsBySection(sectionId, 1, 50),
        ]);

        setSectionTitle(sectionResponse.data.title);
        setProducts(mapProductsToCardItems(productsResponse.data.items as any));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this collection.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadCollection();
  }, [sectionId]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-light">
      <View className="flex-row items-center border-b border-surface-border px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#C9A962" />
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-bold font-display text-text-primary">
          {sectionTitle}
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-text-secondary">
            {error}
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-text-secondary">
            No products are available in this collection yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View className="w-1/2 p-2">
              <ProductCard
                product={item}
                onPress={() =>
                  router.push(`/(tabs)/product/${item.id}` as never)
                }
                onAddToCart={() => {
                  if (item.canAddToCart && item.variantId) {
                    void addToCart(item.variantId, undefined, 1);
                  }
                }}
                onWishlistToggle={() => {
                  if (item.variantId) {
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
        />
      )}
    </SafeAreaView>
  );
}
