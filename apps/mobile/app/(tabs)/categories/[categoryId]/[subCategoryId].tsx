import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductPage } from "@/components/products/ProductPage";

export default function SubCategoryProductScreen() {
  const { subCategoryId, subCategoryName, brand } = useLocalSearchParams<{
    subCategoryId?: string;
    subCategoryName?: string;
    brand?: string;
  }>();

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-light">
      <ScrollView className="flex-1">
        <ProductPage
          categoryId={String(subCategoryId || "")}
          categoryName={subCategoryName ? String(subCategoryName) : undefined}
          brand={brand ? String(brand) : undefined}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
