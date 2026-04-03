import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getTopCategories } from "@/services/category.service";
import {
  mapTopCategoriesForHome,
  type HomeCategoryItem,
} from "@/utils/mappers/category.mapper";

export function ShopByCategory() {
  const router = useRouter();
  const [categories, setCategories] = useState<HomeCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getTopCategories();
        setCategories(mapTopCategoriesForHome(response.data));
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
    router.push({
      pathname: "/categories/[categoryId]",
      params: { categoryId, categoryName },
    });
  };

  return (
    <View className="py-6">
      <View className="mb-4 flex-row items-end justify-between px-4">
        <Text className="text-xl font-bold font-display text-text-primary">
          Shop by Category
        </Text>
        <TouchableOpacity onPress={() => router.push("/categories")}>
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="px-4 py-10 items-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      ) : error ? (
        <View className="px-4 py-6">
          <Text className="text-sm text-text-secondary">{error}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          className="px-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryPress(category.id, category.name)}
              className="mr-6 items-center gap-3"
            >
              <View className="h-28 w-28 rounded-full border-2 border-primary/30 p-1 bg-surface">
                <View className="h-full w-full overflow-hidden rounded-full border-2 border-surface-border">
                  <Image
                    source={{ uri: category.image }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
              </View>
              <Text className="text-sm font-semibold text-text-primary">
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
