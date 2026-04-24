import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, router } from "expo-router";
import * as orderService from "@/services/order.service";
import { OrderDetailsCard } from "@/components/orders/OrderDetailsCard";
import Toast from "react-native-toast-message";

interface OrderResponse {
  id: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponCode: string | null;
  couponDiscount: number;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  } | null;
  billingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  } | null;
  items: Array<{
    id: string;
    productId: string | null;
    productVariantId: string | null;
    comboKitId: string | null;
    productName: string;
    variantDetails: Record<string, unknown> | null;
    price: number;
    quantity: number;
    lineTotal: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function OrderDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Order ID not found",
        position: "bottom",
      });
      router.back();
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response.data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch order";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
      console.error("Fetch order error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    if (
      !order ||
      order.status === "DELIVERED" ||
      order.status === "CANCELLED"
    ) {
      Toast.show({
        type: "error",
        text1: "Cannot Cancel",
        text2: "This order cannot be cancelled",
        position: "bottom",
      });
      return;
    }

    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Yes, Cancel Order",
        onPress: async () => {
          setCancelling(true);
          try {
            const response = await orderService.cancelOrder(id!);
            setOrder(response.data);
            Toast.show({
              type: "success",
              text1: "Order Cancelled",
              text2: "Your order has been cancelled successfully",
              position: "bottom",
            });
          } catch (error: any) {
            const errorMessage =
              error?.response?.data?.message || "Failed to cancel order";
            Toast.show({
              type: "error",
              text1: "Error",
              text2: errorMessage,
              position: "bottom",
            });
            console.error("Cancel order error:", error);
          } finally {
            setCancelling(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={[ "bottom", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#b8860b" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#999"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 rounded-lg bg-primary px-8 py-3"
          >
            <Text className="font-semibold text-primary-foreground">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={[ "top", "bottom", "left", "right" ]}
      className="flex-1 bg-surface-light"
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 border-b border-surface-border/60 bg-surface-light px-4 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#b8860b" />
        </TouchableOpacity>
        <View className="flex-1">
          <TouchableOpacity onPress={() => router.back()} className="flex-1">
            <Text className="text-lg font-bold text-text-primary">
              Order Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Details */}
      <OrderDetailsCard
        orderId={order.id}
        status={order.status}
        paymentStatus={order.paymentStatus}
        totalAmount={order.totalAmount}
        subtotalAmount={order.subtotalAmount}
        taxAmount={order.taxAmount}
        discountAmount={order.discountAmount}
        shippingAmount={order.shippingAmount}
        items={order.items}
        shippingAddress={order.shippingAddress}
        billingAddress={order.billingAddress}
        createdAt={order.createdAt}
      />

      {/* Cancel Order Button */}
      {(order.status === "PENDING" || order.status === "PROCESSING") && (
        <View className="border-t border-surface-border/60 bg-surface-light px-4 py-4">
          <TouchableOpacity
            onPress={handleCancelOrder}
            disabled={cancelling}
            className="rounded-2xl border-2 border-red-500 bg-surface py-3"
          >
            <View className="items-center">
              {cancelling ? (
                <ActivityIndicator color="#ef4444" />
              ) : (
                <Text className="font-semibold text-red-500">Cancel Order</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
