import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Cart } from "@/hooks/use-cart";
import { formatRupeesFromPaise } from "@/utils/currency";

interface CartSummaryProps {
  cart: Cart | null;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  cart,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <View className="border-t border-surface-border bg-surface/70 px-4 py-4">
      {/* Subtotal */}
      <View className="mb-2 flex-row justify-between">
        <Text className="text-sm text-text-secondary">Subtotal</Text>
        <Text className="text-sm font-semibold text-text-primary">
          {formatRupeesFromPaise(cart.subtotal)}
        </Text>
      </View>

      <View className="mb-2 flex-row justify-between">
        <Text className="text-sm text-text-secondary">Tax</Text>
        <Text className="text-sm font-semibold text-text-primary">
          {formatRupeesFromPaise(cart.taxTotal ?? 0)}
        </Text>
      </View>

      {/* Tax */}
      <View className="mb-3 flex-row justify-between">
        <Text className="text-sm text-text-secondary">Items</Text>
        <Text className="text-sm font-semibold text-text-primary">
          {cart.totalQuantity}
        </Text>
      </View>

      {cart.shippingRequired && (
        <View className="mb-3 flex-row justify-between">
          <Text className="text-sm text-text-secondary">Shipping</Text>
          <Text className="text-sm font-semibold text-text-primary">
            {cart.shippingFee
              ? formatRupeesFromPaise(cart.shippingFee)
              : "Free"}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View className="mb-3 h-px bg-surface-border" />

      {/* Total */}
      <View className="mb-4 flex-row justify-between">
        <Text className="text-base font-bold text-text-primary">Total</Text>
        <Text className="text-base font-bold text-primary">
          {formatRupeesFromPaise(cart.grandTotal ?? cart.total)}
        </Text>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        onPress={onCheckout}
        disabled={isLoading}
        className={`rounded-xl py-3 ${
          isLoading ? "bg-surface-light" : "bg-primary"
        } items-center justify-center`}
      >
        <Text
          className={`text-base font-bold ${
            isLoading ? "text-text-secondary" : "text-background"
          }`}
        >
          {isLoading ? "Processing..." : "Proceed to Checkout"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
