import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export function BeautyAdvisor() {
  return (
    <View className="border-b border-y border-rose-100 bg-blush py-12 px-6">
      <View className="mx-auto max-w-md gap-6 items-center">
        {/* Icon */}
        <View className="rounded-full bg-white p-3 shadow-sm">
          <MaterialCommunityIcons name="auto-fix" size={32} color="#b08d55" />
        </View>

        {/* Content */}
        <View className="gap-2">
          <Text className="text-center text-3xl font-bold leading-tight text-gray-900 font-display">
            Let Us Be Your Beauty Advisor
          </Text>
          <Text className="text-center text-base text-gray-600">
            Answer 6 questions. Get personalized beauty picks.
          </Text>
        </View>

        {/* Quiz Button */}
        <TouchableOpacity className="w-full rounded-full bg-primary py-4 px-8 shadow-lg shadow-primary/20">
          <Text className="text-center text-lg font-bold text-white">
            Start the Quiz
          </Text>
        </TouchableOpacity>

        <Text className="text-[0.7rem] font-bold uppercase tracking-widest text-primary/60">
          Recommended for all skin types
        </Text>
      </View>
    </View>
  );
}
