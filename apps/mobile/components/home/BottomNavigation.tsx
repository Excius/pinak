import { View, TouchableOpacity, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="fixed bottom-0 left-0 right-0 flex-row items-center border-t border-gray-100 bg-white"
    >
      {NAV_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          className={`flex-1 items-center justify-center py-4 ${
            item.id === "camera" ? "mb-8" : ""
          }`}
        >
          {item.id === "camera" ? (
            <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color="white"
              />
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={item.id === "home" ? "#b08d55" : "#a0aec0"}
              />
              <Text
                className={`mt-1 text-[0.6rem] font-medium ${
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
