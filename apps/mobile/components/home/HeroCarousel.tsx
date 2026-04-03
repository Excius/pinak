import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";

interface HeroItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  buttonText: string;
  buttonStyle: "primary" | "secondary";
  image: string;
}

const HERO_ITEMS: HeroItem[] = [
  {
    id: "1",
    badge: "The Royal Collection",
    title: "Bridal Kit",
    description: "Complete radiance for your special day.",
    buttonText: "Shop The Kit",
    buttonStyle: "primary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEb2pQStV0ALPl6ZWPfTmzXrt4P5tjrZ9OkvxNC3vTupem8OoVyZmvGsSn94VYu677wqDLv7d6k--BOscMyxpr7n62IQXIEzwv54WIbv45W8MQu_A74A52S9muKOoShuUZ2tdsniJFXv9FpywVCmct_2V9BaNPOiqo1PdrTvMwnsQ_9qkU0Op-0U89GeSz55s-8WDxKaok6ou2-E0U2rr93nKG9YIREfxyFj-P1qH4P0XGZpOERjKPIRm4f5QGAZ3WQRTXJtaSWRk",
  },
  {
    id: "2",
    badge: "Limited Edition",
    title: "Lipstick Combo",
    description: "3 Shades of elegance in one box.",
    buttonText: "View Shades",
    buttonStyle: "secondary",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYR9Cx_ccB8jdclpNBxxOtIRFyqNyChvbBQenV4AYrcC67ro5J2mcJKciz2zTWeT4eg-R0Rugix6wdRfp2sZE_FDtJRtyk0-PhWk_7d3Mcey_F5IiNVDtYoTZCsFhpTXCL5-5W9H7_-S2xnMxCQSFfdvQCW_fAoJfRTHCMKUtCUMWj0dcVmUEEHiLS2d_oH6W8WkV53V0HdwRUknnAI6gCSnYC6bMmu4DOtQ8--HBgJwyjkYk3tCBxudM0Mah5XoinGzLDdV6pQEk",
  },
];

const screenWidth = Dimensions.get("window").width;

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll effect - only when screen is focused
  useFocusEffect(
    useRef(() => {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % HERO_ITEMS.length;
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
    }).current,
  );

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setActiveIndex(index % HERO_ITEMS.length);
  };

  return (
    <View className="relative mt-2">
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
        {HERO_ITEMS.map((item) => (
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
        {HERO_ITEMS.map((_, index) => (
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
