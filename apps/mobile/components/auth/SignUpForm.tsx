import { View, Text, TextInput, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="space-y-4">
      {/* Email Field */}
      <View className="flex flex-col pt-5">
        <Text className="text-muted-taupe text-xs font-semibold uppercase tracking-wider pb-1.5 pl-1">
          Email Address
        </Text>

        <TextInput
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          className="h-14 w-full rounded-xl border border-soft-border bg-white px-4 text-base text-[#181211]"
          placeholderTextColor="rgba(181,170,163,0.5)"
        />
      </View>

      {/* Password Field */}
      <View className="flex flex-col">
        <Text className="text-muted-taupe text-xs font-semibold uppercase tracking-wider pb-1.5 pl-1 pt-5">
          Password
        </Text>

        <View className="relative flex-row items-center">
          <TextInput
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="h-14 flex-1 rounded-xl border border-soft-border bg-white px-5 pr-12 text-base text-[#181211] "
            placeholderTextColor="rgba(181,170,163,0.5)"
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4"
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={22}
              color="#ca8881"
            />
          </Pressable>
        </View>
      </View>

      {/* Sign Up Button */}
      <View className="pt-8">
        <Pressable className="h-14 w-full items-center justify-center rounded-xl bg-primary active:opacity-90">
          <Text className="text-white font-semibold text-base">Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
