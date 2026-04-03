import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export function BeautyAdvisor() {
  return (
    <View className="border-y border-surface-border bg-surface py-12 px-6">
      <View className="mx-auto max-w-md gap-6 items-center">
        {/* Icon */}
        <View className="rounded-full bg-primary/20 p-3 border border-primary/30">
          <MaterialCommunityIcons name="auto-fix" size={32} color="#C9A962" />
        </View>

        {/* Content */}
        <View className="gap-2">
          <Text className="text-center text-3xl font-bold leading-tight text-text-primary font-display">
            Let Us Be Your Beauty Advisor
          </Text>
          <Text className="text-center text-base text-text-secondary">
            Answer 6 questions. Get personalized beauty picks.
          </Text>
        </View>

        {/* Quiz Button */}
        <TouchableOpacity className="w-full rounded-full bg-primary py-4 px-8 shadow-gold">
          <Text className="text-center text-lg font-bold text-background">
            Start the Quiz
          </Text>
        </TouchableOpacity>

        <Text className="text-[0.7rem] font-bold uppercase tracking-widest text-primary/70">
          Recommended for all skin types
        </Text>
      </View>
    </View>
  );
}
