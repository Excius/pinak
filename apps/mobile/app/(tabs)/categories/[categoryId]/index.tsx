import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategoryStore } from "@/store/category/store";
import { ProductPage } from "@/components/products/ProductPage";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { getSubCategories } from "@/services/category.service";
import { mapSubCategoriesForCards } from "@/utils/mappers/category.mapper";

interface SubCategoryCardItem {
  id: string;
  title: string;
  imageUrl: string;
}

export default function CategoryProductScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();
  const router = useRouter();
  const resolvedCategoryId = String(categoryId || "");
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const [subCategories, setSubCategories] = useState<SubCategoryCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (categoryName && categoryName.trim().length > 0) {
      return categoryName;
    }
    return "Category";
  }, [categoryName]);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!resolvedCategoryId) {
        setIsLoading(false);
        setError("Invalid category.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getSubCategories(resolvedCategoryId, false);
        setSubCategories(mapSubCategoriesForCards(response.data));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load category items right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadSubCategories();
  }, [resolvedCategoryId]);

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-light">
        <View className="flex-1 px-6 py-10">
          <Text className="text-sm text-text-secondary">{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (subCategories.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-light">
        <ScrollView className="flex-1">
          <ProductPage
            categoryId={resolvedCategoryId || selectedCategory}
            categoryName={title}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleSubCategoryPress = (
    subCategoryId: string,
    subCategoryName: string,
  ) => {
    const parentCategoryId =
      resolvedCategoryId || String(selectedCategory || "");
    if (!parentCategoryId) {
      return;
    }

    useCategoryStore.getState().selectCategory(subCategoryId);
    router.push({
      pathname: "/categories/[categoryId]/[subCategoryId]",
      params: {
        categoryId: parentCategoryId,
        subCategoryId,
        subCategoryName,
      },
    });
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-light">
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        <Text className="text-2xl font-display font-bold text-text-primary mb-5 px-1">
          {title}
        </Text>
        <View className="gap-4">
          {subCategories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              imageUrl={category.imageUrl}
              onPress={() =>
                handleSubCategoryPress(category.id, category.title)
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
