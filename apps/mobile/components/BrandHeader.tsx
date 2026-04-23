import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CartIconButton } from "./CartIconButton";

export function BrandHeader() {
  return (
    <View className="sticky top-0 z-50 bg-background px-4 py-3 border-b border-surface-border">
      <View className="flex-row items-center justify-between">
        {/* Menu Button */}
        <TouchableOpacity className="p-1 w-10">
          <MaterialCommunityIcons name="menu" size={24} color="#C9A962" />
        </TouchableOpacity>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Logo - Centered */}
        <View className="flex-col items-center">
          <Text className="text-2xl font-bold tracking-wide text-primary font-display">
            PINAK
          </Text>
          <Text className="text-[0.55rem] uppercase tracking-widest text-text-secondary">
            The Cosmetic World
          </Text>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Search & Cart */}
        <View className="flex-row items-center space-x-3 w-10 justify-end">
          <TouchableOpacity className="p-1">
            <MaterialCommunityIcons name="magnify" size={24} color="#C9A962" />
          </TouchableOpacity>
          <CartIconButton size={24} iconColor="#C9A962" variant="icon-only" />
        </View>
      </View>
    </View>
  );
}
