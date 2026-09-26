import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Text,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, router } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
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
  const [invoiceHtml, setInvoiceHtml] = useState<string | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);

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
      (order.status !== "PENDING" && order.status !== "PROCESSING")
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

  const handleOpenInvoice = async () => {
    if (!order || invoiceLoading) return;

    setInvoiceLoading(true);
    try {
      const response = await orderService.getInvoiceHtml(order.id);
      setInvoiceHtml(response);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Invoice unavailable",
        text2: error?.message || "Unable to load the invoice",
        position: "bottom",
      });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order || invoiceDownloading) return;

    setInvoiceDownloading(true);
    try {
      const pdf = await orderService.getInvoicePdf(order.id);
      const bytes = new Uint8Array(pdf);
      let binary = "";
      const chunkSize = 8192;
      for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(
          ...bytes.subarray(index, index + chunkSize),
        );
      }

      const fileUri = `${FileSystem.documentDirectory}Tax-Invoice-${order.id}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, btoa(binary), {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Invoice download is not available on this device");
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Download invoice",
        UTI: "com.adobe.pdf",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Download unavailable",
        text2: error?.message || "Unable to download the invoice",
        position: "bottom",
      });
    } finally {
      setInvoiceDownloading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
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
      edges={["top", "bottom", "left", "right"]}
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

        {/* option to render the invoice ifle in headera s well  */}

        
        {/* <TouchableOpacity
          onPress={() => void handleOpenInvoice()}
          accessibilityRole="button"
          accessibilityLabel="View invoice"
          className="h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10"
        >
          <MaterialCommunityIcons
            name="file-document-outline"
            size={22}
            color="#b8860b"
          />
        </TouchableOpacity> */}
      </View>

      <TouchableOpacity
        onPress={() => void handleOpenInvoice()}
        className="mx-4 mt-4 flex-row items-center rounded-xl border border-primary/30 bg-primary/10 px-4 py-3"
      >
        <MaterialCommunityIcons
          name="file-document-outline"
          size={22}
          color="#b8860b"
        />
        <View className="ml-3 flex-1">
          <Text className="text-sm font-bold text-text-primary">
            Tax invoice
          </Text>
          <Text className="mt-0.5 text-xs text-text-secondary">
            View or download your invoice
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color="#b8860b"
        />
      </TouchableOpacity>

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

      {/* Order Actions */}
      <View className="border-t border-surface-border/60 bg-surface-light px-4 py-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5"
          >
            <MaterialCommunityIcons
              name="shopping-outline"
              size={18}
              color="#171717"
            />
            <Text className="text-center text-sm font-bold text-primary-foreground">
              Continue Shopping
            </Text>
          </TouchableOpacity>

          {(order.status === "PENDING" || order.status === "PROCESSING") && (
            <TouchableOpacity
              onPress={handleCancelOrder}
              disabled={cancelling}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5"
            >
              {cancelling ? (
                <ActivityIndicator color="#dc2626" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={18}
                    color="#dc2626"
                  />
                  <Text className="text-center text-sm font-semibold text-red-600">
                    Cancel Order
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={invoiceHtml !== null}
        animationType="slide"
        onRequestClose={() => setInvoiceHtml(null)}
      >
        <SafeAreaView className="flex-1 bg-surface-light">
          <View className="flex-row items-center gap-3 border-b border-surface-border/60 px-4 py-3">
            <TouchableOpacity
              onPress={() => setInvoiceHtml(null)}
              accessibilityRole="button"
              accessibilityLabel="Close invoice"
            >
              <MaterialCommunityIcons name="close" size={24} color="#b8860b" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-bold text-text-primary">
              Tax invoice
            </Text>
            <TouchableOpacity
              onPress={() => void handleDownloadInvoice()}
              disabled={invoiceDownloading}
              accessibilityRole="button"
              accessibilityLabel="Download invoice"
              className="flex-row items-center gap-1 rounded-lg border border-primary/40 px-3 py-2"
            >
              {invoiceDownloading ? (
                <ActivityIndicator size="small" color="#b8860b" />
              ) : (
                <MaterialCommunityIcons
                  name="download-outline"
                  size={19}
                  color="#b8860b"
                />
              )}
              <Text className="text-xs font-bold text-primary">Download</Text>
            </TouchableOpacity>
          </View>
          <WebView
            originWhitelist={["*"]}
            source={{ html: invoiceHtml ?? "" }}
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#b8860b" />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
