import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ExpertBundlesProps {
  onPress?: () => void;
}

export function ExpertBundles({ onPress }: ExpertBundlesProps) {
  return (
    <View className="mt-10 mb-6 rounded-xl border border-primary/30 bg-surface p-6">
      {/* Icon */}
      <View className="items-center">
        <View className="rounded-full bg-primary/20 p-3">
          <MaterialCommunityIcons name="star-box" size={32} color="#C9A962" />
        </View>
      </View>

      {/* Title */}
      <Text className="font-display mt-4 text-center text-xl font-bold text-text-primary">
        Expert Curated Bundles
      </Text>

      {/* Description */}
      <Text className="mt-2 text-center text-sm text-text-secondary">
        Discover collections hand-picked by our beauty artisans.
      </Text>

      {/* Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="mt-5 items-center rounded-full bg-primary px-6 py-3 active:scale-95"
      >
        <Text className="text-sm font-bold text-background">
          Explore Collections
        </Text>
      </TouchableOpacity>
    </View>
  );
}
