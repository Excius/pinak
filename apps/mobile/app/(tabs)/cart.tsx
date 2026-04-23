import React, { useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCart } from "@/hooks/use-cart";
import {
  CartItemCard,
  CartSummary,
  EmptyCart,
} from "@/components/cart/exports";

const BOTTOM_NAV_HEIGHT = 72;

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCart();
  const insets = useSafeAreaInsets();
  const bottomOffset = BOTTOM_NAV_HEIGHT + insets.bottom;

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    await updateItem(itemId, quantity);
  };

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleCheckout = () => {
    router.push("/checkout" as never);
  };

  if (loading && !cart) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#b8860b" />
        </View>
      </SafeAreaView>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="flex-1" style={{ paddingBottom: bottomOffset }}>
        {/* Header */}
        <View className="border-b border-surface-border px-4 py-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
              <View className="h-5 w-5 items-center justify-center rounded-full bg-primary">
                {cart && cart.items.length > 0 && <View />}
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text-primary">
                Your Cart
              </Text>
              <Text className="text-xs text-text-secondary">
                {cart?.totalQuantity ?? 0} items ready to checkout
              </Text>
            </View>
          </View>
        </View>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <>
            {/* Cart Items */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isEmpty}
            >
              {cart.items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onQuantityChange={(quantity) =>
                    handleQuantityChange(item.id, quantity)
                  }
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
              <View className="h-4" />
            </ScrollView>

            {/* Cart Summary and Checkout */}
            <CartSummary
              cart={cart}
              onCheckout={handleCheckout}
              isLoading={loading}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
