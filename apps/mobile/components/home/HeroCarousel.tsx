import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getFeaturedSections } from "@/services/featuredSection.service";
import type { FeaturedSectionApi } from "@repo/types";

interface HeroItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  buttonText: string;
  buttonStyle: "primary" | "secondary";
  image: string;
}

type FeaturedSection =
  FeaturedSectionApi.ResponseTypes["ListFeaturedSections"]["data"][number];

const screenWidth = Dimensions.get("window").width;

export function HeroCarousel() {
  const router = useRouter();
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadHeroSections = async () => {
      try {
        const response = await getFeaturedSections();
        const items = (response.data as FeaturedSection[])
          .filter((section) => section.type === "HOMEPAGE_HERO")
          .sort((a, b) => a.priority - b.priority)
          .reduce<HeroItem[]>(
          (heroSections, section) => {
            const image =
              section.images.find((item) => item.isPrimary) ?? section.images[0];

            if (!image) return heroSections;

            heroSections.push({
              id: section.id,
              badge: "Featured Collection",
              title: section.title,
              description: "Discover our latest curated beauty edit.",
              buttonText: "Shop Collection",
              buttonStyle: "primary",
              image: image.url,
            });
            return heroSections;
          },
            [],
          );

        setHeroItems(items);
      } catch (error) {
        console.error("Failed to load homepage hero sections:", error);
        setHeroItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadHeroSections();
  }, []);

  // Auto-scroll effect - only when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (heroItems.length === 0) return undefined;

      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % heroItems.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * screenWidth,
            animated: true,
          });
          return nextIndex;
        });
      }, 5000); // Auto-scroll every 5 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [heroItems.length]),
  );

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (heroItems.length > 0) {
      setActiveIndex(index % heroItems.length);
    }
  };

  if (isLoading) {
    return (
      <View className="h-80 items-center justify-center">
        <ActivityIndicator size="small" color="#C9A962" />
      </View>
    );
  }

  if (heroItems.length === 0) {
    return null;
  }

  return (
    <View className="relative mt-4">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEnabled={true}
      >
        {heroItems.map((item) => (
          <View
            key={item.id}
            style={{ width: screenWidth }}
            className="flex-1 px-4"
          >
            <View className="relative h-80 overflow-hidden rounded-3xl shadow-gold border border-primary/20">
              <Image
                source={{ uri: item.image }}
                className="absolute inset-0 h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/60" />
              <View className="absolute bottom-0 left-0 right-0 p-6">
                <Text className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-primary">
                  {item.badge}
                </Text>
                <Text className="mb-2 text-center text-4xl font-bold text-text-primary font-display">
                  {item.title}
                </Text>
                <Text className="mb-6 text-center text-sm font-light text-text-secondary">
                  {item.description}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/sections/${item.id}` as never)}
                  className={`w-full rounded-full py-3 ${
                    item.buttonStyle === "primary"
                      ? "bg-primary"
                      : "bg-surface border border-primary"
                  }`}
                >
                  <Text
                    className={`text-center font-bold ${
                      item.buttonStyle === "primary"
                        ? "text-background"
                        : "text-primary"
                    }`}
                  >
                    {item.buttonText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Carousel Indicators */}
      <View className="flex-row justify-center space-x-2 mt-4 gap-2">
        {heroItems.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === activeIndex ? "bg-primary" : "bg-surface-border"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
