import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

import SignInForm from "@/components/auth/SigninForm";
import SignUpForm from "@/components/auth/SignUpForm";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ScrollView className="flex-1 bg-background-light">
      {/* Header / Branding */}
      <View className="items-center gap-2 px-6 py-8 mt-12">
        <View className="h-18 w-18 items-center justify-center rounded-full bg-primary mb-1">
          {/* <MaterialIcons name="eco" size={24} color="#ca8881" /> */}
          <Image
            source={require("../../assets/images/Pinak_Logo_NoBg.png")}
            style={{ width: 64, height: 64 }}
          />
        </View>
        {/* <Text className="font-display text-2xl font-bold tracking-widest text-primary uppercase">
          Pinak
        </Text> */}
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6">
        {/* Segmented Buttons (Login / Sign Up Toggle) */}
        <View className="mb-8 flex-row rounded-2xl bg-primary/10 p-1.5">
          <Pressable
            onPress={() => setIsLogin(true)}
            className={`flex-1 items-center justify-center rounded-lg py-2.5 ${
              isLogin ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isLogin ? "text-[#181211]" : "text-muted-taupe"
              }`}
            >
              Login
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsLogin(false)}
            className={`flex-1 items-center justify-center rounded-lg py-2.5 ${
              !isLogin ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                !isLogin ? "text-[#181211]" : "text-muted-taupe"
              }`}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>

        {/* Intro Text */}
        <View className="mb-8">
          <Text className="font-display text-2xl font-bold text-[#181211] mb-2">
            Welcome back
          </Text>
          <Text className="text-muted-taupe text-sm">
            Experience the ritual of expert-led beauty.
          </Text>
        </View>

        {/* Login Form */}
        {isLogin ? <SignInForm /> : <SignUpForm />}

        {/* Divider */}
        <View className="my-8 flex-row items-center gap-4">
          <View className="flex-1 h-px bg-soft-border/60" />
          <Text className="font-display italic text-muted-taupe text-sm">
            or
          </Text>
          <View className="flex-1 h-px bg-soft-border/60" />
        </View>

        {/* Google Sign In */}
        <View className="pb-10">
          <Pressable className="h-14 w-full flex-row items-center justify-center rounded-xl border border-soft-border bg-white gap-3 active:opacity-80">
            <MaterialIcons name="login" size={20} color="#4285F4" />
            <Text className="text-[#181211] font-medium text-base">
              Continue with Google
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
