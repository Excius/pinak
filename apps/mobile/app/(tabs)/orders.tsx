import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as orderService from "@/services/order.service";
import { OrderListItem } from "@/components/orders/OrderListItem";
import Toast from "react-native-toast-message";

interface Order {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: Date;
  items: Array<{
    id: string;
  }>;
}

interface OrdersResponse {
  items: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();

  const fetchOrders = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await orderService.getOrders(pageNum, 10, {
        status: selectedFilter as any,
      });
      const data = response.data as OrdersResponse;
      setOrders(data.items);
      setTotalPages(data.pagination.totalPages);
      setPage(data.pagination.page);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch orders";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [selectedFilter]);

  const handleFilterChange = (status: string | undefined) => {
    setSelectedFilter(status);
  };

  const getOrderNumber = (id: string) => {
    return id.slice(-8).toUpperCase();
  };

  const filterButtons = [
    { label: "All", value: undefined },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="border-b border-surface-border px-4 py-4">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
            <MaterialCommunityIcons
              name={"package-variant" as any}
              size={20}
              color="#b8860b"
            />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">My Orders</Text>
            <Text className="text-xs text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Buttons */}
      <View className="border-b border-surface-border px-4 py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.label}
              onPress={() => handleFilterChange(btn.value)}
              className={`rounded-full px-4 py-2 ${
                selectedFilter === btn.value
                  ? "bg-primary"
                  : "border border-border bg-background"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedFilter === btn.value
                    ? "text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading && !orders.length ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#b8860b" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons
            name={"package-variant-closed" as any}
            size={48}
            color="#999"
          />
          <Text className="mt-4 text-center text-lg font-bold text-foreground">
            No Orders Yet
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Start shopping to see your orders here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <OrderListItem
                orderId={item.id}
                orderNumber={getOrderNumber(item.id)}
                status={item.status}
                totalAmount={item.totalAmount}
                itemCount={item.items.length}
                createdAt={item.createdAt}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row items-center justify-center gap-3 px-4 py-4">
                <TouchableOpacity
                  onPress={() => fetchOrders(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`rounded-lg px-4 py-2 ${
                    page === 1 ? "bg-muted" : "bg-primary"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      page === 1
                        ? "text-muted-foreground"
                        : "text-primary-foreground"
                    }`}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                <Text className="text-sm font-semibold text-foreground">
                  Page {page} of {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => fetchOrders(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`rounded-lg px-4 py-2 ${
                    page === totalPages ? "bg-muted" : "bg-primary"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      page === totalPages
                        ? "text-muted-foreground"
                        : "text-primary-foreground"
                    }`}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
