import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { toastError, toastSuccess } from "@/libs/toast";

export default function OAuthCallback() {
  const { code, error } = useLocalSearchParams();
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const completeOauthLogin = async () => {
      if (error) {
        if (isMounted) {
          toastError("Google sign-in was cancelled or failed.");
          router.replace("/(auth)");
        }
        return;
      }

      if (!code || typeof code !== "string") {
        return;
      }

      try {
        await loginWithGoogle(code);
        if (isMounted) {
          toastSuccess("Signed in with Google");
          router.replace("/(tabs)");
        }
      } catch (err: any) {
        if (isMounted) {
          toastError(err?.message || "Google login failed. Please try again.");
          router.replace("/(auth)");
        }
      }
    };

    completeOauthLogin();

    return () => {
      isMounted = false;
    };
  }, [code, error, loginWithGoogle, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <ActivityIndicator size="large" color="#C9A962" />
      <Text className="mt-4 text-text-secondary text-sm text-center">
        Completing Google sign-in...
      </Text>
    </View>
  );
}
