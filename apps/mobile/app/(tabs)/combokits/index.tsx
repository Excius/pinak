import { useEffect, useState, useCallback } from "react";
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
import { getComboKits } from "@/services/comboKit.service";
import type { ComboKitApi } from "@repo/types";

type ComboKit = ComboKitApi.ResponseTypes["GetComboKits"]["data"]["items"][number];

interface ComboKitCardProps {
  kit: ComboKit;
  onPress: (kitId: string) => void;
}

/**
 * ComboKit Card Component
 * Displays individual combo kit with image, info, and details
 */
function ComboKitCard({ kit, onPress }: ComboKitCardProps) {
  const discountPercent = kit.discountValue
    ? Math.round(
        ((kit.discountValue) /
          (kit.price + (kit.discountValue || 0))) *
          100
      )
    : 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(kit.id)}
      className="flex-1 rounded-2xl border border-surface-border bg-surface overflow-hidden active:opacity-75 m-2"
    >
      {/* Image Section */}
      <View className="relative aspect-square bg-surface-light">
        {kit.imageUrl ? (
          <Image
            source={{ uri: kit.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-surface-light">
            <MaterialCommunityIcons
              name="package-variant"
              size={48}
              color="#C9A962"
            />
          </View>
        )}

        {/* Badge */}
        <View className="absolute right-2 top-2 bg-primary rounded-lg px-2 py-1 z-10">
          <Text className="text-[0.6rem] font-bold uppercase text-background">
            {kit.purchasedCount > 20 ? "Popular" : "New"}
          </Text>
        </View>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View className="absolute left-2 top-2 bg-error rounded-lg px-2 py-1 z-10">
            <Text className="text-[0.6rem] font-bold uppercase text-background">
              -{discountPercent}%
            </Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View className="p-3">
        <Text
          className="text-sm font-bold text-text-primary font-display mb-1"
          numberOfLines={2}
        >
          {kit.name}
        </Text>
        <Text
          className="text-xs text-text-secondary mb-2"
          numberOfLines={1}
        >
          {kit.items?.length || 0} items included
        </Text>

        {/* Pricing */}
        <View className="flex-row items-center gap-1 mb-3">
          <Text className="text-base font-bold text-primary">
            ₹{kit.price.toLocaleString()}
          </Text>
          {discountPercent > 0 && (
            <Text className="text-xs text-text-muted line-through">
              ₹{Math.round(kit.price / (1 - (kit.discountValue || 0) / 100)).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Tags */}
        {kit.tags && kit.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mb-3">
            {kit.tags.slice(0, 2).map((tag, idx) => (
              <View
                key={idx}
                className="bg-primary/10 px-2 py-1 rounded-full"
              >
                <Text className="text-[0.65rem] text-primary font-semibold">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Button */}
        <View className="border border-primary rounded-full py-2 items-center justify-center">
          <Text className="text-sm font-bold text-primary">View Details</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * ComboKits Screen
 * Browse and view all available combo kits/bundles
 */
export default function ComboKitsScreen() {
  const router = useRouter();
  const [kits, setKits] = useState<ComboKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load combo kits
  const loadComboKits = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);
        setError(null);

        const response = await getComboKits(pageNum, 12, {
          isActive: true,
        });

        const newKits = response.data.items || [];
        setKits((prev) => (append ? [...prev, ...newKits] : newKits));
        setHasMore(response.data.pagination.hasNext);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load combo kits"
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadComboKits(1);
  }, [loadComboKits]);

  // Handle kit press
  const handleKitPress = (kitId: string) => {
    router.push(`/combokits/${kitId}`);
  };

  // Load more on scroll
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void loadComboKits(nextPage, true);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || kits.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 px-6 py-10 items-center justify-center">
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={64}
            color="#C9A962"
          />
          <Text className="text-xl font-bold text-text-primary mt-4 font-display">
            No Combo Kits Found
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            {error || "No combo kits available at the moment"}
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
          Better Together
        </Text>
        <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
          Combo Kits
        </Text>
        <Text className="mt-1 text-sm text-text-secondary italic">
          Curated bundles with exclusive savings
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={kits}
        renderItem={({ item }) => (
          <ComboKitCard kit={item} onPress={handleKitPress} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 40 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#C9A962" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
