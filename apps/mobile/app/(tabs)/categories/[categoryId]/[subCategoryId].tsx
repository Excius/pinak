import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductPage } from "@/components/products/ProductPage";

export default function SubCategoryProductScreen() {
  const { subCategoryId, subCategoryName } = useLocalSearchParams<{
    subCategoryId?: string;
    subCategoryName?: string;
  }>();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background-light">
      <ScrollView className="flex-1">
        <ProductPage
          categoryId={String(subCategoryId || "")}
          categoryName={subCategoryName ? String(subCategoryName) : undefined}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
