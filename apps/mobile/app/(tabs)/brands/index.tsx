import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getBrands } from "@/services/brand.service";
import type { BrandApi } from "@repo/types";

type Brand = BrandApi.ResponseTypes["ListBrands"]["data"][number];

/**
 * Brand Card Component
 * Displays individual brand with logo and name
 */
function BrandCard({ brand, onPress }: { brand: Brand; onPress: (slug: string) => void }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(brand.slug)}
      className="flex-1 m-2 rounded-2xl border border-surface-border bg-surface overflow-hidden active:opacity-75"
    >
      {/* Brand Logo/Image */}
      <View className="relative aspect-square bg-surface-light items-center justify-center">
        {brand.logoUrl ? (
          <Image
            source={{ uri: brand.logoUrl }}
            className="h-20 w-20"
            resizeMode="contain"
          />
        ) : (
          <View className="h-20 w-20 rounded-full bg-primary/10 items-center justify-center">
            <Text className="text-xs font-bold text-primary text-center px-2">
              {brand.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      {/* Brand Info */}
      <View className="p-4 items-center">
        <Text
          className="text-sm font-bold text-text-primary font-display text-center"
          numberOfLines={2}
        >
          {brand.name}
        </Text>
        <View className="mt-3 flex-row items-center gap-2">
          <Text className="text-xs text-primary font-semibold">Shop</Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color="#C9A962" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Brands Screen
 * Browse all available brands
 */
export default function BrandsScreen() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load brands
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getBrands(true); // Active only
        setBrands(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load brands");
        setBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBrands();
  }, []);

  // Handle brand press
  const handleBrandPress = (slug: string) => {
    // Navigate to products filtered by brand
    router.push({
      pathname: "/(tabs)/categories",
      params: { brand: slug },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  // Error/Empty state
  if (error || brands.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="px-6 py-6 border-b border-surface-border">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            Featured
          </Text>
          <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
            Brands
          </Text>
        </View>

        <View className="flex-1 px-6 items-center justify-center">
          <MaterialCommunityIcons
            name="store-outline"
            size={64}
            color="#C9A962"
          />
          <Text className="text-xl font-bold text-text-primary mt-4 font-display">
            No Brands Found
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            {error || "Check back later for featured brands"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-6 border-b border-surface-border">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">
          Featured
        </Text>
        <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
          Brands
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          Explore products from your favorite brands
        </Text>
      </View>

      {/* Brands Grid */}
      <FlatList
        data={brands}
        renderItem={({ item }) => (
          <BrandCard brand={item} onPress={handleBrandPress} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}
