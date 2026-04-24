import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { addressService, type Address } from "@/services/address.service";
import Toast from "react-native-toast-message";

export default function ManageAddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getErrorMessage = (err: any, fallback: string) => {
    return err?.response?.data?.message || err?.message || fallback;
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await addressService.getAddresses();
      setAddresses(userAddresses);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Failed to load addresses");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAddresses();
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await addressService.setDefaultAddress(address.id);
      await loadAddresses(); // Reload to get updated data
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Default address updated",
        position: "bottom",
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(
        err,
        "Failed to set default address",
      );
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
    }
  };

  const handleDeleteAddress = (address: Address) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await addressService.deleteAddress(address.id);
              setAddresses((prev) => prev.filter((a) => a.id !== address.id));
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Address deleted",
                position: "bottom",
              });
            } catch (err: any) {
              const errorMessage = getErrorMessage(
                err,
                "Failed to delete address",
              );
              Toast.show({
                type: "error",
                text1: "Error",
                text2: errorMessage,
                position: "bottom",
              });
            }
          },
        },
      ],
    );
  };

  const handleEditAddress = (address: Address) => {
    router.push(`/address/edit/${address.id}`);
  };

  const handleAddAddress = () => {
    router.push("/address/new");
  };

  const formatAddress = (address: Address) => {
    return `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ""}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  if (loading) {
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
          Manage Addresses
        </Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <MaterialCommunityIcons name="plus" size={24} color="#C9A962" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {addresses.length === 0 ? (
            <View className="items-center justify-center py-16">
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={64}
                color="#C9A962"
              />
              <Text className="mt-4 text-center text-lg font-bold text-text-primary">
                No saved addresses
              </Text>
              <Text className="mt-2 text-center text-sm text-text-secondary px-8">
                Add your delivery addresses to make checkout faster and easier
              </Text>
              <TouchableOpacity
                onPress={handleAddAddress}
                className="mt-6 rounded-lg bg-primary px-8 py-3"
              >
                <Text className="font-semibold text-primary-foreground">
                  Add Address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              {addresses.map((address) => (
                <View
                  key={address.id}
                  className="rounded-lg border border-surface-border bg-surface p-4"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-base font-semibold text-text-primary">
                          {address.label || "Address"}
                        </Text>
                        {address.isDefault && (
                          <View className="rounded-full bg-primary/20 px-2 py-1">
                            <Text className="text-xs font-medium text-primary">
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-text-primary leading-5">
                        {formatAddress(address)}
                      </Text>
                      <Text className="mt-1 text-sm text-text-secondary">
                        Phone: {address.phone}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    {!address.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(address)}
                        className="flex-1 rounded-lg border border-primary bg-primary/10 py-2 items-center"
                      >
                        <Text className="text-sm font-medium text-primary">
                          Set as Default
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleEditAddress(address)}
                      className="flex-1 rounded-lg border border-surface-border bg-surface-light py-2 items-center"
                    >
                      <Text className="text-sm font-medium text-text-primary">
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(address)}
                      className="rounded-lg border border-error/30 bg-error/10 py-2 px-4 items-center"
                    >
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={16}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
