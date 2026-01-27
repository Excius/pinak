// Import shim first to patch JSON.stringify before NativeWind loads
import "../nativewind-shim";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import "../global.css";
import Toast from "react-native-toast-message";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
          <Toast />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
