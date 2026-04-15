import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { getProductById } from "@/services/product.service";
import type { ProductApi } from "@repo/types";
import { mapProductDetailImage } from "@/utils/mappers/product.mapper";

type ProductDetail = ProductApi.ResponseTypes["GetProductById"]["data"];
type ProductVariant = ProductDetail["variants"][number];

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError("Invalid product.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getProductById(String(productId));
        setProduct(response.data);

        const activeVariant =
          response.data.variants.find((variant) => variant.isActive) ||
          response.data.variants[0] ||
          null;

        setSelectedVariantId(activeVariant ? activeVariant.id : null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product details right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedVariantId) {
      return null;
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ||
      null
    );
  }, [product, selectedVariantId]);

  const primaryImage = useMemo(() => {
    if (!product) {
      return null;
    }
    return mapProductDetailImage(product, selectedVariant);
  }, [product, selectedVariant]);

  const variantPrice = selectedVariant?.price || 0;
  const compareAtPrice =
    selectedVariant?.compareAtPrice &&
    selectedVariant.compareAtPrice > variantPrice
      ? selectedVariant.compareAtPrice
      : null;

  const discountPercent = compareAtPrice
    ? Math.round(((compareAtPrice - variantPrice) / compareAtPrice) * 100)
    : 0;

  const categoryLabel = product?.categories[0]?.name || "Product";
  const brandLabel = product?.brand?.name || "Pinak";

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <View className="flex-1 px-6 py-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface items-center justify-center mb-4"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#C9A962"
            />
          </TouchableOpacity>
          <Text className="text-sm text-text-secondary">
            {error || "Unable to load product."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="relative aspect-[4/5] w-full bg-surface">
          <Image
            source={{ uri: primaryImage || undefined }}
            className="w-full h-full"
            resizeMode="cover"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/75 items-center justify-center"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color="#C9A962" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/75 items-center justify-center"
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#EF4444" : "#B8B8B8"}
            />
          </TouchableOpacity>
        </View>

        <View className="px-6 pt-6">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-xs uppercase tracking-widest text-primary font-bold">
              {categoryLabel}
            </Text>
            <Text className="text-xs text-text-secondary">{brandLabel}</Text>
          </View>

          <Text className="text-3xl font-bold text-text-primary font-display leading-tight mb-4">
            {product.name}
          </Text>

          <View className="flex-row items-baseline gap-3 mb-5">
            <Text className="text-2xl font-bold text-primary">
              Rs. {variantPrice.toLocaleString()}
            </Text>
            {compareAtPrice ? (
              <>
                <Text className="text-lg text-text-muted line-through">
                  Rs. {compareAtPrice.toLocaleString()}
                </Text>
                <View className="bg-primary/20 px-2 py-1 rounded">
                  <Text className="text-primary text-xs font-bold">
                    {discountPercent}% OFF
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {product.description ? (
            <Text className="text-text-secondary leading-relaxed italic mb-6">
              {product.description}
            </Text>
          ) : null}

          {product.variants.length > 0 ? (
            <View className="mb-8">
              <View className="flex-row justify-between items-end mb-4">
                <Text className="text-sm font-bold uppercase tracking-widest text-text-primary">
                  Choose Variant
                </Text>
                <Text className="text-xs text-primary italic">
                  {product.variants.length} options
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.variants.map((variant: ProductVariant) => {
                  const isSelected = selectedVariantId === variant.id;
                  const variantImage =
                    variant.image?.url || product.frontImageUrl || undefined;

                  return (
                    <TouchableOpacity
                      key={variant.id}
                      onPress={() => setSelectedVariantId(variant.id)}
                      className="mr-3 w-28"
                    >
                      <View
                        className={`rounded-xl border p-2 ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-surface-border bg-surface"
                        }`}
                      >
                        <View className="h-20 w-full rounded-lg overflow-hidden bg-background mb-2">
                          {variantImage ? (
                            <Image
                              source={{ uri: variantImage }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          ) : null}
                        </View>
                        <Text
                          className="text-xs font-semibold text-text-primary"
                          numberOfLines={1}
                        >
                          Rs. {variant.price.toLocaleString()}
                        </Text>
                        <Text
                          className="text-[10px] text-text-secondary"
                          numberOfLines={1}
                        >
                          {variant.stock > 0
                            ? `${variant.stock} in stock`
                            : "Out of stock"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <View className="py-5 border-y border-primary/10">
            <Text className="text-sm font-bold uppercase tracking-widest text-text-primary mb-3">
              Product Insights
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="px-3 py-2 rounded-lg bg-surface border border-surface-border">
                <Text className="text-xs text-text-secondary">Views</Text>
                <Text className="text-sm font-bold text-text-primary">
                  {product.viewCount}
                </Text>
              </View>
              <View className="px-3 py-2 rounded-lg bg-surface border border-surface-border">
                <Text className="text-xs text-text-secondary">Bought</Text>
                <Text className="text-sm font-bold text-text-primary">
                  {product.purchasedCount}
                </Text>
              </View>
              <View className="px-3 py-2 rounded-lg bg-surface border border-surface-border">
                <Text className="text-xs text-text-secondary">Status</Text>
                <Text className="text-sm font-bold text-text-primary">
                  {product.isActive ? "Active" : "Unavailable"}
                </Text>
              </View>
            </View>
          </View>

          {product.keyIngredients ? (
            <View className="py-6 border-b border-primary/10">
              <Text className="text-base font-bold uppercase tracking-widest text-text-primary mb-2">
                Key Ingredients
              </Text>
              <Text className="text-sm text-text-secondary leading-relaxed">
                {product.keyIngredients}
              </Text>
            </View>
          ) : null}

          <View className="py-6">
            <Text className="text-base font-bold uppercase tracking-widest text-text-primary mb-2">
              Pairs well with
            </Text>
            <Text className="text-sm text-text-secondary">Coming soon.</Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-primary/20 px-6 py-4">
        <SafeAreaView edges={["bottom"]}>
          <View className="flex-row gap-4 items-center">
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
                Rs. {variantPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}
