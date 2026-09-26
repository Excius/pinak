import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCart } from "@/hooks/use-cart";
import * as orderService from "@/services/order.service";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import Toast from "react-native-toast-message";
import RazorpayCheckout from "react-native-razorpay";
import { formatRupeesFromPaise } from "@/utils/currency";

interface Address {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  label?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CheckoutPage() {
  const { selectedAddressId } = useLocalSearchParams<{
    selectedAddressId?: string;
  }>();
  const { cart, fetchCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCart().finally(() => setInitialLoading(false));
  }, [fetchCart]);

  const isAddressValid = (address: Address | null) => {
    return address !== null;
  };

  const handleCreateOrder = async () => {
    // Validation
    if (!isAddressValid(shippingAddress)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select a shipping address",
        position: "bottom",
      });
      return;
    }

    const finalBillingAddress = sameAsShipping
      ? shippingAddress
      : billingAddress;
    if (!sameAsShipping && !isAddressValid(finalBillingAddress)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please select a billing address",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddressId: shippingAddress!.id,
        billingAddressId: sameAsShipping ? undefined : billingAddress!.id,
      };

      const response = await orderService.createOrder(payload);
      // console.log("Order created successfully:", response.data);
      // console.log("Payment session details:", response.data.payment);
      const payment = response.data.payment;
      const razorpayOrderId = payment.paymentId || payment.id;
      if (!razorpayOrderId) {
        // console.log("Payment session creation failed:", payment);
        throw new Error("Payment session could not be created");
      }

      const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured");
      }

      const razorpayResponse = await RazorpayCheckout.open({
        key: razorpayKey,
        amount: payment.amount,
        currency: payment.currency,
        name: "Pinak",
        description: "Order Payment",
        order_id: razorpayOrderId,
        theme: { color: "#C9A962" },
      });

      await orderService.verifyPayment({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      });

      Toast.show({
        type: "success",
        text1: "Payment Successful",
        text2: "Your order has been placed successfully!",
        position: "bottom",
      });

      // Navigate to order details
      router.push(`/order/${response.data.order.id}` as never);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Payment failed";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
      console.error("Order creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#b8860b" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#C9A962"
          />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            Your cart is empty
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="mt-6 rounded-lg bg-primary px-8 py-3"
          >
            <Text className="font-semibold text-primary-foreground">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      className="flex-1 bg-surface-light"
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-surface-border/60 bg-surface-light px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#C9A962" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-foreground color-white">
          Checkout
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="px-4 py-4">
          {/* Order Summary */}
          <OrderSummary cart={cart} />

          {/* Shipping Address */}
          <AddressSelector
            title="Shipping Address"
            selectedAddressId={
              shippingAddress?.id ||
              (typeof selectedAddressId === "string"
                ? selectedAddressId
                : undefined)
            }
            onAddressSelect={setShippingAddress}
          />

          {/* Same As Shipping Checkbox */}
          <TouchableOpacity
            onPress={() => setSameAsShipping(!sameAsShipping)}
            className="mb-4 flex-row items-center gap-3"
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded border-2 ${
                sameAsShipping
                  ? "border-primary bg-primary"
                  : "border-surface-border bg-surface"
              }`}
            >
              {sameAsShipping && (
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              )}
            </View>
            <Text className="text-sm font-medium text-text-primary">
              Billing address same as shipping
            </Text>
          </TouchableOpacity>

          {/* Billing Address */}
          {!sameAsShipping && (
            <AddressSelector
              title="Billing Address"
              selectedAddressId={billingAddress?.id}
              onAddressSelect={setBillingAddress}
            />
          )}

          {/* Payment Method */}
          <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
            <Text className="mb-3 text-base font-bold text-text-primary">
              Payment Method
            </Text>
            <View className="flex-row items-center rounded-lg border-2 border-primary bg-primary/10 p-3">
              <MaterialCommunityIcons
                name="credit-card"
                size={24}
                color="#b8860b"
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-text-primary">
                  Online Payment
                </Text>
                <Text className="text-xs text-text-secondary">
                  Secure payment via Razorpay
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="border-t border-surface-border/60 bg-surface-light px-4 py-4">
        <TouchableOpacity
          onPress={handleCreateOrder}
          disabled={loading}
          className={`rounded-2xl py-4 ${
            loading ? "bg-surface" : "bg-primary"
          } items-center justify-center`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-primary-foreground">
              Place Order (
              {formatRupeesFromPaise(cart.grandTotal ?? cart.total)})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
