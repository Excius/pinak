import { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface HamburgerMenuProps {
  onClose: () => void;
}

export function HamburgerMenu({
  onClose,
}: HamburgerMenuProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 180,
    });

    translateY.value = withTiming(0, {
      duration: 180,
    });

    scale.value = withTiming(1, {
      duration: 180,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: translateY.value,
      },
      {
        scale: scale.value,
      },
    ],
  }));

  const navigate = (href: string) => {
    onClose();
    router.push(href as any);
  };

  const MenuItem = ({
    icon,
    label,
    href,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    href: string;
  }) => (
    <Pressable onPress={() => navigate(href)}>
      {({ pressed }) => (
        <View
          className={`flex-row items-center rounded-xl px-4 py-3 ${
            pressed ? "bg-background/60" : ""
          }`}
        >
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color="#C9A962"
          />

          <Text className="ml-3 font-medium text-text-primary">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );

  return (
    <Animated.View
      style={animatedStyle}
      className="
        absolute
        left-4
        top-full
        mt-3
        z-50
        w-60
        rounded-2xl
        border
        border-primary/20
        bg-surface
        p-2
        shadow-gold-lg
      "
    >
      <MenuItem
        icon="tag-outline"
        label="Brands"
        href="/brands"
      />

      <MenuItem
        icon="shape-outline"
        label="Categories"
        href="/categories"
      />

      <MenuItem
        icon="heart-outline"
        label="Wishlist"
        href="/wishlist"
      />

      <MenuItem
        icon="clipboard-list-outline"
        label="Orders"
        href="/orders"
      />

      <MenuItem
        icon="account-outline"
        label="Profile"
        href="/profile"
      />
    </Animated.View>
  );
}