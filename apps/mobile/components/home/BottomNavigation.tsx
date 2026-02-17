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

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="absolute bottom-0 left-0 right-0 flex-row items-center border-t border-gray-100 bg-white"
    >
      {NAV_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          className={`flex-1 items-center justify-center py-2 ${
            item.id === "camera" ? "mb-4" : ""
          }`}
          onPress={() => {
            if (item.id === "home") router.push("/(home)");
            // if (item.id === "categories") router.push("/categories");
            if (item.id === "camera") router.push("/(camera)");
            // if (item.id === "wishlist") router.push("/wishlist");
            // if (item.id === "profile") router.push("/profile");
          }}
        >
          {item.id === "camera" ? (
            <View className="mb-1 h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color="white"
              />
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={item.id === "home" ? "#b08d55" : "#a0aec0"}
              />
              <Text
                className={`mt-1 text-[0.55rem] font-medium ${
                  item.id === "home" ? "text-primary" : "text-gray-400"
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
