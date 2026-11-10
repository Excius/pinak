import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FilterModal } from "@/components/filters/FilterModal";
import { ProductGrid } from "./ProductGrid";

interface ProductPageProps {
  categoryId?: string | null;
  categoryName?: string;
  brand?: string;
}

export function ProductPage({
  categoryId,
  categoryName,
  brand,
}: ProductPageProps) {
  const resolvedCategoryId = categoryId || "";
  const title = categoryName ? `${categoryName} Collection` : "Products";
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filterValueIds, setFilterValueIds] = useState<string[]>([]);

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

      {/* Filter Bar */}
      <View className="mb-4 flex-row items-center justify-between px-6 py-2">
        <TouchableOpacity
          onPress={() => setIsFilterVisible(true)}
          className="flex-row items-center gap-2 rounded-xl border border-primary/30 bg-surface px-4 py-3"
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={15}
            color="#C9A962"
          />
          <Text className="text-xs font-bold uppercase tracking-wider text-text-primary">
            {filterValueIds.length > 0
              ? `${filterValueIds.length} filters applied`
              : "Filter products"}
          </Text>
        </TouchableOpacity>
        {filterValueIds.length > 0 && (
          <TouchableOpacity onPress={() => setFilterValueIds([])}>
            <Text className="text-xs font-bold uppercase tracking-wider text-primary">
              Clear
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Product Grid */}
      <ProductGrid
        categoryId={resolvedCategoryId}
        brand={brand}
        filterValueIds={filterValueIds}
      />

      <FilterModal
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApplyFilters={setFilterValueIds}
        categoryId={resolvedCategoryId}
        brand={brand}
      />
    </View>
  );
}
