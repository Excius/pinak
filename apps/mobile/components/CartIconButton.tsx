import React, { useEffect } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useCart } from "@/hooks/use-cart";

interface CartIconButtonProps {
  size?: number;
  showLabel?: boolean;
  iconColor?: string;
  variant?: "default" | "icon-only";
}

export function CartIconButton({
  size = 24,
  showLabel = false,
  iconColor = "#333",
  variant = "default",
}: CartIconButtonProps) {
  const { itemCount, fetchCart } = useCart();

  // Fetch cart when component mounts
  useEffect(() => {
    fetchCart();
    // Refresh cart every 5 seconds to keep count updated
    const interval = setInterval(() => {
      fetchCart();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchCart]);

  return (
    <TouchableOpacity
      onPress={() => router.push("/cart" as never)}
      className={
        variant === "icon-only"
          ? "relative p-1"
          : "flex-row items-center gap-2 rounded-lg px-3 py-2 active:bg-surface"
      }
    >
      <View className="relative">
        <MaterialCommunityIcons
          name="shopping-outline"
          size={size}
          color={iconColor}
        />
        {itemCount > 0 && (
          <View className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-red-500">
            <Text className="text-xs font-bold text-white">
              {itemCount > 9 ? "9+" : itemCount}
            </Text>
          </View>
        )}
      </View>
      {variant !== "icon-only" && showLabel && itemCount > 0 && (
        <Text className="text-xs font-semibold text-foreground">
          {itemCount}
        </Text>
      )}
    </TouchableOpacity>
  );
}
