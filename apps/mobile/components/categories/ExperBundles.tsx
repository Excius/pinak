import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ExpertBundlesProps {
  onPress?: () => void;
}

export function ExpertBundles({ onPress }: ExpertBundlesProps) {
  return (
    <View className="mt-10 mb-6 rounded-xl border border-primary/20 bg-primary/10 p-6">
      {/* Icon */}
      <View className="items-center">
        <MaterialCommunityIcons name="star-box" size={32} color="#b08d55" />
      </View>

      {/* Title */}
      <Text className="font-display mt-2 text-center text-lg font-bold">
        Expert Curated Bundles
      </Text>

      {/* Description */}
      <Text className="mt-1 text-center text-sm text-[#5e4b48] dark:text-grey-300">
        Discover collections hand-picked by our beauty artisans.
      </Text>

      {/* Button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="mt-4 items-center rounded-full bg-primary px-6 py-2 active:scale-95"
      >
        <Text className="text-sm font-medium text-white">
          Explore Collections
        </Text>
      </TouchableOpacity>
    </View>
  );
}
