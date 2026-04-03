import { View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  badge?: "Bestseller" | "New Arrival";
}

// Mock product data - replace with API call later
const PRODUCTS: Record<string, Product[]> = {
  lips: [
    {
      id: "1",
      title: "Velvet Matte - Rose Dusk",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBs0zpuKMThK_EarnJ1bIhyS9izmMge3UMyCooVksF_2Nw3gVX2Z_k3A2xvnmFiTZdMLpjye2VQiSB9Zu5ec0WD2VNBUwWpOmNANsSyGkBN1NuRaAugjVw55umHnGNOtex8_09c_oiIQoZ53VTJvys9O725d800ybV9LUkXHDLOjnS9fgoLHnqNtLA_sfa_QgUTsH3vqFtpjzhb7X2HWK2XPfODeDmh-PLmtQKa3x3xAhInBPV4BKWchLqtdVPLF7X92xQ86pHWJo0",
      rating: 4.5,
      reviews: 128,
      price: 950,
      originalPrice: 1250,
      badge: "Bestseller",
    },
    {
      id: "2",
      title: "Gilded Glaze Lip Oil",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBT-FngQeG3cfhLaAI1GhSafirIj9naEAvrxoidqmhLxOQShcWm-Bts2bpoc8nNdhmhkxZuKadwc2CDXBYBctwsy5v28knTYCgwCSUshMAyJuV0obRtXZsgCeqzbQVTzwhLeBfjFuctAcDgbDQ_XGjAAJs2YjtOTMYOeM7NmB14SsQ136RELNiIgo7elj9D7xGD2dbMGI3sX7yf3R-rQin2omN7OQZP4WKdNZJXQCRiuwc9-jMIZUFoas_Q2u1jU69qfa6UBVsmBYo",
      rating: 5,
      reviews: 42,
      price: 1100,
      badge: "New Arrival",
    },
    {
      id: "3",
      title: "Satin Silk - Berry Wine",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD_8AwurHU8WngpRX8DXWMNQihckqHwvF0gC2MKNtFlB08pWTk9Jm8DahEp0yQB0xL5-VK7JwvVPD6FCYzg0MXche_9MacdJFOeRzSvqELCU2D_Ole-7ArFDHUcp13VAHpuyrGkG1XrFUOvKW23nfF78FDCIZn9usOYyLCbrzxbjam_APYn9pzHAAlKJt2_1M7-wPhWLvRAWQKmupUH67Y-qnVi493dPKoZ2XwEetkXBiGq1S6t5Ojxl7a6C3wHMxSilbH78ONKjSI",
      rating: 4,
      reviews: 86,
      price: 850,
    },
    {
      id: "4",
      title: "Hydrating Nude - Petal",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBwhS_bBMqab8cJLGh0B7sZpi3qJw3e5Q89tDfG1sBm9kK4XKbf1jhhH-ZfOqfiQV6CUiuBCRs4IwYwZhJDeXoqXbZrnMUXpLdnQGr0qWJHQ0F5IHA0Qd16P7fOcn-VGfPP-9_QCpCf7V5T_47B8s9LfiNXdaVbnTZB5BPHl6Edjg5tZ9P1IExUM3-N0zVtoztJ--KIdpBodxFooNh2odJ9EBz__rP5jwhXZSiTsYIS-FaUyvkavm2DVKB3MirNTtX5_cwCCviavQs",
      rating: 5,
      reviews: 215,
      price: 950,
      badge: "Bestseller",
    },
  ],
  eyes: [
    {
      id: "5",
      title: "Shimmer Soul - Golden Hour",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBs0zpuKMThK_EarnJ1bIhyS9izmMge3UMyCooVksF_2Nw3gVX2Z_k3A2xvnmFiTZdMLpjye2VQiSB9Zu5ec0WD2VNBUwWpOmNANsSyGkBN1NuRaAugjVw55umHnGNOtex8_09c_oiIQoZ53VTJvys9O725d800ybV9LUkXHDLOjnS9fgoLHnqNtLA_sfa_QgUTsH3vqFtpjzhb7X2HWK2XPfODeDmh-PLmtQKa3x3xAhInBPV4BKWchLqtdVPLF7X92xQ86pHWJo0",
      rating: 4.5,
      reviews: 92,
      price: 750,
      originalPrice: 900,
    },
  ],
  face: [
    {
      id: "10",
      title: "Glow Setter - Radiant Finish",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBs0zpuKMThK_EarnJ1bIhyS9izmMge3UMyCooVksF_2Nw3gVX2Z_k3A2xvnmFiTZdMLpjye2VQiSB9Zu5ec0WD2VNBUwWpOmNANsSyGkBN1NuRaAugjVw55umHnGNOtex8_09c_oiIQoZ53VTJvys9O725d800ybV9LUkXHDLOjnS9fgoLHnqNtLA_sfa_QgUTsH3vqFtpjzhb7X2HWK2XPfODeDmh-PLmtQKa3x3xAhInBPV4BKWchLqtdVPLF7X92xQ86pHWJo0",
      rating: 4.5,
      reviews: 156,
      price: 650,
    },
  ],
  skincare: [
    {
      id: "20",
      title: "Hydra Serum - Intense Moisture",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBs0zpuKMThK_EarnJ1bIhyS9izmMge3UMyCooVksF_2Nw3gVX2Z_k3A2xvnmFiTZdMLpjye2VQiSB9Zu5ec0WD2VNBUwWpOmNANsSyGkBN1NuRaAugjVw55umHnGNOtex8_09c_oiIQoZ53VTJvys9O725d800ybV9LUkXHDLOjnS9fgoLHnqNtLA_sfa_QgUTsH3vqFtpjzhb7X2HWK2XPfODeDmh-PLmtQKa3x3xAhInBPV4BKWchLqtdVPLF7X92xQ86pHWJo0",
      rating: 4.5,
      reviews: 178,
      price: 1200,
    },
  ],
};

interface ProductGridProps {
  categoryId: string;
}

export function ProductGrid({ categoryId }: ProductGridProps) {
  const router = useRouter();
  const products = PRODUCTS[categoryId] || [];

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/product/${productId}`);
  };

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View className="w-1/2 p-2">
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item.id)}
          />
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 40 }}
    />
  );
}
