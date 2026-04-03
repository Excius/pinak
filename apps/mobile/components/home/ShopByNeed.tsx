import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface NeedItem {
  id: string;
  title: string;
  icon:
    | "white-balance-sunny"
    | "briefcase"
    | "heart"
    | "lightbulb-on"
    | "umbrella"
    | "cash-multiple";
  bgColor: string;
  iconBgColor: string;
}

const NEEDS: NeedItem[] = [
  {
    id: "daily",
    title: "Daily Makeup",
    icon: "white-balance-sunny",
    bgColor: "bg-rose-50",
    iconBgColor: "bg-rose-50",
  },
  {
    id: "office",
    title: "Office Look",
    icon: "briefcase",
    bgColor: "bg-blue-50",
    iconBgColor: "bg-blue-50",
  },
  {
    id: "bridal",
    title: "Bridal Glam",
    icon: "heart",
    bgColor: "bg-red-50",
    iconBgColor: "bg-red-50",
  },
  {
    id: "festival",
    title: "Festival Glow",
    icon: "lightbulb-on",
    bgColor: "bg-yellow-50",
    iconBgColor: "bg-yellow-50",
  },
  {
    id: "monsoon",
    title: "Monsoon Proof",
    icon: "umbrella",
    bgColor: "bg-teal-50",
    iconBgColor: "bg-teal-50",
  },
  {
    id: "budget",
    title: "Budget Beauty",
    icon: "cash-multiple",
    bgColor: "bg-green-50",
    iconBgColor: "bg-green-50",
  },
];

export function ShopByNeed() {
  return (
    <View className="mx-2 mb-4 rounded-3xl bg-surface px-4 py-4 border border-surface-border">
      <View className="mb-4 items-center">
        <Text className="text-xl font-bold font-display text-text-primary">
          Shop by Need
        </Text>
        <Text className="mt-1 text-xs text-text-secondary">
          Curated collections for every occasion
        </Text>
      </View>

      <View className="gap-3">
        {NEEDS.reduce((rows, item, index) => {
          if (index % 2 === 0) rows.push([]);
          rows[rows.length - 1].push(item);
          return rows;
        }, [] as NeedItem[][]).map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-3">
            {row.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-1 flex-col items-center rounded-xl border border-surface-border bg-surface-light p-4"
              >
                <View className="mb-2 rounded-full p-3 bg-primary/20">
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#C9A962"
                  />
                </View>
                <Text className="text-center text-sm font-semibold text-text-primary font-display">
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
      </View>
    </View>
  );
}
