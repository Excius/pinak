import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export function BrandHeader() {
  return (
    <View className="sticky top-0 z-50 bg-background-light px-4 py-3">
      <View className="flex-row items-center justify-between">
        {/* Menu Button */}
        <TouchableOpacity className="p-1 w-10">
          <MaterialCommunityIcons name="menu" size={24} color="#b08d55" />
        </TouchableOpacity>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Logo - Centered */}
        <View className="flex-col items-center">
          <Text className="text-2xl font-bold tracking-wide text-primary font-display">
            PINAK
          </Text>
          <Text className="text-[0.5rem] uppercase tracking-widest text-gray-500">
            The Cosmetic World
          </Text>
        </View>

        {/* Spacer */}
        <View className="flex-1" />

        {/* Search & Cart */}
        <View className="flex-row items-center space-x-3 w-10 justify-end">
          <TouchableOpacity className="p-1">
            <MaterialCommunityIcons name="magnify" size={24} color="#b08d55" />
          </TouchableOpacity>
          <TouchableOpacity className="relative p-1">
            <MaterialCommunityIcons name="shopping" size={24} color="#b08d55" />
            <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
