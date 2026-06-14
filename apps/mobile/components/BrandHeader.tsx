import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { CartIconButton } from "./CartIconButton";
import { HamburgerMenu } from "./options/HamburgerMenu";

export function BrandHeader() {
  const [menuVisible, setMenuVisible] = useState(false);

  const menuScale = useSharedValue(1);

  const menuButtonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: menuScale.value,
      },
    ],
  }));

  return (
    <View className="relative z-50 overflow-visible border-b border-surface-border bg-background px-4 pb-3 pt-2">
      <View className="flex-row items-center justify-between">
        {/* Left Section */}
        <View className="w-10 items-start">
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => {
              menuScale.value = withTiming(0.90, {
                duration: 100,
              });
            }}
            onPressOut={() => {
              menuScale.value = withTiming(1, {
                duration: 100,
              });
            }}
            onPress={() => setMenuVisible((v) => !v)}
          >
            <Animated.View
              style={menuButtonStyle}
              className="rounded-full bg-surface-light/80 p-2"
            >
              <MaterialCommunityIcons
                name="menu"
                size={24}
                color="#C9A962"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Center Section */}
        <View className="flex-1 items-center">
          <Text className="font-display text-2xl font-bold tracking-wide text-primary">
            PINAK
          </Text>

          <Text className="text-[10px] uppercase tracking-widest text-text-secondary">
            The Cosmetic World
          </Text>
        </View>

        {/* Right Section */}
        <View className="w-20 flex-row items-center justify-end">
          <TouchableOpacity
            className="mr-2 rounded-full bg-surface-light/80 p-2"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color="#C9A962"
            />
          </TouchableOpacity>

          <CartIconButton
            size={24}
            iconColor="#C9A962"
            variant="icon-only"
          />
        </View>
      </View>

      {menuVisible && (
        <HamburgerMenu
          onClose={() => setMenuVisible(false)}
        />
      )}
    </View>
  );
}