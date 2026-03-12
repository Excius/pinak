import { View, Text } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Feature {
  icon: "check-circle" | "diamond" | "star";
  label: string;
}

const FEATURES: Feature[] = [
  { icon: "check-circle", label: "Authenticity" },
  { icon: "diamond", label: "Luxury" },
  { icon: "star", label: "Excellence" },
];

export function FeatureRow() {
  return (
    <View className="flex-row items-center justify-between gap-4 px-4 py-6">
      {FEATURES.map((feature, index) => (
        <View key={feature.label} className="flex-1 items-center gap-2">
          <View className="rounded-full bg-primary/20 p-2 border border-primary/30">
            <MaterialCommunityIcons
              name={feature.icon}
              size={18}
              color="#C9A962"
            />
          </View>
          <Text className="text-center text-[0.65rem] font-bold uppercase tracking-wider text-text-secondary">
            {feature.label}
          </Text>
          {index < FEATURES.length - 1 && (
            <View className="absolute right-0 h-8 w-px bg-surface-border" />
          )}
        </View>
      ))}
    </View>
  );
}
