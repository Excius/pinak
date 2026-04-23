import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCart } from "@/hooks/use-cart";
import * as orderService from "@/services/order.service";
import { AddressForm } from "@/components/checkout/AddressForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import Toast from "react-native-toast-message";

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

const emptyAddress: Address = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState<Address>(emptyAddress);
  const [billingAddress, setBillingAddress] = useState<Address>(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCart().finally(() => setInitialLoading(false));
  }, [fetchCart]);

  const isAddressValid = (address: Address) => {
    return (
      address.fullName.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.pincode.trim() &&
      address.phone.trim()
    );
  };

  const handleCreateOrder = async () => {
    // Validation
    if (!isAddressValid(shippingAddress)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all required fields in shipping address",
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
        text2: "Please fill all required fields in billing address",
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        shippingAddress,
        billingAddress: sameAsShipping ? undefined : finalBillingAddress,
      };

      const response = await orderService.createOrder(payload);

      Toast.show({
        type: "success",
        text1: "Order Created",
        text2: "Your order has been placed successfully!",
        position: "bottom",
      });

      // Navigate to order details
      router.push(`/order/${response.data.order.id}` as never);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to create order";
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
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-surface-border px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#C9A962" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-text-primary">
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
          <AddressForm
            title="Shipping Address"
            fullName={shippingAddress.fullName}
            addressLine1={shippingAddress.addressLine1}
            addressLine2={shippingAddress.addressLine2}
            city={shippingAddress.city}
            state={shippingAddress.state}
            pincode={shippingAddress.pincode}
            phone={shippingAddress.phone}
            onFullNameChange={(text) =>
              setShippingAddress({ ...shippingAddress, fullName: text })
            }
            onAddressLine1Change={(text) =>
              setShippingAddress({ ...shippingAddress, addressLine1: text })
            }
            onAddressLine2Change={(text) =>
              setShippingAddress({ ...shippingAddress, addressLine2: text })
            }
            onCityChange={(text) =>
              setShippingAddress({ ...shippingAddress, city: text })
            }
            onStateChange={(text) =>
              setShippingAddress({ ...shippingAddress, state: text })
            }
            onPincodeChange={(text) =>
              setShippingAddress({ ...shippingAddress, pincode: text })
            }
            onPhoneChange={(text) =>
              setShippingAddress({ ...shippingAddress, phone: text })
            }
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
            <AddressForm
              title="Billing Address"
              fullName={billingAddress.fullName}
              addressLine1={billingAddress.addressLine1}
              addressLine2={billingAddress.addressLine2}
              city={billingAddress.city}
              state={billingAddress.state}
              pincode={billingAddress.pincode}
              phone={billingAddress.phone}
              onFullNameChange={(text) =>
                setBillingAddress({ ...billingAddress, fullName: text })
              }
              onAddressLine1Change={(text) =>
                setBillingAddress({ ...billingAddress, addressLine1: text })
              }
              onAddressLine2Change={(text) =>
                setBillingAddress({ ...billingAddress, addressLine2: text })
              }
              onCityChange={(text) =>
                setBillingAddress({ ...billingAddress, city: text })
              }
              onStateChange={(text) =>
                setBillingAddress({ ...billingAddress, state: text })
              }
              onPincodeChange={(text) =>
                setBillingAddress({ ...billingAddress, pincode: text })
              }
              onPhoneChange={(text) =>
                setBillingAddress({ ...billingAddress, phone: text })
              }
            />
          )}

          {/* Payment Method (Dummy) */}
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
                  (Coming soon - Dummy for now)
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="border-t border-surface-border px-4 py-4">
        <TouchableOpacity
          onPress={handleCreateOrder}
          disabled={loading}
          className={`rounded-lg py-4 ${
            loading ? "bg-surface-light" : "bg-primary"
          } items-center justify-center`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-primary-foreground">
              Place Order (₹{cart.total.toLocaleString("en-IN")})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
