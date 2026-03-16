import { Stack } from "expo-router";
import { BottomNavigation } from "../../components/BottomNavigation";
import { BrandHeader } from "@/components/BrandHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeLayout() {
  return (
    <>
      <SafeAreaView edges={["top", "left", "right"]}>
        <BrandHeader />
      </SafeAreaView>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
      <BottomNavigation />
    </>
  );
}
