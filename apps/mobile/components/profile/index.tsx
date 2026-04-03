import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileLayout() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    router.push("/(auth)");
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#C9A962" />
      </SafeAreaView>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView className="flex-1 px-6 pt-8">
          <View className="items-center justify-center py-16">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/20 border-2 border-primary mb-6">
              <MaterialIcons name="person-outline" size={48} color="#C9A962" />
            </View>
            <Text className="text-2xl font-bold text-text-primary mb-2">
              Welcome to Pinak
            </Text>
            <Text className="text-center text-text-secondary mb-8 px-8">
              Sign in to access your profile, orders, wishlist, and personalized
              recommendations.
            </Text>
            <Pressable
              onPress={handleLogin}
              className="bg-primary py-4 px-12 rounded-xl active:opacity-90"
            >
              <Text className="text-background font-semibold text-base">
                Sign In / Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Guest options */}
          <View className="mt-8">
            <Text className="text-sm text-text-secondary uppercase tracking-wider mb-4 font-semibold">
              Help & Support
            </Text>
            <View className="bg-surface rounded-xl overflow-hidden border border-surface-border">
              <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-border">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons
                    name="help-outline"
                    size={22}
                    color="#8A8A8A"
                  />
                  <Text className="text-text-primary">FAQs</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
              </Pressable>
              <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-border">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons
                    name="local-shipping"
                    size={22}
                    color="#8A8A8A"
                  />
                  <Text className="text-text-primary">Shipping Info</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
              </Pressable>
              <Pressable className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="headset-mic" size={22} color="#8A8A8A" />
                  <Text className="text-text-primary">Contact Us</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
              </Pressable>
            </View>
          </View>

          {/* Spacer for bottom nav */}
          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authenticated user profile
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Profile Header */}
        <View className="items-center py-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary mb-3">
            <Text className="text-2xl font-bold text-background">
              {user?.username?.charAt(0).toUpperCase() ||
                user?.name?.charAt(0).toUpperCase() ||
                "U"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-text-primary">
            {user?.username || user?.name || "User"}
          </Text>
          <Text className="text-text-secondary text-sm">{user?.email}</Text>
        </View>

        {/* Account Options */}
        <View className="mt-4">
          <Text className="text-sm text-text-secondary uppercase tracking-wider mb-4 font-semibold">
            My Account
          </Text>
          <View className="bg-surface rounded-xl overflow-hidden border border-surface-border">
            <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-border">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="shopping-bag" size={22} color="#C9A962" />
                <Text className="text-text-primary">My Orders</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
            </Pressable>
            <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-border">
              <View className="flex-row items-center gap-3">
                <MaterialIcons
                  name="favorite-outline"
                  size={22}
                  color="#C9A962"
                />
                <Text className="text-text-primary">Wishlist</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
            </Pressable>
            <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-border">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="location-on" size={22} color="#C9A962" />
                <Text className="text-text-primary">Saved Addresses</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
            </Pressable>
            <Pressable className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="settings" size={22} color="#C9A962" />
                <Text className="text-text-primary">Settings</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
            </Pressable>
          </View>
        </View>

        {/* Help & Support */}
        <View className="mt-6">
          <Text className="text-sm text-text-secondary uppercase tracking-wider mb-4 font-semibold">
            Help & Support
          </Text>
          <View className="bg-surface rounded-xl overflow-hidden border border-surface-border">
            <Pressable className="flex-row items-center justify-between p-4 border-b border-surface-border">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="help-outline" size={22} color="#8A8A8A" />
                <Text className="text-text-primary">FAQs</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
            </Pressable>
            <Pressable className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="headset-mic" size={22} color="#8A8A8A" />
                <Text className="text-text-primary">Contact Us</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#6B6B6B" />
            </Pressable>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-8 mb-24">
          <Pressable
            onPress={handleLogout}
            className="bg-error/10 border border-error/30 py-4 rounded-xl items-center active:opacity-90"
          >
            <Text className="text-error font-semibold text-base">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
