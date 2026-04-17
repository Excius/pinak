import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/services/wishlist.service";
import type { WishlistApi } from "@repo/types";

type WishlistItem = WishlistApi.ResponseTypes["GetWishlist"]["data"]["items"][number];

/**
 * Wishlist Item Card Component
 * Displays individual wishlist item with options to remove
 */
function WishlistItemCard({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: (itemId: string) => void;
}) {
  const product = item.productVariant?.product;
  const variant = item.productVariant;

  if (!product || !variant) return null;

  return (
    <View className="flex-row gap-4 bg-surface rounded-xl p-4 mb-3 border border-surface-border">
      {/* Product Image */}
      {variant.images && variant.images.length > 0 ? (
        <Image
          source={{ uri: variant.images[0].url }}
          className="w-24 h-24 rounded-lg"
          resizeMode="cover"
        />
      ) : (
        <View className="w-24 h-24 rounded-lg bg-surface-light items-center justify-center">
          <MaterialCommunityIcons name="image-off" size={32} color="#C9A962" />
        </View>
      )}

      {/* Product Info */}
      <View className="flex-1">
        <Text
          className="text-sm font-bold text-text-primary mb-1 font-display"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Variant Details */}
        {variant.optionValues && variant.optionValues.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mb-2">
            {variant.optionValues.slice(0, 2).map((opt, idx) => (
              <View
                key={idx}
                className="bg-primary/10 px-2 py-1 rounded-full"
              >
                <Text className="text-[0.6rem] text-primary font-semibold">
                  {opt.optionValue?.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Price and Stock */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-bold text-primary">
              ₹{variant.price.toLocaleString()}
            </Text>
            <Text
              className={`text-xs font-semibold ${
                item.inStock ? "text-success" : "text-error"
              }`}
            >
              {item.inStock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            className="w-8 h-8 rounded-full bg-error/10 items-center justify-center"
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/**
 * Wishlist Screen
 * View and manage user's wishlist
 */
export default function WishlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Load wishlist
  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getWishlist();
      setItems(response.data.items || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wishlist"
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Focus effect - reload wishlist when screen is focused
  useFocusEffect(
    useCallback(() => {
      void loadWishlist();
    }, [loadWishlist])
  );

  // Remove item from wishlist
  const handleRemoveItem = async (itemId: string) => {
    try {
      setIsRemoving(itemId);
      await removeFromWishlist(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
      // Optionally show an error toast here
    } finally {
      setIsRemoving(null);
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      setItems([]);
    } catch (err) {
      console.error("Failed to clear wishlist:", err);
    }
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

  // Empty state
  if (items.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="px-6 py-6 border-b border-surface-border">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            Your Favorites
          </Text>
          <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
            Wishlist
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="heart-outline"
            size={64}
            color="#C9A962"
          />
          <Text className="text-xl font-bold text-text-primary mt-4 font-display">
            Your Wishlist is Empty
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            Save your favorite products to view them later
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/categories")}
            className="mt-6 bg-primary rounded-full px-6 py-3"
          >
            <Text className="text-sm font-bold text-background">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-6 border-b border-surface-border flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            Your Favorites
          </Text>
          <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
            Wishlist
          </Text>
          <Text className="mt-1 text-sm text-text-secondary">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </Text>
        </View>

        {/* Clear Button */}
        <TouchableOpacity
          onPress={handleClearWishlist}
          className="p-2 rounded-full bg-surface"
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color="#C9A962"
          />
        </TouchableOpacity>
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <WishlistItemCard
            item={item}
            onRemove={handleRemoveItem}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          <View className="py-10 items-center">
            <Text className="text-sm text-text-secondary">
              {error || "No items in wishlist"}
            </Text>
          </View>
        }
      />

      {/* Add All to Cart Button */}
      {items.length > 0 && (
        <View className="px-6 pb-6 border-t border-surface-border bg-background">
          <TouchableOpacity className="bg-primary rounded-full py-4 items-center justify-center">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="shopping-outline"
                size={20}
                color="#0A0A0A"
              />
              <Text className="text-base font-bold text-background">
                Add All to Cart
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
