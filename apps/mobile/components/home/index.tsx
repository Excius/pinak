import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeroCarousel } from "./HeroCarousel";
import { FeatureRow } from "./FeatureRow";
import { ShopByCategory } from "./ShopByCategory";
import { ShopByNeed } from "./ShopByNeed";
import { BestSellers } from "./BestSellers";
import { ComboKits } from "./ComboKits";
import { BeautyAdvisor } from "./BeautyAdvisor";
import { Testimonials } from "./Testimonials";
import { WhatsAppAndStoreCTA } from "./WhatsAppCTA";

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        scrollToOverflowEnabled={true}
      >
        {/* Hero Section */}
        <HeroCarousel />

        {/* Features Row */}
        <FeatureRow />

        {/* Shop by Category */}
        <ShopByCategory />

        {/* Shop by Need */}
        <ShopByNeed />

        {/* Best Sellers */}
        <BestSellers />

        {/* Combo Kits */}
        <ComboKits />

        {/* Beauty Advisor Quiz */}
        <BeautyAdvisor />

        {/* Testimonials */}
        <Testimonials />

        {/* WhatsApp CTA */}
        <WhatsAppAndStoreCTA />

        {/* Spacer for bottom nav */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
