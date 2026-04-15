import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { CategoryCard } from "./CategoryCard";
import { useCategoryStore } from "@/store/category/store";
import { getTopCategories } from "@/services/category.service";
import {
  mapTopCategoriesForCategoryTab,
  type CategoryCardItem,
} from "@/utils/mappers/category.mapper";

export function CategoryList() {
  const router = useRouter();
  const selectCategory = useCategoryStore((state) => state.selectCategory);
  const [categories, setCategories] = useState<CategoryCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getTopCategories();
        setCategories(mapTopCategoriesForCategoryTab(response.data));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load categories right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadTopCategories();
  }, []);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    selectCategory(categoryId);
    router.push({
      pathname: "/categories/[categoryId]",
      params: { categoryId, categoryName },
    });
  };

  if (isLoading) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="small" color="#C9A962" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-6">
        <Text className="text-sm text-text-secondary">{error}</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          title={category.title}
          imageUrl={category.imageUrl}
          onPress={() => handleCategoryPress(category.id, category.title)}
        />
      ))}
    </View>
  );
}
