import { View, Text } from "react-native";
import { ProductGrid } from "./ProductGrid";

interface ProductPageProps {
  categoryId?: string | null;
  categoryName?: string;
}

export function ProductPage({ categoryId, categoryName }: ProductPageProps) {
  const resolvedCategoryId = categoryId || "";
  const title = categoryName ? `${categoryName} Collection` : "Products";

  return (
    <View className="flex-1 bg-background">
      {/* Header Section */}
      <View className="px-6 pt-8 pb-4">
        <Text className="font-display text-3xl font-bold text-text-primary leading-tight">
          {title}
        </Text>
        <Text className="text-text-secondary text-sm mt-1 font-medium tracking-widest uppercase">
          Curated essentials for your beauty ritual
        </Text>
      </View>

      {/* Filter/Sort Bar */}
      <View className="flex-row gap-3 px-6 py-2 mb-4">
        <View className="px-4 py-2 bg-surface border border-primary/20 rounded-full justify-center items-center">
          <Text className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Filter
          </Text>
        </View>
        <View className="px-4 py-2 bg-surface border border-primary/20 rounded-full justify-center items-center">
          <Text className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Sort By
          </Text>
        </View>
        <View className="px-4 py-2 bg-surface border border-primary/20 rounded-full justify-center items-center">
          <Text className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Price
          </Text>
        </View>
      </View>

      {/* Product Grid */}
      <ProductGrid categoryId={resolvedCategoryId} />
    </View>
  );
}
