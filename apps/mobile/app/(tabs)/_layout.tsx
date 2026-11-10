import { Stack } from "expo-router";
import { BottomNavigation } from "../../components/BottomNavigation";
import { BrandHeader } from "@/components/BrandHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export default function HomeLayout() {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="bg-background z-10"
      >
        <BrandHeader />
      </SafeAreaView>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <BottomNavigation />
    </View>
  );
}
