import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getComboKits } from "@/services/comboKit.service";
import type { ComboKitApi } from "@repo/types";

type ComboKit =
  ComboKitApi.ResponseTypes["GetComboKits"]["data"]["items"][number];

/**
 * ComboKits Homepage Component
 * Displays a carousel of featured combo kits/bundles
 * Fetches from API with fallback to empty state
 */
export function ComboKits() {
  const router = useRouter();
  const [kits, setKits] = useState<ComboKit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load combo kits from API
  const loadComboKits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getComboKits(1, 8, { isActive: true });
      setKits(response.data.items || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load combo kits",
      );
      setKits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComboKits();
  }, [loadComboKits]);

  // Handle kit card tap
  const handleKitPress = (kitId: string) => {
    router.push(`/combokits/${kitId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="border-t border-surface-border bg-surface-dark py-8 items-center justify-center h-96">
        <ActivityIndicator size="small" color="#C9A962" />
      </View>
    );
  }

  // Show error state
  if (error || kits.length === 0) {
    return null; // Hide section if no kits available
  }

  return (
    <View className="border-t border-surface-border bg-surface-dark py-8">
      {/* Header */}
      <View className="mb-6 items-center px-4">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">
          Better Together
        </Text>
        <Text className="mt-1 text-2xl font-bold font-display text-text-primary">
          Combos & Kits
        </Text>
        <Text className="mt-1 italic text-sm text-text-secondary">
          Save more with our curated sets
        </Text>
      </View>

      {/* Kits Carousel */}
      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {kits.map((kit) => (
          <TouchableOpacity
            key={kit.id}
            onPress={() => handleKitPress(kit.id)}
            className="mr-4 w-64 overflow-hidden rounded-2xl border border-surface-border bg-surface active:opacity-75"
          >
            {/* Kit Image */}
            <View className="relative aspect-square bg-surface-light">
              {kit.imageUrl ? (
                <Image
                  source={{ uri: kit.imageUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-surface-light">
                  <Text className="text-xs text-text-secondary">No Image</Text>
                </View>
              )}
              {/* Badge */}
              <View className="absolute right-3 top-3 rounded-lg bg-primary px-2 py-1">
                <Text className="text-[0.6rem] font-bold uppercase text-background">
                  {kit.purchasedCount > 20 ? "Bestseller" : "New"}
                </Text>
              </View>
            </View>

            {/* Kit Info */}
            <View className="items-center p-4 text-center">
              <Text
                className="mb-1 text-lg font-bold text-text-primary font-display"
                numberOfLines={2}
              >
                {kit.name}
              </Text>
              <Text
                className="mb-3 text-xs text-text-secondary"
                numberOfLines={1}
              >
                {kit.description || "Curated collection"}
              </Text>
              <Text className="mb-4 text-base font-bold text-primary">
                ₹ {kit.price.toLocaleString()}
              </Text>
              <View className="w-full rounded-full border border-primary py-2.5 px-4">
                <Text className="text-center text-sm font-bold text-primary">
                  View Kit
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
