import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toastSuccess, toastError } from "@/libs/toast";

type Props = {
  onSuccess?: () => void;
};

export default function SignUpForm({ onSuccess }: Props) {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = email.trim() && username.trim() && password.trim();

  const handleSignUp = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await signup(email, username, password);
      toastSuccess(
        "Sign-up successful! Please check your email to verify your account.",
      );
      setEmail("");
      setUsername("");
      setPassword("");
      onSuccess?.();
    } catch (err: any) {
      // Error message is already formatted in AuthContext
      const errorMessage = err?.message || "Sign-up failed. Please try again.";
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="space-y-4">
      {/* Email Field */}
      <View className="flex flex-col pt-5">
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider pb-1.5 pl-1">
          Email Address
        </Text>

        <TextInput
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          className="h-14 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary"
          placeholderTextColor="#8B8B8B"
        />
      </View>

      {/* Username Field */}
      <View className="flex flex-col pt-5">
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider pb-1.5 pl-1">
          Username
        </Text>

        <TextInput
          placeholder="Enter your username"
          keyboardType="default"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          className="h-14 w-full rounded-xl border border-surface-border bg-surface px-4 text-base text-text-primary"
          placeholderTextColor="#8B8B8B"
        />
      </View>

      {/* Password Field */}
      <View className="flex flex-col">
        <Text className="text-text-secondary text-xs font-semibold uppercase tracking-wider pb-1.5 pl-1 pt-5">
          Password
        </Text>

        <View className="relative flex-row items-center">
          <TextInput
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="h-14 flex-1 rounded-xl border border-surface-border bg-surface px-5 pr-12 text-base text-text-primary"
            placeholderTextColor="#8B8B8B"
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4"
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={22}
              color="#C9A962"
            />
          </Pressable>
        </View>
      </View>

      {/* Sign Up Button */}
      <View className="pt-8">
        <Pressable
          onPress={handleSignUp}
          disabled={!isFormValid || isLoading}
          className={`h-14 w-full items-center justify-center rounded-xl ${
            isFormValid && !isLoading
              ? "bg-primary active:opacity-90"
              : "bg-primary/30"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0A0A0A" />
          ) : (
            <Text className="text-background font-semibold text-base">
              Sign Up
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
