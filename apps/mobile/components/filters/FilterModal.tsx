import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getFilterGroups } from "@/services/filter.service";
import { getProductsByCategory } from "@/services/product.service";
import type { FilterApi } from "@repo/types";

type FilterGroup = FilterApi.ResponseTypes["ListGroups"]["data"][number];
type FilterValue = FilterGroup["values"][number];

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filterValueIds: string[]) => void;
  categoryId: string;
  brand?: string;
}

/**
 * Filter Modal Component
 * Reusable filter UI for product filtering
 * Can be integrated into product browsing pages
 */
export function FilterModal({
  isVisible,
  onClose,
  onApplyFilters,
  categoryId,
  brand,
}: FilterModalProps) {
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(),
  );
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [isCountingResults, setIsCountingResults] = useState(false);

  // Load filter groups
  useEffect(() => {
    if (!isVisible) return;

    const loadFilters = async () => {
      try {
        setIsLoading(true);
        const response = await getFilterGroups(true); // Active only
        setGroups(response.data || []);
      } catch (err) {
        console.error("Failed to load filter groups:", err);
      } finally {
        setIsLoading(false);
      }
    };

    void loadFilters();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !categoryId) return;

    let isCurrentRequest = true;
    const countResults = async () => {
      setIsCountingResults(true);

      try {
        const response = await getProductsByCategory(categoryId, 1, 1, {
          inStock: true,
          ...(brand ? { brand } : {}),
          ...(selectedFilters.size > 0
            ? { filterValueIds: Array.from(selectedFilters) }
            : {}),
        });

        if (isCurrentRequest) {
          setResultCount(response.data.pagination.total);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setResultCount(null);
          console.error("Failed to count filtered products:", error);
        }
      } finally {
        if (isCurrentRequest) {
          setIsCountingResults(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      void countResults();
    }, 250);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeoutId);
    };
  }, [brand, categoryId, isVisible, selectedFilters]);

  // Toggle filter selection
  const toggleFilter = (filterId: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterId)) {
      newFilters.delete(filterId);
    } else {
      newFilters.add(filterId);
    }
    setSelectedFilters(newFilters);
  };

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    onApplyFilters(Array.from(selectedFilters));
    onClose();
  }, [selectedFilters, onApplyFilters, onClose]);

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedFilters(new Set());
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <Pressable className="flex-1" onPress={onClose} />
        <SafeAreaView
          edges={["bottom"]}
          className="max-h-[86%] overflow-hidden rounded-t-[2rem] border-t border-primary/30 bg-background-light"
        >
          <View className="items-center px-6 pt-3">
            <View className="h-1.5 w-12 rounded-full bg-surface-border" />
          </View>

          <View className="flex-row items-center justify-between px-6 pb-4 pt-3">
            <View>
              <Text className="text-2xl font-bold text-text-primary font-display">
                Refine your search
              </Text>
              <Text className="mt-1 text-xs text-text-secondary">
                Choose one or more options
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close filters"
              className="h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface"
            >
              <MaterialCommunityIcons name="close" size={20} color="#C9A962" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="h-72 items-center justify-center">
              <ActivityIndicator size="small" color="#C9A962" />
            </View>
          ) : groups.length > 0 ? (
            <ScrollView
              className="border-y border-surface-border"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingVertical: 20,
              }}
            >
              <View>
                {groups.map((group) => (
                  <View key={group.id} className="mb-7">
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-base font-bold text-text-primary font-display">
                        {group.name}
                      </Text>
                      <Text className="text-xs text-text-muted">
                        {group.values.length} options
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2.5">
                      {group.values.map((value) => (
                        <TouchableOpacity
                          key={value.id}
                          onPress={() => toggleFilter(value.id)}
                          className={`flex-row items-center gap-2 rounded-xl border px-3.5 py-3 ${
                            selectedFilters.has(value.id)
                              ? "bg-primary border-primary"
                              : "bg-surface border-surface-border"
                          }`}
                        >
                          {selectedFilters.has(value.id) && (
                            <MaterialCommunityIcons
                              name="check"
                              size={15}
                              color="#0A0A0A"
                            />
                          )}
                          <Text
                            className={`text-sm font-semibold ${
                              selectedFilters.has(value.id)
                                ? "text-background"
                                : "text-text-primary"
                            }`}
                          >
                            {value.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="h-72 items-center justify-center px-6">
              <MaterialCommunityIcons
                name="tune-variant"
                size={32}
                color="#C9A962"
              />
              <Text className="text-sm text-text-secondary">
                No filters are available for this catalog yet.
              </Text>
            </View>
          )}

          <View className="flex-row items-center gap-3 bg-background-light px-6 py-4">
            <TouchableOpacity
              onPress={handleClearFilters}
              disabled={selectedFilters.size === 0}
              className={`flex-1 items-center justify-center rounded-xl border py-3.5 ${
                selectedFilters.size === 0
                  ? "border-surface-border bg-surface"
                  : "border-primary/50 bg-surface"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  selectedFilters.size === 0
                    ? "text-text-muted"
                    : "text-primary"
                }`}
              >
                Clear all
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApplyFilters}
              className="flex-[1.4] flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5"
            >
              <MaterialCommunityIcons name="check" size={17} color="#0A0A0A" />
              <Text className="text-sm font-bold text-background">
                {isCountingResults
                  ? "Counting results..."
                  : resultCount !== null
                    ? `Show ${resultCount} results`
                    : "Apply filters"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
