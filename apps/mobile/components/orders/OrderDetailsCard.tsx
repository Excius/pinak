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
        return "bg-green-500/15";
      case "SHIPPED":
        return "bg-blue-500/15";
      case "PROCESSING":
        return "bg-yellow-500/15";
      case "CANCELLED":
        return "bg-red-500/15";
      case "PENDING":
      default:
        return "bg-white/10";
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case "DELIVERED":
        return "text-green-400";
      case "SHIPPED":
        return "text-blue-400";
      case "PROCESSING":
        return "text-yellow-400";
      case "CANCELLED":
        return "text-red-400";
      case "PENDING":
      default:
        return "text-gray-300";
    }
  };

  const getPaymentStatusBadge = () => {
    switch (paymentStatus) {
      case "COMPLETED":
        return {
          bg: "bg-green-500/15",
          text: "text-green-400",
          label: "Paid",
        };
      case "FAILED":
        return {
          bg: "bg-red-500/15",
          text: "text-red-400",
          label: "Payment Failed",
        };
      case "PENDING":
      default:
        return {
          bg: "bg-yellow-500/15",
          text: "text-yellow-400",
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
        <View className="mb-4 rounded-2xl border border-surface-border/70 bg-surface px-4 py-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-text-secondary">Order ID</Text>
              <Text className="mt-1 font-mono text-sm font-bold text-text-primary">
                #{orderId.slice(-8).toUpperCase()}
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

          <View className="border-b border-surface-border/70 pb-3" />

          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-text-secondary">Order Date</Text>
              <Text className="mt-1 text-xs text-text-primary">
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
        <View className="mb-4 rounded-2xl border border-surface-border/70 bg-surface px-4 py-4">
          <Text className="mb-3 text-base font-bold text-text-primary">
            Order Items
          </Text>
          {items.map((item, index) => (
            <View key={item.id}>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-text-primary line-clamp-2">
                    {item.productName}
                  </Text>
                  <Text className="mt-1 text-xs text-text-secondary">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                  </Text>
                </View>
                <Text className="ml-2 text-sm font-bold text-text-primary">
                  ₹{item.lineTotal.toLocaleString("en-IN")}
                </Text>
              </View>
              {index < items.length - 1 && (
                <View className="my-3 h-px bg-surface-border/70" />
              )}
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View className="mb-4 rounded-2xl border border-surface-border/70 bg-surface px-4 py-4">
          <Text className="mb-3 text-base font-bold text-text-primary">
            Price Breakdown
          </Text>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-sm text-text-secondary">Subtotal</Text>
            <Text className="text-sm font-medium text-text-primary">
              ₹{subtotalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-sm text-text-secondary">Tax (GST)</Text>
            <Text className="text-sm font-medium text-text-primary">
              ₹{taxAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          {discountAmount > 0 && (
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm text-text-secondary">Discount</Text>
              <Text className="text-sm font-medium text-green-600">
                -₹{discountAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
          {shippingAmount > 0 && (
            <View className="mb-2 flex-row justify-between">
              <Text className="text-sm text-text-secondary">Shipping</Text>
              <Text className="text-sm font-medium text-text-primary">
                ₹{shippingAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
          <View className="border-b border-surface-border/70 py-2" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text-primary">Total</Text>
            <Text className="text-base font-bold text-primary">
              ₹{totalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        {shippingAddress && (
          <View className="mb-4 rounded-2xl border border-surface-border/70 bg-surface px-4 py-4">
            <Text className="mb-3 text-base font-bold text-text-primary">
              Shipping Address
            </Text>
            <View className="flex-row gap-2">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#b8860b"
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary">
                  {shippingAddress.fullName}
                </Text>
                <Text className="mt-1 text-xs text-text-secondary">
                  {shippingAddress.addressLine1}
                </Text>
                {shippingAddress.addressLine2 && (
                  <Text className="text-xs text-text-secondary">
                    {shippingAddress.addressLine2}
                  </Text>
                )}
                <Text className="mt-1 text-xs text-text-secondary">
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.pincode}
                </Text>
                <Text className="mt-1 text-xs text-text-secondary">
                  Phone: {shippingAddress.phone}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Billing Address */}
        {billingAddress && (
          <View className="mb-4 rounded-2xl border border-surface-border/70 bg-surface px-4 py-4">
            <Text className="mb-3 text-base font-bold text-text-primary">
              Billing Address
            </Text>
            <View className="flex-row gap-2">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="#b8860b"
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-text-primary">
                  {billingAddress.fullName}
                </Text>
                <Text className="mt-1 text-xs text-text-secondary">
                  {billingAddress.addressLine1}
                </Text>
                {billingAddress.addressLine2 && (
                  <Text className="text-xs text-text-secondary">
                    {billingAddress.addressLine2}
                  </Text>
                )}
                <Text className="mt-1 text-xs text-text-secondary">
                  {billingAddress.city}, {billingAddress.state}{" "}
                  {billingAddress.pincode}
                </Text>
                <Text className="mt-1 text-xs text-text-secondary">
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
