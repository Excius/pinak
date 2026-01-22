import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Svg, Path } from "react-native-svg";
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
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <Path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <Path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <Path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                fill="#EA4335"
              />
            </Svg>
            <Text className="text-[#181211] font-medium text-base">
              Continue with Google
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
