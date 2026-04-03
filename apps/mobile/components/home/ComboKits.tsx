import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";

interface Kit {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  badge: string;
  image: string;
}

const KITS: Kit[] = [
  {
    id: "1",
    title: "Teen Starter Kit",
    subtitle: "Perfect for beginners",
    price: 1499,
    badge: "Value Set",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEb2pQStV0ALPl6ZWPfTmzXrt4P5tjrZ9OkvxNC3vTupem8OoVyZmvGsSn94VYu677wqDLv7d6k--BOscMyxpr7n62IQXIEzwv54WIbv45W8MQu_A74A52S9muKOoShuUZ2tdsniJFXv9FpywVCmct_2V9BaNPOiqo1PdrTvMwnsQ_9qkU0Op-0U89GeSz55s-8WDxKaok6ou2-E0U2rr93nKG9YIREfxyFj-P1qH4P0XGZpOERjKPIRm4f5QGAZ3WQRTXJtaSWRk",
  },
  {
    id: "2",
    title: "Bridal Starter Kit",
    subtitle: "Your wedding day glow",
    price: 4999,
    badge: "Best Seller",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j8yD9DHW29mHnnddf_ulUuyvgRSlVpd7WOvHqGzyrI2P0WjITqrHksEYsluf9wuc50_DDVGm7Y92OFIc_nh4ul5cddIS7BVPwYwTlDoEjb9WG7JxzXuJiSyB7mOVXnxDVVfoMBthI3A00RrHKxUemB6OauNwcgYlIAcAbA_S4XCU2rs4LPGxRvSHTBzpVo-Cahzif-q28vx9eRzuvD446uP7ykBD_wH5LNioMbgOtU8zIqhyfiYn2KoW_LrhR19GjAnr1vXal40",
  },
  {
    id: "3",
    title: "Office Look Kit",
    subtitle: "Subtle and sophisticated",
    price: 2299,
    badge: "9-to-5 Ready",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCaWD1o8rPaCqIIYQWiyXek5dflUIWwfu6alVBAeo0r6QVpEG7jzDoMw5TpEKblRFcGlCon95s1pf7cP98rOJ8AA0NlzPON01ri8pESYrpFecC0Lzh57MQdB5WqQgBq1GbkWmlHhqtE4KLcrhzJBj7q4f32RqIb3T7MdYVfBy2oz9_aaJrFAMEqrprMWu9KnXAri3Yp_UngO-vqO6Mf2IjfQawRxBe-6Nh_xeZGsgWQYM1Y402abel6RJYRZAoJtfhsrC7BP_W-Bm8",
  },
  {
    id: "4",
    title: "Lipstick Lover Combo",
    subtitle: "All your favorite shades",
    price: 1899,
    badge: "Limited Edition",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYR9Cx_ccB8jdclpNBxxOtIRFyqNyChvbBQenV4AYrcC67ro5J2mcJKciz2zTWeT4eg-R0Rugix6wdRfp2sZE_FDtJRtyk0-PhWk_7d3Mcey_F5IiNVDtYoTZCsFhpTXCL5-5W9H7_-S2xnMxCQSFfdvQCW_fAoJfRTHCMKUtCUMWj0dcVmUEEHiLS2d_oH6W8WkV53V0HdwRUknnAI6gCSnYC6bMmu4DOtQ8--HBgJwyjkYk3tCBxudM0Mah5XoinGzLDdV6pQEk",
  },
];

export function ComboKits() {
  return (
    <View className="border-t border-surface-border bg-surface-dark py-8">
      {/* Header */}
      <View className="mb-6 items-center px-4">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary">
          Better Together
        </Text>
        <Text className="mt-1 text-2xl font-bold font-display text-text-primary">
          Combos & Kits
        </Text>
        <Text className="mt-1 italic text-sm text-text-secondary">
          Save more with our curated sets
        </Text>
      </View>

      {/* Kits Carousel */}
      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {KITS.map((kit) => (
          <View
            key={kit.id}
            className="mr-4 w-64 overflow-hidden rounded-2xl border border-surface-border bg-surface"
          >
            {/* Kit Image */}
            <View className="relative aspect-square">
              <Image
                source={{ uri: kit.image }}
                className="h-full w-full"
                resizeMode="cover"
              />
              <View className="absolute right-3 top-3 rounded-lg bg-primary px-2 py-1">
                <Text className="text-[0.6rem] font-bold uppercase text-background">
                  {kit.badge}
                </Text>
              </View>
            </View>

            {/* Kit Info */}
            <View className="items-center p-4 text-center">
              <Text className="mb-1 text-lg font-bold text-text-primary font-display">
                {kit.title}
              </Text>
              <Text className="mb-3 text-xs text-text-secondary">
                {kit.subtitle}
              </Text>
              <Text className="mb-4 text-base font-bold text-primary">
                ₹ {kit.price.toLocaleString()}
              </Text>
              <TouchableOpacity className="w-full rounded-full border border-primary py-2.5 px-4">
                <Text className="text-center text-sm font-bold text-primary">
                  View Kit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
