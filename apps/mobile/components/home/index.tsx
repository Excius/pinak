import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandHeader } from "./BrandHeader";
import { HeroCarousel } from "./HeroCarousel";
import { FeatureRow } from "./FeatureRow";
import { ShopByCategory } from "./ShopByCategory";
import { ShopByNeed } from "./ShopByNeed";
import { BestSellers } from "./BestSellers";
import { ComboKits } from "./ComboKits";
import { BeautyAdvisor } from "./BeautyAdvisor";
import { Testimonials } from "./Testimonials";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { BottomNavigation } from "./BottomNavigation";

export function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background-light\">
      <BrandHeader />

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
        <WhatsAppCTA />

        {/* Spacer for bottom nav */}
        <View className="h-20" />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
}
