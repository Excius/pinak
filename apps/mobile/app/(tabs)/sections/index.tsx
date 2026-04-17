import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getFeaturedSections } from "@/services/featuredSection.service";
import type { FeaturedSectionApi } from "@repo/types";

type Section = FeaturedSectionApi.ResponseTypes["ListFeaturedSections"]["data"][number];

// Mapping of section types to icons and colors
const SECTION_CONFIG: Record<string, { icon: string; color: string; description: string }> = {
  EXPERT_PICKS: {
    icon: "star-outline",
    color: "#C9A962",
    description: "Handpicked by our experts",
  },
  HOMEPAGE_HERO: {
    icon: "fire",
    color: "#EF4444",
    description: "Featured collection",
  },
  DEALS: {
    icon: "tag-multiple",
    color: "#8B5CF6",
    description: "Limited time offers",
  },
};

/**
 * Featured Section Card Component
 * Displays individual featured section
 */
function SectionCard({ section, onPress }: { section: Section; onPress: (id: string) => void }) {
  const config = SECTION_CONFIG[section.type] || SECTION_CONFIG.EXPERT_PICKS;

  return (
    <TouchableOpacity
      onPress={() => onPress(section.id)}
      className="mx-4 mb-4 rounded-2xl border border-surface-border bg-gradient-to-r bg-surface overflow-hidden active:opacity-75 py-6"
    >
      <View className="px-6 flex-row items-center justify-between">
        {/* Section Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
            <Text className="text-xs font-bold uppercase tracking-widest text-primary">
              {section.type.replace(/_/g, " ")}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-text-primary font-display mb-1">
            {section.title}
          </Text>

          <Text className="text-xs text-text-secondary">
            {config.description}
          </Text>
        </View>

        {/* Arrow */}
        <View className="ml-4 w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="#C9A962"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Featured Sections Screen
 * Browse curated product collections
 */
export default function FeaturedSectionsScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load featured sections
  useEffect(() => {
    const loadSections = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFeaturedSections();
        // Sort by priority
        const sorted = (response.data || []).sort(
          (a, b) => a.priority - b.priority
        );
        setSections(sorted);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load sections"
        );
        setSections([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSections();
  }, []);

  // Handle section press
  const handleSectionPress = (sectionId: string) => {
    router.push(`/sections/${sectionId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  // Error/Empty state
  if (error || sections.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
        <View className="px-6 py-6 border-b border-surface-border">
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            Curated For You
          </Text>
          <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
            Collections
          </Text>
        </View>

        <View className="flex-1 px-6 items-center justify-center">
          <MaterialCommunityIcons
            name="folder-open-outline"
            size={64}
            color="#C9A962"
          />
          <Text className="text-xl font-bold text-text-primary mt-4 font-display">
            No Collections Found
          </Text>
          <Text className="text-sm text-text-secondary text-center mt-2">
            {error || "No curated collections available"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-6 border-b border-surface-border">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">
          Curated For You
        </Text>
        <Text className="mt-2 text-3xl font-bold text-text-primary font-display">
          Collections
        </Text>
        <Text className="mt-1 text-sm text-text-secondary">
          Explore handpicked product curations
        </Text>
      </View>

      {/* Sections List */}
      <FlatList
        data={sections}
        renderItem={({ item }) => (
          <SectionCard
            section={item}
            onPress={handleSectionPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }}
        scrollIndicatorInsets={{ right: 1 }}
      />
    </SafeAreaView>
  );
}
