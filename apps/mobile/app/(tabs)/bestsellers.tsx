import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

import { ProductCard } from "@/components/products/ProductCard";
import { getBestSellers } from "@/services/product.service";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/use-wishlist";
import { mapProductsToCardItems } from "@/utils/mappers/product.mapper";

const PAGE_SIZE = 8;

export default function BestSellersPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { itemIdsByVariantId, loadingVariantId, toggleWishlist } =
    useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBestSellers = async (pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBestSellers(pageNumber, PAGE_SIZE, "all_time");
      const mappedProducts = mapProductsToCardItems(response.data.items as any);
      const pagination = response.data.pagination ?? {};
      const resolvedTotal = pagination.total ?? mappedProducts.length;
      const resolvedTotalPages =
        pagination.totalPages ??
        Math.max(1, Math.ceil(resolvedTotal / PAGE_SIZE));

      setProducts(mappedProducts);
      setPage(pagination.page ?? pageNumber);
      setTotalPages(resolvedTotalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load best sellers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBestSellers(1);
  }, []);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [];

    if (page <= 3) {
      pages.push(1, 2, 3, "ellipsis-end", totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(
        1,
        "ellipsis-start",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      pages.push(
        1,
        "ellipsis-start",
        page - 1,
        page,
        page + 1,
        "ellipsis-end",
        totalPages,
      );
    }

    return pages;
  }, [page, totalPages]);

  const handleProductPress = (productId: string) => {
    router.push(`/(tabs)/product/${productId}` as never);
  };

  const handleAddToCart = (product: {
    canAddToCart?: boolean;
    variantId?: string;
  }) => {
    if (product.canAddToCart && product.variantId) {
      void addToCart(product.variantId, undefined, 1);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    void fetchBestSellers(nextPage);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-background"
    >
      <View className="px-5 pb-3 pt-1">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-3 items-start"
          hitSlop={10}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#C9A962" />
        </TouchableOpacity>

        <View className="flex-row items-end justify-between gap-3">
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Customer favorites
            </Text>
            <Text className="mt-1 text-3xl font-bold font-display text-text-primary">
              Best Sellers
            </Text>
          </View>

          {totalPages > 1 && (
            <View className="rounded-full border border-primary/20 bg-primary/5 px-3 py-2">
              <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Page {page}/{totalPages}
              </Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#C9A962" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-error">{error}</Text>
          <TouchableOpacity
            onPress={() => void fetchBestSellers(1)}
            className="mt-4 rounded-full bg-primary px-4 py-2"
          >
            <Text className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            data={products}
            renderItem={({ item }) => (
              <View className="w-1/2 p-2">
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item.id)}
                  onAddToCart={() => handleAddToCart(item)}
                  onWishlistToggle={() => {
                    if (item.variantId && isAuthenticated) {
                      void toggleWishlist(item.variantId);
                    }
                  }}
                  isFavorite={Boolean(
                    item.variantId && itemIdsByVariantId[item.variantId],
                  )}
                  isWishlistLoading={loadingVariantId === item.variantId}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
          />

          {totalPages > 1 && (
            <View className="border-t border-surface-border bg-surface px-4 py-4 pb-8">
              <View className="flex-row items-center justify-center gap-2">
                <TouchableOpacity
                  disabled={page === 1}
                  onPress={() => handlePageChange(page - 1)}
                  className="px-3 py-2"
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={20}
                    color={page === 1 ? "#8A8A8A" : "#C9A962"}
                  />
                </TouchableOpacity>

                {pageNumbers.map((pageNumber, index) => {
                  if (
                    pageNumber === "ellipsis-start" ||
                    pageNumber === "ellipsis-end"
                  ) {
                    return (
                      <Text
                        key={`${pageNumber}-${index}`}
                        className="px-1 text-base text-text-muted"
                      >
                        ...
                      </Text>
                    );
                  }

                  const isSelected = pageNumber === page;

                  return (
                    <TouchableOpacity
                      key={`page-${pageNumber}`}
                      onPress={() => handlePageChange(pageNumber)}
                      className={`h-9 min-w-[2.25rem] items-center justify-center rounded-full px-2 ${
                        isSelected ? "bg-primary" : "bg-surface-light"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? "text-background" : "text-text-primary"
                        }`}
                      >
                        {pageNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  disabled={page === totalPages}
                  onPress={() => handlePageChange(page + 1)}
                  className="px-3 py-2"
                >
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={page === totalPages ? "#8A8A8A" : "#C9A962"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
