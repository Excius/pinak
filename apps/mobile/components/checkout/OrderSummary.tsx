import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Cart } from "@/hooks/use-cart";

interface OrderSummaryProps {
  cart: Cart;
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  return (
    <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
      <Text className="mb-3 text-base font-bold text-text-primary">
        Order Summary
      </Text>

      {/* Items Preview */}
      <ScrollView
        className="mb-4 max-h-32"
        showsVerticalScrollIndicator={false}
      >
        {cart.items.map((item) => {
          const productName =
            item.productVariant?.product?.name || item.comboKit?.name;
          return (
            <View key={item.id} className="mb-2 flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-text-primary line-clamp-1">
                  {productName}
                </Text>
                <Text className="text-xs text-text-secondary">
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-text-primary">
                ₹{item.lineTotal.toLocaleString("en-IN")}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Divider */}
      <View className="mb-3 h-px bg-surface-border" />

      {/* Breakdown */}
      <View className="mb-2 flex-row justify-between">
        <Text className="text-xs text-text-secondary">Subtotal</Text>
        <Text className="text-xs font-medium text-text-primary">
          ₹{cart.subtotal.toLocaleString("en-IN")}
        </Text>
      </View>

      <View className="mb-3 flex-row justify-between">
        <Text className="text-xs text-text-secondary">Items</Text>
        <Text className="text-xs font-medium text-text-primary">
          {cart.totalQuantity}
        </Text>
      </View>

      {/* Total */}
      <View className="flex-row justify-between">
        <Text className="text-sm font-bold text-text-primary">
          Total Amount
        </Text>
        <Text className="text-sm font-bold text-primary">
          ₹{cart.total.toLocaleString("en-IN")}
        </Text>
      </View>
    </View>
  );
}
