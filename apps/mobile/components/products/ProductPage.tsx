import { View, Text } from "react-native";
import { ProductGrid } from "./ProductGrid";

interface ProductPageProps {
  categoryId?: string | null;
}

// Category titles mapping
const CATEGORY_TITLES: Record<string, string> = {
  lips: "The Lip Collection",
  eyes: "The Eye Collection",
  face: "The Face Collection",
  skincare: "The Skincare Collection",
};

const CATEGORY_COUNTS: Record<string, number> = {
  lips: 24,
  eyes: 18,
  face: 28,
  skincare: 32,
};

export function ProductPage({ categoryId }: ProductPageProps) {
  const categoryKey = (categoryId || "lips") as keyof typeof CATEGORY_TITLES;
  const title = CATEGORY_TITLES[categoryKey] || "Products";
  const count = CATEGORY_COUNTS[categoryKey] || 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header Section */}
      <View className="px-6 pt-8 pb-4">
        <Text className="font-display text-3xl font-bold text-text-primary leading-tight">
          {title}
        </Text>
        <Text className="text-text-secondary text-sm mt-1 font-medium tracking-widest uppercase">
          {count} EXQUISITE PRODUCTS
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
      <ProductGrid categoryId={categoryKey} />
    </View>
  );
}
