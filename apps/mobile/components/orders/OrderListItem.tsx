import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

interface OrderListItemProps {
  orderId: string;
  orderNumber: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  itemCount: number;
  createdAt: string | Date;
}

export function OrderListItem({
  orderId,
  orderNumber,
  status,
  totalAmount,
  itemCount,
  createdAt,
}: OrderListItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case "DELIVERED":
        return "text-green-600";
      case "SHIPPED":
        return "text-blue-600";
      case "PROCESSING":
        return "text-yellow-600";
      case "CANCELLED":
        return "text-red-600";
      case "PENDING":
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "DELIVERED":
        return "check-circle";
      case "SHIPPED":
        return "truck";
      case "PROCESSING":
        return "progress-clock";
      case "CANCELLED":
        return "close-circle";
      case "PENDING":
      default:
        return "clock-outline";
    }
  };

  const formatDate = (dateValue: string | Date) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/order/${orderId}` as never)}
      className="mb-3 flex-row items-center gap-3 rounded-lg border border-surface-border bg-background p-4"
    >
      {/* Icon */}
      <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
        <MaterialCommunityIcons
          name={getStatusIcon()}
          size={24}
          color="#b8860b"
        />
      </View>

      {/* Details */}
      <View className="flex-1">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-foreground">
            Order #{orderNumber}
          </Text>
          <Text className={`text-xs font-semibold ${getStatusColor()}`}>
            {status}
          </Text>
        </View>
        <Text className="mb-1 text-xs text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatDate(createdAt)}
        </Text>
      </View>

      {/* Amount */}
      <View className="items-end">
        <Text className="text-sm font-bold text-primary">
          ₹{totalAmount.toLocaleString("en-IN")}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
}
