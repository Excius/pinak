import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCategoryStore } from "@/store/category/store";
import { ProductPage } from "@/components/products/ProductPage";

export default function CategoryProductScreen() {
  const { categoryId } = useLocalSearchParams();
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-light">
      <ScrollView className="flex-1">
        <ProductPage categoryId={String(categoryId) || selectedCategory} />
      </ScrollView>
    </SafeAreaView>
  );
}
