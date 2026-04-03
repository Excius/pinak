import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");

// Shade options for lip products
const SHADE_OPTIONS = [
  { id: "1", name: "Rose Dusk", color: "#8a3324" },
  { id: "2", name: "Warm Honey", color: "#a35d50" },
  { id: "3", name: "Berry Wine", color: "#5c2a26" },
  { id: "4", name: "Nude Petal", color: "#d98b7a" },
  { id: "5", name: "Deep Plum", color: "#7a2c2c" },
];

// Mock product data
const MOCK_PRODUCTS: Record<
  string,
  {
    id: string;
    title: string;
    subtitle: string;
    category: string;
    description: string;
    promise: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    textureImage?: string;
    badge?: string;
    inStock: boolean;
    features: { icon: string; label: string }[];
    ingredients: string[];
    howToUse: string[];
    shippingInfo: string;
    hasShades?: boolean;
  }
> = {
  "1": {
    id: "1",
    title: "Velvet Matte Liquid Lipstick",
    subtitle: "Rose Dusk",
    category: "Lips Collection",
    description:
      "A weightless, high-pigment liquid lipstick that delivers bold, transfer-proof color with a luxurious velvet finish. Infused with botanical extracts for all-day comfort.",
    promise:
      "Crafted with botanical extracts and crushed minerals, our Velvet Matte range is designed not just to color, but to nourish. We believe luxury beauty should be a sensory indulgence that respects both your skin and the planet.",
    price: 950,
    originalPrice: 1250,
    rating: 4.5,
    reviews: 128,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0Nc2MWr1ulNWzbjT0Ty_jDwCZK_2BXyiT1udrvfWjnziWtLsepT1Nu-Y374GzedzjHn_oHho6WBwSZxpaUeQvcezSl58dnBYZxQYSBY2kFxaH4ZZrBxlljfN1GKEIZYjglYmKYYDIRlJ7ybMPIechRzSr_pJ_kLou8leqahs-fLTpUJ9jqe8khQpMLqyd_-QcXhBBs0be_n_QJfc-wnaovoQj4gfuKOLUMgTjMhm09jZ4LqVK_axDOh2rVmXSVL478GKZBPxZy44",
    textureImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBafrtG88ulShNGwoVbMLUk-J5qw-lElg_gShUgpIANcPLlLA2HkPmjtp4jbcBlWFbBJeZyZegAsqwTT9iTLOVZMSdEQvaYZxSH7pglrWi18d5e-C3aI56uG2tGAuBs7FSuOAAumzKfrZFPCBm-4-uT1LV-vokZ9HERf85sjiEC9xL9HZzXNvrmJhvr-bttO3VgZXNpNA80ggyutLAh5Jbyw7spG_T6cZ7Ac3jcxtfx9CuElziCK09gEennwtYtOD3Jc_gXzQSS3-E",
    badge: "Bestseller",
    inStock: true,
    hasShades: true,
    features: [
      { icon: "clock-outline", label: "12-Hour Wear" },
      { icon: "water-outline", label: "Hydrating" },
      { icon: "leaf", label: "Cruelty-Free" },
      { icon: "shield-check-outline", label: "Derm-Tested" },
    ],
    ingredients: [
      "Isododecane - Smooth application",
      "Dimethicone - Silky texture",
      "Saffron Flower Extract - Nourishment",
      "Vitamin E - Antioxidant protection",
      "Pure Mineral Pigments - Rich color",
    ],
    howToUse: [
      "Exfoliate lips for a smooth canvas",
      "Apply a thin layer starting from the center",
      "Allow 30 seconds to set for smudge-proof finish",
      "Build up for more intense color",
    ],
    shippingInfo:
      "Free shipping on orders above ₹999. Delivery within 3-5 business days. Easy 7-day returns.",
  },
  "2": {
    id: "2",
    title: "Gilded Glaze Lip Oil",
    subtitle: "Golden Hour",
    category: "Lips Collection",
    description:
      "A nourishing lip oil with a beautiful gilded finish. Infused with vitamin E and jojoba oil to keep lips soft, hydrated, and luminous all day.",
    promise:
      "Our Gilded Glaze formula combines the best of skincare and makeup. Enriched with golden seaweed extract, it provides deep hydration while delivering a stunning, glossy finish.",
    price: 1100,
    rating: 5,
    reviews: 42,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBT-FngQeG3cfhLaAI1GhSafirIj9naEAvrxoidqmhLxOQShcWm-Bts2bpoc8nNdhmhkxZuKadwc2CDXBYBctwsy5v28knTYCgwCSUshMAyJuV0obRtXZsgCeqzbQVTzwhLeBfjFuctAcDgbDQ_XGjAAJs2YjtOTMYOeM7NmB14SsQ136RELNiIgo7elj9D7xGD2dbMGI3sX7yf3R-rQin2omN7OQZP4WKdNZJXQCRiuwc9-jMIZUFoas_Q2u1jU69qfa6UBVsmBYo",
    badge: "New Arrival",
    inStock: true,
    hasShades: false,
    features: [
      { icon: "water", label: "Hydrating" },
      { icon: "white-balance-sunny", label: "Natural Glow" },
      { icon: "leaf", label: "Vegan" },
      { icon: "shield-check-outline", label: "Paraben-Free" },
    ],
    ingredients: [
      "Jojoba Oil - Deep moisture",
      "Vitamin E - Healing & protection",
      "Golden Seaweed Extract - Luminosity",
      "Castor Oil - Nourishment",
    ],
    howToUse: [
      "Apply directly to lips using the applicator",
      "Glide from center outwards for even coverage",
      "Reapply as needed for extra shine",
    ],
    shippingInfo:
      "Free shipping on orders above ₹999. Delivery within 3-5 business days. Easy 7-day returns.",
  },
  "3": {
    id: "3",
    title: "Satin Silk Lipstick",
    subtitle: "Berry Wine",
    category: "Lips Collection",
    description:
      "A sophisticated satin finish lipstick in a rich berry wine shade. Perfect for evening occasions and special events with buildable coverage.",
    promise:
      "Each shade is inspired by the rich cultural palette of India. Our Satin Silk formula glides effortlessly, leaving a luxurious, moisturizing finish.",
    price: 850,
    rating: 4,
    reviews: 86,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_8AwurHU8WngpRX8DXWMNQihckqHwvF0gC2MKNtFlB08pWTk9Jm8DahEp0yQB0xL5-VK7JwvVPD6FCYzg0MXche_9MacdJFOeRzSvqELCU2D_Ole-7ArFDHUcp13VAHpuyrGkG1XrFUOvKW23nfF78FDCIZn9usOYyLCbrzxbjam_APYn9pzHAAlKJt2_1M7-wPhWLvRAWQKmupUH67Y-qnVi493dPKoZ2XwEetkXBiGq1S6t5Ojxl7a6C3wHMxSilbH78ONKjSI",
    inStock: true,
    hasShades: true,
    features: [
      { icon: "shimmer", label: "Satin Finish" },
      { icon: "layers-outline", label: "Buildable" },
      { icon: "water-outline", label: "Moisturizing" },
      { icon: "gift-outline", label: "Luxury Pack" },
    ],
    ingredients: [
      "Shea Butter - Deep hydration",
      "Beeswax - Smooth texture",
      "Vitamin E - Antioxidant",
      "Natural Pigments - Rich color",
    ],
    howToUse: [
      "Apply directly from the bullet",
      "Start from center and blend outward",
      "Layer for more intensity",
    ],
    shippingInfo:
      "Free shipping on orders above ₹999. Delivery within 3-5 business days. Easy 7-day returns.",
  },
  "4": {
    id: "4",
    title: "Hydrating Nude Lipstick",
    subtitle: "Petal",
    category: "Lips Collection",
    description:
      "A beautiful nude shade with hydrating properties. The perfect everyday lipstick for a natural, polished look that lasts.",
    promise:
      "Our Hydrating Nude range celebrates natural beauty. Formulated with hyaluronic acid, it keeps lips plump and moisturized while delivering effortless elegance.",
    price: 950,
    rating: 5,
    reviews: 215,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwhS_bBMqab8cJLGh0B7sZpi3qJw3e5Q89tDfG1sBm9kK4XKbf1jhhH-ZfOqfiQV6CUiuBCRs4IwYwZhJDeXoqXbZrnMUXpLdnQGr0qWJHQ0F5IHA0Qd16P7fOcn-VGfPP-9_QCpCf7V5T_47B8s9LfiNXdaVbnTZB5BPHl6Edjg5tZ9P1IExUM3-N0zVtoztJ--KIdpBodxFooNh2odJ9EBz__rP5jwhXZSiTsYIS-FaUyvkavm2DVKB3MirNTtX5_cwCCviavQs",
    badge: "Bestseller",
    inStock: true,
    hasShades: true,
    features: [
      { icon: "water", label: "All-Day Hydration" },
      { icon: "palette-outline", label: "Universal Shade" },
      { icon: "feather", label: "Lightweight" },
      { icon: "leaf", label: "Natural" },
    ],
    ingredients: [
      "Hyaluronic Acid - Plumping",
      "Coconut Oil - Nourishment",
      "Shea Butter - Moisture lock",
      "Natural Minerals - Subtle color",
    ],
    howToUse: [
      "Apply to clean, moisturized lips",
      "Use a lip liner for definition",
      "Apply lipstick starting from center",
      "Blot for a matte finish or leave glossy",
    ],
    shippingInfo:
      "Free shipping on orders above ₹999. Delivery within 3-5 business days. Easy 7-day returns.",
  },
};

// Recommended products
const RECOMMENDATIONS = [
  {
    id: "r1",
    title: "Precision Lip Definer",
    category: "Liner",
    price: 650,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_iGiaAHtIh0qTs4mgD_TLoby947iLZZHs8OylgJxln_6FnzsemkIriXNFQQg4cImNizDdlcMjyCAMD-QJhfSn_BRyuscZXphDdEdeiVgH5WOwN9TRZtwGTUuwVHOARpTubjAq8f1VeH5szFp_0rS8ReDGdqydN8leHeurtZVmTid_FKmZdu8cSynxVxnbv_xFy3FswA1wlPwPJUvIKZ9j9GWmzcZLBKWt1L0ftjiHmKp9mwJIU0nAe8I37s1M0vg8G4rSH3sWNsI",
  },
  {
    id: "r2",
    title: "Radiance Serum",
    category: "Skincare",
    price: 2400,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCajdNpFxh2vWwnDeykeOajRRtgV-v8fhs0vRYnaQGhk2KXcTQ0d3cErTlboa9Tr0mutCcqpXCdaAA_jY0x9sknrkVw0XqVaWZKyMWZZ6DApZZVUdMOKwGlpVY0CscGJY1ev1Eeh6SQF6cFwb7Dct9AhpuQaTODrUSlcLkeYgDpbnjb0YVESObfEC3JtkP0QvdZtuZ6IgkEn03K6Jd3V8WlPbsu6Hdo7yttx8XUQccuaV-uaip0kwfQSOX2mqjLSmSLZTvXTllNkjs",
  },
  {
    id: "r3",
    title: "Silk Cleanser",
    category: "Skincare",
    price: 1200,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAM78MdybyTJcT41MvYQHi7_HF-hk8dorIx9JelIBMvI1mh_AmPmuln7PrLLudTy19tfxzUuQnTDss_qcJV5t1rxIlyXcc8n8Gpq21QvYNcSfWO8mfFKgsDAhojUoOzBalaaHDeeIubmw0fxt3gqe4oIiUJ_bxGrMEF8qYfM1Tq_lIrMaA1DRK8xuJbpeZbwTuUO3_OSgzmxiEn00fnIM09RCTRmBc1-eep8RTbIdAV527STZzxVMrNi-kj3k1vz32IOaU1m3f-2-Q",
  },
];

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [selectedShade, setSelectedShade] = useState(SHADE_OPTIONS[0]);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "promise",
  );
  const [isFavorite, setIsFavorite] = useState(false);

  const product = MOCK_PRODUCTS[String(productId)] || MOCK_PRODUCTS["1"];

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`full-${i}`}
          name="star"
          size={16}
          color="#C9A962"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons
          key="half"
          name="star-half-full"
          size={16}
          color="#C9A962"
        />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#C9A962"
        />,
      );
    }

    return stars;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-background/90 border-b border-primary/10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#C9A962" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold tracking-wider text-primary font-display">
          PINAK
        </Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="p-2">
            <MaterialCommunityIcons name="magnify" size={24} color="#B8B8B8" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 relative">
            <MaterialCommunityIcons
              name="shopping-outline"
              size={24}
              color="#B8B8B8"
            />
            <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Image Gallery */}
        <View className="relative aspect-[4/5] w-full bg-surface">
          <Image
            source={{ uri: product.image }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Texture Preview Overlay */}
          {product.textureImage && (
            <View className="absolute bottom-6 right-6 w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl">
              <Image
                source={{ uri: product.textureImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Badge */}
          {product.badge && (
            <View className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-full">
              <Text className="text-xs font-bold text-background uppercase tracking-wider">
                {product.badge}
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/80 items-center justify-center"
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : "#B8B8B8"}
            />
          </TouchableOpacity>

          {/* Carousel Indicators */}
          <View className="absolute bottom-6 left-1/2 -translate-x-1/2 flex-row gap-2">
            <View className="w-8 h-1 rounded-full bg-primary" />
            <View className="w-2 h-1 rounded-full bg-primary/30" />
            <View className="w-2 h-1 rounded-full bg-primary/30" />
          </View>
        </View>

        {/* Product Info Section */}
        <View className="px-6 pt-6">
          {/* Category & Rating Row */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xs uppercase tracking-widest text-primary font-bold">
              {product.category}
            </Text>
            <View className="flex-row items-center gap-1">
              <View className="flex-row">{renderStars(product.rating)}</View>
              <Text className="text-xs text-text-secondary ml-1">
                ({product.reviews})
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-text-primary font-display leading-tight mb-1">
            {product.title}
          </Text>

          {/* Subtitle */}
          {product.subtitle && (
            <Text className="text-lg text-text-secondary italic mb-4">
              {product.subtitle}
            </Text>
          )}

          {/* Price Row */}
          <View className="flex-row items-baseline gap-3 mb-6">
            <Text className="text-2xl font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </Text>
            {product.originalPrice && (
              <>
                <Text className="text-lg text-text-muted line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </Text>
                <View className="bg-primary/20 px-2 py-1 rounded">
                  <Text className="text-primary text-xs font-bold">
                    {discountPercent}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <Text className="text-text-secondary leading-relaxed italic mb-6">
            {product.description}
          </Text>
        </View>

        {/* Shade Selector */}
        {product.hasShades && (
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-end mb-4">
              <Text className="text-sm font-bold uppercase tracking-widest text-text-primary">
                Select Shade
              </Text>
              <Text className="text-xs text-primary italic">
                Shade: {selectedShade.name}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {SHADE_OPTIONS.map((shade) => (
                <TouchableOpacity
                  key={shade.id}
                  onPress={() => setSelectedShade(shade)}
                  className="mr-4"
                >
                  <View
                    className={`w-12 h-12 rounded-full ${
                      selectedShade.id === shade.id
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "border border-surface-border"
                    }`}
                    style={{
                      backgroundColor: shade.color,
                      ...(selectedShade.id === shade.id && {
                        shadowColor: "#C9A962",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 4,
                      }),
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Key Features Grid */}
        <View className="px-6 py-6 border-y border-primary/10">
          <View className="flex-row flex-wrap gap-3">
            {product.features.map((feature, index) => (
              <View
                key={index}
                className="flex-1 min-w-[45%] flex-row items-center gap-3 p-3 bg-surface rounded-xl border border-surface-border"
              >
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <MaterialCommunityIcons
                    name={feature.icon as any}
                    size={20}
                    color="#C9A962"
                  />
                </View>
                <Text className="text-xs font-bold uppercase tracking-tight text-text-primary flex-1">
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* The Pinak Promise */}
        <View className="mx-6 my-8 bg-surface rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
          <View className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <View className="flex-row items-center gap-2 mb-4">
            <MaterialCommunityIcons
              name="shield-star-outline"
              size={24}
              color="#C9A962"
            />
            <Text className="text-xl font-bold text-primary font-display italic">
              The Pinak Promise
            </Text>
          </View>
          <Text className="text-sm leading-relaxed text-text-secondary">
            {product.promise}
          </Text>
          <View className="mt-4 flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="check-decagram"
              size={16}
              color="#C9A962"
            />
            <Text className="text-[10px] uppercase tracking-widest font-bold text-primary">
              Dermatologically Approved
            </Text>
          </View>
        </View>

        {/* Accordion Sections */}
        <View className="px-6 space-y-0">
          {/* Ingredients */}
          <TouchableOpacity
            onPress={() => toggleSection("ingredients")}
            className="flex-row justify-between items-center py-4 border-b border-primary/10"
          >
            <Text className="text-base font-bold uppercase tracking-widest text-text-primary">
              Ingredients
            </Text>
            <MaterialCommunityIcons
              name={expandedSection === "ingredients" ? "minus" : "plus"}
              size={22}
              color="#C9A962"
            />
          </TouchableOpacity>
          {expandedSection === "ingredients" && (
            <View className="py-4 border-b border-primary/10">
              {product.ingredients.map((ingredient, index) => (
                <View key={index} className="flex-row items-start gap-2 mb-2">
                  <MaterialCommunityIcons
                    name="circle-small"
                    size={20}
                    color="#C9A962"
                  />
                  <Text className="text-sm text-text-secondary flex-1">
                    {ingredient}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* How to Use */}
          <TouchableOpacity
            onPress={() => toggleSection("howToUse")}
            className="flex-row justify-between items-center py-4 border-b border-primary/10"
          >
            <Text className="text-base font-bold uppercase tracking-widest text-text-primary">
              How to Use
            </Text>
            <MaterialCommunityIcons
              name={expandedSection === "howToUse" ? "minus" : "plus"}
              size={22}
              color="#C9A962"
            />
          </TouchableOpacity>
          {expandedSection === "howToUse" && (
            <View className="py-4 border-b border-primary/10">
              {product.howToUse.map((step, index) => (
                <View key={index} className="flex-row items-start gap-3 mb-3">
                  <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                    <Text className="text-xs font-bold text-primary">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="text-sm text-text-secondary flex-1">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Shipping & Returns */}
          <TouchableOpacity
            onPress={() => toggleSection("shipping")}
            className="flex-row justify-between items-center py-4 border-b border-primary/10"
          >
            <Text className="text-base font-bold uppercase tracking-widest text-text-primary">
              Shipping & Returns
            </Text>
            <MaterialCommunityIcons
              name={expandedSection === "shipping" ? "minus" : "plus"}
              size={22}
              color="#C9A962"
            />
          </TouchableOpacity>
          {expandedSection === "shipping" && (
            <View className="py-4 border-b border-primary/10">
              <Text className="text-sm text-text-secondary leading-relaxed">
                {product.shippingInfo}
              </Text>
            </View>
          )}
        </View>

        {/* Pairs Well With */}
        <View className="px-6 py-8 mt-4 bg-surface/50">
          <Text className="text-xl font-bold text-text-primary font-display mb-6">
            Pairs well with
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {RECOMMENDATIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="mr-4 w-40 bg-surface rounded-xl p-3 border border-surface-border"
              >
                <View className="aspect-square rounded-lg mb-3 overflow-hidden bg-background">
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <Text className="text-xs font-bold text-text-secondary uppercase mb-1">
                  {item.category}
                </Text>
                <Text
                  className="text-sm font-bold text-text-primary mb-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-sm font-bold text-primary">
                  ₹{item.price.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Sticky Footer CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-primary/20 px-6 py-4">
        <SafeAreaView edges={["bottom"]}>
          <View className="flex-row gap-4 items-center">
            {/* Favorite Button */}
            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              className="w-14 h-14 border-2 border-primary/30 rounded-xl items-center justify-center"
            >
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color="#C9A962"
              />
            </TouchableOpacity>

            {/* Add to Bag Button */}
            <TouchableOpacity className="flex-1 h-14 bg-primary rounded-xl flex-row items-center justify-center gap-3 shadow-lg">
              <MaterialCommunityIcons
                name="shopping-outline"
                size={20}
                color="#0A0A0A"
              />
              <Text className="font-bold text-background text-base">
                Add to Bag
              </Text>
              <View className="w-px h-6 bg-background/20" />
              <Text className="font-bold text-background">
                ₹{product.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}
