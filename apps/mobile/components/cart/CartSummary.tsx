import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { AppliedCoupon, Cart } from "@/hooks/use-cart";
import { formatRupeesFromPaise } from "@/utils/currency";

interface CartSummaryProps {
  cart: Cart | null;
  onCheckout: () => void;
  isLoading?: boolean;
  appliedCoupon?: AppliedCoupon | null;
  applyingCoupon?: boolean;
  onApplyCoupon?: (code: string) => Promise<boolean>;
  onRemoveCoupon?: () => void;
}

export function CartSummary({
  cart,
  onCheckout,
  isLoading = false,
  appliedCoupon,
  applyingCoupon = false,
  onApplyCoupon,
  onRemoveCoupon,
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <View className="border-t border-surface-border bg-surface/70 px-4 py-4">
      <View className="mb-4">
        <Text className="mb-2 text-sm font-semibold text-text-primary">
          Have a coupon?
        </Text>
        {appliedCoupon ? (
          <View className="flex-row items-center justify-between rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
            <View>
              <Text className="font-semibold text-primary">
                {appliedCoupon.coupon.code}
              </Text>
              <Text className="text-xs text-text-secondary">
                You saved {formatRupeesFromPaise(appliedCoupon.discountAmount)}
              </Text>
            </View>
            <TouchableOpacity onPress={onRemoveCoupon}>
              <Text className="text-xs font-semibold text-primary">Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <TextInput
              value={couponCode}
              onChangeText={setCouponCode}
              placeholder="Enter code"
              placeholderTextColor="#8a8a8a"
              autoCapitalize="characters"
              className="flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm text-text-primary"
              editable={!applyingCoupon}
            />
            <TouchableOpacity
              onPress={() => onApplyCoupon?.(couponCode)}
              disabled={applyingCoupon || !couponCode.trim()}
              className={`items-center justify-center rounded-lg px-4 ${
                applyingCoupon || !couponCode.trim()
                  ? "bg-surface-light"
                  : "bg-primary"
              }`}
            >
              <Text className="text-sm font-bold text-background">
                {applyingCoupon ? "..." : "Apply"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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

      {appliedCoupon && (
        <View className="mb-3 flex-row justify-between">
          <Text className="text-sm text-text-secondary">Coupon discount</Text>
          <Text className="text-sm font-semibold text-green-600">
            -{formatRupeesFromPaise(appliedCoupon.discountAmount)}
          </Text>
        </View>
      )}

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
          {formatRupeesFromPaise(
            Math.max(
              0,
              (cart.grandTotal ?? cart.total) -
                (appliedCoupon?.discountAmount ?? 0),
            ),
          )}
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
