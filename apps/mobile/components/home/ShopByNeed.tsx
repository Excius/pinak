import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getCategoryTree } from "@/services/category.service";

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
  aliases: string[];
}

const NEEDS: NeedItem[] = [
  {
    id: "daily",
    title: "Daily Makeup",
    icon: "white-balance-sunny",
    bgColor: "bg-rose-50",
    iconBgColor: "bg-rose-50",
    aliases: ["daily", "makeup"],
  },
  {
    id: "office",
    title: "Office Look",
    icon: "briefcase",
    bgColor: "bg-blue-50",
    iconBgColor: "bg-blue-50",
    aliases: ["office", "work"],
  },
  {
    id: "bridal",
    title: "Bridal Glam",
    icon: "heart",
    bgColor: "bg-red-50",
    iconBgColor: "bg-red-50",
    aliases: ["bridal", "wedding"],
  },
  {
    id: "festival",
    title: "Festival Glow",
    icon: "lightbulb-on",
    bgColor: "bg-yellow-50",
    iconBgColor: "bg-yellow-50",
    aliases: ["festival", "festive"],
  },
  {
    id: "monsoon",
    title: "Monsoon Proof",
    icon: "umbrella",
    bgColor: "bg-teal-50",
    iconBgColor: "bg-teal-50",
    aliases: ["monsoon", "waterproof"],
  },
  {
    id: "budget",
    title: "Budget Beauty",
    icon: "cash-multiple",
    bgColor: "bg-green-50",
    iconBgColor: "bg-green-50",
    aliases: ["budget", "affordable"],
  },
];

export function ShopByNeed() {
  const router = useRouter();
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategoryTree();
        type CategoryNode = {
          id: string;
          name: string;
          slug: string;
          children?: CategoryNode[];
        };
        const categories = (response.data as CategoryNode[]).flatMap(
          (category) => [category, ...(category.children ?? [])],
        );
        const matches: Record<string, string> = {};

        for (const need of NEEDS) {
          const match = categories.find((category) => {
            const searchable =
              `${category.name} ${category.slug}`.toLowerCase();
            return need.aliases.some((alias) => searchable.includes(alias));
          });
          if (match) matches[need.id] = match.id;
        }

        setCategoryIds(matches);
      } catch (error) {
        console.error("Failed to load Shop by Need categories:", error);
      }
    };

    void loadCategories();
  }, []);

  const handleNeedPress = (item: NeedItem) => {
    const categoryId = categoryIds[item.id];
    if (categoryId) {
      router.push({
        pathname: "/categories/[categoryId]",
        params: { categoryId, categoryName: item.title },
      });
      return;
    }

    router.push("/categories");
  };

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
                onPress={() => handleNeedPress(item)}
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
