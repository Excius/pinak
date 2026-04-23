import React from "react";
import { View, Text, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface OrderDetailItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface OrderDetailsCardProps {
  orderId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  totalAmount: number;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  items: OrderDetailItem[];
  shippingAddress?: Address | null;
  billingAddress?: Address | null;
  createdAt: string | Date;
}

export function OrderDetailsCard({
  orderId,
  status,
  paymentStatus,
  totalAmount,
  subtotalAmount,
  taxAmount,
  discountAmount,
  shippingAmount,
  items,
  shippingAddress,
  billingAddress,
  createdAt,
}: OrderDetailsCardProps) {
  const getStatusBadgeColor = () => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100";
      case "SHIPPED":
        return "bg-blue-100";
      case "PROCESSING":
        return "bg-yellow-100";
      case "CANCELLED":
        return "bg-red-100";
      case "PENDING":
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case "DELIVERED":
        return "text-green-700";
      case "SHIPPED":
        return "text-blue-700";
      case "PROCESSING":
        return "text-yellow-700";
      case "CANCELLED":
        return "text-red-700";
      case "PENDING":
      default:
        return "text-gray-700";
    }
  };

  const getPaymentStatusBadge = () => {
    switch (paymentStatus) {
      case "COMPLETED":
        return { bg: "bg-green-100", text: "text-green-700", label: "Paid" };
      case "FAILED":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Payment Failed",
        };
      case "PENDING":
      default:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Pending Payment",
        };
    }
  };

  const paymentBadge = getPaymentStatusBadge();

  const formatDate = (dateValue: string | Date) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-4">
        {/* Order Header */}
        <View className="mb-4 rounded-lg border border-surface-border bg-background p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-muted-foreground">Order ID</Text>
              <Text className="mt-1 font-mono text-sm font-bold text-foreground">
                #{orderId.slice(0, 8)}
              </Text>
            </View>
            <View>
              <View
                className={`rounded-full px-3 py-1 ${getStatusBadgeColor()}`}
              >
                <Text className={`text-xs font-bold ${getStatusTextColor()}`}>
                  {status}
                </Text>
              </View>
            </View>
          </View>

          <View className="border-b border-surface-border pb-3" />

          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-muted-foreground">Order Date</Text>
              <Text className="mt-1 text-xs text-foreground">
                {formatDate(createdAt)}
              </Text>
            </View>
            <View className={`rounded-full px-3 py-1 ${paymentBadge.bg}`}>
              <Text className={`text-xs font-bold ${paymentBadge.text}`}>
                {paymentBadge.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="mb-4 rounded-lg border border-surface-border bg-background p-4">
          <Text className="mb-3 text-base font-bold text-foreground">
            Order Items
          </Text>
          {items.map((item, index) => (
            <View key={item.id}>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-foreground line-clamp-2">
                    {item.productName}
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                  </Text>
                </View>
                <Text className="ml-2 text-sm font-bold text-foreground">
                  ₹{item.lineTotal.toLocaleString("en-IN")}
                </Text>
              </View>
              {index < items.length - 1 && (
                <View className="my-3 h-px bg-surface-border" />
              )}
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View className="mb-4 rounded-lg border border-surface-border bg-background p-4">
          <Text className="mb-3 text-base font-bold text-foreground">
            Price Breakdown
          </Text>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Subtotal</Text>
            <Text className="text-sm font-medium text-foreground">
              ₹{subtotalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-sm text-muted-foreground">Tax (GST)</Text>
            <Text className="text-sm font-medium text-foreground">
              ₹{taxAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          {discountAmount > 0 && (
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Discount</Text>
              <Text className="text-sm font-medium text-green-600">
                -₹{discountAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
          {shippingAmount > 0 && (
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm text-muted-foreground">Shipping</Text>
              <Text className="text-sm font-medium text-foreground">
                ₹{shippingAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
          <View className="border-b border-surface-border py-2" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-foreground">Total</Text>
            <Text className="text-base font-bold text-primary">
              ₹{totalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        {shippingAddress && (
          <View className="mb-4 rounded-lg border border-surface-border bg-background p-4">
            <Text className="mb-3 text-base font-bold text-foreground">
              Shipping Address
            </Text>
            <View className="flex-row gap-2">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#999"
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {shippingAddress.fullName}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  {shippingAddress.addressLine1}
                </Text>
                {shippingAddress.addressLine2 && (
                  <Text className="text-xs text-muted-foreground">
                    {shippingAddress.addressLine2}
                  </Text>
                )}
                <Text className="mt-1 text-xs text-muted-foreground">
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.pincode}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  Phone: {shippingAddress.phone}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Billing Address */}
        {billingAddress && (
          <View className="mb-4 rounded-lg border border-surface-border bg-background p-4">
            <Text className="mb-3 text-base font-bold text-foreground">
              Billing Address
            </Text>
            <View className="flex-row gap-2">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#999"
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {billingAddress.fullName}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  {billingAddress.addressLine1}
                </Text>
                {billingAddress.addressLine2 && (
                  <Text className="text-xs text-muted-foreground">
                    {billingAddress.addressLine2}
                  </Text>
                )}
                <Text className="mt-1 text-xs text-muted-foreground">
                  {billingAddress.city}, {billingAddress.state}{" "}
                  {billingAddress.pincode}
                </Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  Phone: {billingAddress.phone}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
