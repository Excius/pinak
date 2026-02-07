import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useState } from "react";

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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEb2pQStV0ALPl6ZWPfTmzXrt4P5tjrZ9OkvxNC3vTupem8OoVyZmvGsSn94VYu677wqDLv7d6k--BOscMyxpr7n62IQXIEzwv54WIbv45W8MQu_A74A52S9muKOoShuUZ2tdsniJFXv9FpywVCmct_2V9BaNPOiqo1PdrTvMwnsQ_9qkU0Op-0U89GeSz55s-8WDxKaok6ou2-E0U2rr93nKG9YIREfxyFj-P1qH4P0XGZpOERjKPIRm4f5QGAZ3WQRTXJtaSWRk",
  },
  {
    id: "2",
    badge: "Limited Edition",
    title: "Lipstick Combo",
    description: "3 Shades of elegance in one box.",
    buttonText: "View Shades",
    buttonStyle: "secondary",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYR9Cx_ccB8jdclpNBxxOtIRFyqNyChvbBQenV4AYrcC67ro5J2mcJKciz2zTWeT4eg-R0Rugix6wdRfp2sZE_FDtJRtyk0-PhWk_7d3Mcey_F5IiNVDtYoTZCsFhpTXCL5-5W9H7_-S2xnMxCQSFfdvQCW_fAoJfRTHCMKUtCUMWj0dcVmUEEHiLS2d_oH6W8WkV53V0HdwRUknnAI6gCSnYC6bMmu4DOtQ8--HBgJwyjkYk3tCBxudM0Mah5XoinGzLDdV6pQEk",
  },
];

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View className="relative mt-2">
      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToInterval={320}
        decelerationRate="fast"
        className="pb-4"
      >
        {HERO_ITEMS.map((item) => (
          <View
            key={item.id}
            className="relative mx-4 h-80 w-72 overflow-hidden rounded-3xl shadow-lg"
          >
            <Image
              source={{ uri: item.image }}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/50" />
            <View className="absolute bottom-0 left-0 right-0 p-6">
              <Text className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-primary">
                {item.badge}
              </Text>
              <Text className="mb-2 text-center text-4xl font-bold text-white font-display">
                {item.title}
              </Text>
              <Text className="mb-6 text-center text-sm font-light text-gray-200">
                {item.description}
              </Text>
              <TouchableOpacity
                className={`w-full rounded-full py-3 ${
                  item.buttonStyle === "primary" ? "bg-primary" : "bg-white"
                }`}
              >
                <Text
                  className={`text-center font-bold ${
                    item.buttonStyle === "primary"
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  {item.buttonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Carousel Indicators */}
      <View className="flex-row justify-center space-x-2">
        {HERO_ITEMS.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === activeIndex
                ? "bg-primary"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
