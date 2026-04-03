import { View, TouchableOpacity, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, usePathname } from "expo-router";
interface NavItem {
  id: string;
  label: string;
  icon: "home" | "grid" | "camera" | "heart-outline" | "account-outline";
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "categories", label: "Categories", icon: "grid" },
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "wishlist", label: "Wishlist", icon: "heart-outline" },
  { id: "profile", label: "Profile", icon: "account-outline" },
];

export function BottomNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isActive = (itemId: string): boolean => {
    if (itemId === "home" && pathname === "/") return true;
    if (itemId === "categories" && pathname.includes("categories")) return true;
    if (itemId === "camera" && pathname.includes("camera")) return true;
    if (itemId === "wishlist" && pathname.includes("wishlist")) return true;
    if (itemId === "profile" && pathname.includes("profile")) return true;
    return false;
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="absolute bottom-0 left-0 right-0 flex-row items-center border-t border-surface-border bg-background"
    >
      {NAV_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          className={`flex-1 items-center justify-center py-2 ${
            item.id === "camera" ? "mb-4" : ""
          }`}
          onPress={() => {
            if (item.id === "home") router.push("/");
            if (item.id === "categories") router.push("/(tabs)/categories");
            if (item.id === "camera") router.push("/(tabs)/camera");
            // if (item.id === "wishlist") router.push("/wishlist");
            if (item.id === "profile") router.push("/(tabs)/profile");
          }}
        >
          {item.id === "camera" ? (
            <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-primary shadow-gold">
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color="#0A0A0A"
              />
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={isActive(item.id) ? "#C9A962" : "#6B6B6B"}
              />
              <Text
                className={`mt-1 text-[0.55rem] font-medium ${
                  isActive(item.id) ? "text-primary" : "text-text-muted"
                }`}
              >
                {item.label}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
