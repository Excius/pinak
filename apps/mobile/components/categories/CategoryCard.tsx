import React from "react";
import { ImageBackground, View, Text, TouchableOpacity } from "react-native";

interface CategoryCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  onPress: () => void;
}

export function CategoryCard({
  title,
  subtitle,
  imageUrl,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      className="relative overflow-hidden rounded-lg shadow-md active:scale-[0.97]"
      style={{ height: 180 }}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        className="absolute inset-0"
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-black/30" />
        <View className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

        {/* Arrow Icon
        <View className="absolute top-3 right-3">
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="rgba(255, 255, 255, 0.4)"
          />
        </View> */}

        {/* Content */}
        <View className="absolute inset-0 flex justify-end p-4">
          <Text className="font-display text-xl text-white mb-0.5">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-white/80 text-xs font-medium tracking-wider uppercase">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
