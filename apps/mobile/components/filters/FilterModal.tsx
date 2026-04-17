import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getFilterGroups } from "@/services/filter.service";
import type { FilterApi } from "@repo/types";

type FilterGroup = FilterApi.ResponseTypes["ListGroups"]["data"][number];
type FilterValue = FilterGroup["values"][number];

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filterValueIds: string[]) => void;
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
}: FilterModalProps) {
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set()
  );

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
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        {/* Modal Content */}
        <View className="flex-1 mt-auto bg-background rounded-t-3xl overflow-hidden">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-surface-border">
            <Text className="text-lg font-bold text-text-primary font-display">
              Filter Products
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-surface items-center justify-center"
            >
              <MaterialCommunityIcons name="close" size={20} color="#C9A962" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#C9A962" />
            </View>
          ) : groups.length > 0 ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-6 py-4">
                {groups.map((group) => (
                  <View key={group.id} className="mb-6">
                    {/* Group Title */}
                    <Text className="text-sm font-bold text-text-primary font-display uppercase tracking-widest mb-3">
                      {group.name}
                    </Text>

                    {/* Filter Values */}
                    <View className="flex-row flex-wrap gap-2">
                      {group.values.map((value) => (
                        <TouchableOpacity
                          key={value.id}
                          onPress={() => toggleFilter(value.id)}
                          className={`px-4 py-2 rounded-full border-2 ${
                            selectedFilters.has(value.id)
                              ? "bg-primary border-primary"
                              : "bg-surface border-surface-border"
                          }`}
                        >
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
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-text-secondary">
                No filters available
              </Text>
            </View>
          )}

          {/* Footer Buttons */}
          <View className="flex-row gap-4 px-6 py-4 border-t border-surface-border bg-background">
            <TouchableOpacity
              onPress={handleClearFilters}
              className="flex-1 border border-primary rounded-full py-3 items-center justify-center"
            >
              <Text className="text-sm font-bold text-primary">Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApplyFilters}
              className="flex-1 bg-primary rounded-full py-3 items-center justify-center"
            >
              <Text className="text-sm font-bold text-background">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
