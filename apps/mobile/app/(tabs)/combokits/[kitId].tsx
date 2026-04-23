import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  getComboKitById,
  incrementComboKitView,
} from "@/services/comboKit.service";
import { useCart } from "@/hooks/use-cart";
import type { ComboKitApi } from "@repo/types";

type ComboKit = ComboKitApi.ResponseTypes["GetComboKitById"]["data"];
type ComboKitItem = ComboKit["items"][number];

/**
 * ComboKit Item Component
 * Displays individual item within the combo kit
 */
function ComboKitItemCard({ item }: { item: ComboKitItem }) {
  return (
    <View className="mb-4 p-4 rounded-xl border border-surface-border bg-surface">
      {/* Item Header */}
      <View className="flex-row items-start gap-3">
        {/* Item Image */}
        {item.productVariant?.imageUrl ? (
          <Image
            source={{ uri: item.productVariant.imageUrl }}
            className="w-16 h-16 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg bg-surface-light items-center justify-center">
            <MaterialCommunityIcons
              name="image-off"
              size={24}
              color="#C9A962"
            />
          </View>
        )}

        {/* Item Info */}
        <View className="flex-1">
          <Text
            className="text-sm font-bold text-text-primary"
            numberOfLines={2}
          >
            {item.productVariant?.sku || "Product"}
          </Text>

          {/* Variant Options */}
          {item.productVariant?.optionValues &&
            item.productVariant.optionValues.length > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-1">
                {item.productVariant.optionValues.map((opt, idx) => (
                  <View key={idx} className="bg-primary/10 px-2 py-1 rounded">
                    <Text className="text-[0.65rem] text-primary font-semibold">
                      {opt.optionName}: {opt.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

          {/* Pricing */}
          <View className="mt-2 flex-row items-center gap-2">
            <Text className="text-xs font-bold text-text-secondary">
              Qty: {item.quantity}x
            </Text>
            {item.discountedPrice && (
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-bold text-primary">
                  ₹{item.discountedPrice.toLocaleString()}
                </Text>
                {item.originalPrice && (
                  <Text className="text-[0.65rem] text-text-muted line-through">
                    ₹{item.originalPrice.toLocaleString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Required Badge */}
        {item.isRequired && (
          <View className="bg-error px-2 py-1 rounded-full">
            <Text className="text-[0.6rem] font-bold text-background">
              REQUIRED
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/**
 * ComboKit Detail Screen
 * View full details of a specific combo kit including all items
 */
export default function ComboKitDetailScreen() {
  const { kitId } = useLocalSearchParams<{ kitId?: string }>();
  const router = useRouter();
  const { addToCart } = useCart();

  const [kit, setKit] = useState<ComboKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load combo kit details
  useEffect(() => {
    const loadKit = async () => {
      if (!kitId) {
        setError("Invalid kit");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getComboKitById(kitId);
        setKit(response.data);

        // Track view asynchronously
        incrementComboKitView(kitId).catch((err) => {
          console.error("Failed to track view:", err);
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load combo kit",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadKit();
  }, [kitId]);

  // Calculate pricing metrics
  const pricingMetrics = useMemo(() => {
    if (!kit) return { discountPercent: 0, savingsAmount: 0 };

    if (kit.discountType === "PERCENTAGE" && kit.discountValue) {
      const discountPercent = kit.discountValue;
      const fullPrice = kit.price / (1 - discountPercent / 100);
      const savingsAmount = fullPrice - kit.price;
      return {
        discountPercent: Math.round(discountPercent),
        savingsAmount: Math.round(savingsAmount),
      };
    }

    if (kit.discountType === "FIXED_AMOUNT" && kit.discountValue) {
      const savingsAmount = kit.discountValue;
      return { discountPercent: 0, savingsAmount };
    }

    return { discountPercent: 0, savingsAmount: 0 };
  }, [kit]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !kit) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 px-6 py-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center mb-4"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#C9A962"
            />
          </TouchableOpacity>
          <Text className="text-sm text-text-secondary">
            {error || "Failed to load combo kit"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Back Button */}
        <View className="px-6 pt-4 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#C9A962"
            />
          </TouchableOpacity>
        </View>

        {/* Kit Image */}
        {kit.imageUrl ? (
          <Image
            source={{ uri: kit.imageUrl }}
            className="w-full aspect-square"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full aspect-square bg-surface-light items-center justify-center">
            <MaterialCommunityIcons
              name="package-variant"
              size={64}
              color="#C9A962"
            />
          </View>
        )}

        {/* Kit Info Section */}
        <View className="px-6 py-6">
          {/* Title and Description */}
          <Text className="text-3xl font-bold text-text-primary font-display mb-2">
            {kit.name}
          </Text>
          {kit.description && (
            <Text className="text-sm text-text-secondary italic mb-4 leading-relaxed">
              {kit.description}
            </Text>
          )}

          {/* Tags */}
          {kit.tags && kit.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {kit.tags.map((tag, idx) => (
                <View
                  key={idx}
                  className="bg-primary/10 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs font-semibold text-primary">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Pricing Card */}
          <View className="bg-surface border border-surface-border rounded-2xl p-4 mb-6">
            <View className="flex-row items-baseline justify-between">
              <View>
                <Text className="text-xs text-text-secondary font-semibold uppercase tracking-widest mb-1">
                  Bundle Price
                </Text>
                <Text className="text-3xl font-bold text-primary font-display">
                  ₹{kit.price.toLocaleString()}
                </Text>
              </View>
              {pricingMetrics.discountPercent > 0 && (
                <View className="bg-error px-3 py-2 rounded-lg">
                  <Text className="text-sm font-bold text-background">
                    Save {pricingMetrics.discountPercent}%
                  </Text>
                </View>
              )}
            </View>

            {pricingMetrics.savingsAmount > 0 && (
              <View className="mt-3 pt-3 border-t border-surface-border">
                <Text className="text-xs text-text-secondary">
                  You save ₹{pricingMetrics.savingsAmount.toLocaleString()} with
                  this bundle
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-surface-light rounded-xl p-3 items-center">
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#C9A962"
              />
              <Text className="text-xs text-text-secondary mt-1 font-semibold">
                {kit.items?.length || 0} Items
              </Text>
            </View>
            <View className="flex-1 bg-surface-light rounded-xl p-3 items-center">
              <MaterialCommunityIcons name="eye" size={24} color="#C9A962" />
              <Text className="text-xs text-text-secondary mt-1 font-semibold">
                {kit.viewCount.toLocaleString()} Views
              </Text>
            </View>
            <View className="flex-1 bg-surface-light rounded-xl p-3 items-center">
              <MaterialCommunityIcons
                name="shopping-outline"
                size={24}
                color="#C9A962"
              />
              <Text className="text-xs text-text-secondary mt-1 font-semibold">
                {kit.purchasedCount.toLocaleString()} Sold
              </Text>
            </View>
          </View>

          {/* Items Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary font-display mb-3">
              What's Included
            </Text>
            {kit.items && kit.items.length > 0 ? (
              kit.items.map((item) => (
                <ComboKitItemCard key={item.id} item={item} />
              ))
            ) : (
              <Text className="text-sm text-text-secondary">
                No items included in this bundle
              </Text>
            )}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            onPress={() => {
              if (kit?.id) {
                void addToCart(undefined, kit.id, 1);
              }
            }}
            className="bg-primary rounded-full py-4 items-center justify-center mb-4"
          >
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="shopping-outline"
                size={20}
                color="#0A0A0A"
              />
              <Text className="text-base font-bold text-background">
                Add to Cart - ₹{kit.price.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
