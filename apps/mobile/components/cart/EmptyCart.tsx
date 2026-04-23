import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

export function EmptyCart() {
  return (
    <View className="flex-1 items-center justify-center px-4 py-8">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-surface">
        <MaterialCommunityIcons
          name="shopping-outline"
          size={40}
          color="#C9A962"
        />
      </View>

      <Text className="mb-2 text-center text-xl font-bold text-text-primary">
        Your Cart is Empty
      </Text>

      <Text className="mb-6 text-center text-sm text-text-secondary">
        Add some products to your cart and enjoy shopping!
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)")}
        className="rounded-lg bg-primary px-8 py-3"
      >
        <Text className="font-semibold text-primary-foreground">
          Continue Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );
}
