import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { addressService, type Address } from "@/services/address.service";
import Toast from "react-native-toast-message";

interface AddressSelectorProps {
  title: string;
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
}

export function AddressSelector({
  title,
  selectedAddressId,
  onAddressSelect,
}: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: any, fallback: string) => {
    return err?.response?.data?.message || err?.message || fallback;
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const userAddresses = await addressService.getAddresses();
      setAddresses(userAddresses);

      // If no address is selected and we have addresses, select the default one
      if (!selectedAddressId && userAddresses.length > 0) {
        const defaultAddress =
          userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
        onAddressSelect(defaultAddress);
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Failed to load addresses");
      setError(errorMessage);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    onAddressSelect(address);
  };

  const handleAddNewAddress = () => {
    router.push("/address/new");
  };

  const handleManageAddresses = () => {
    router.push("/address/manage");
  };

  const formatAddress = (address: Address) => {
    return `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ""}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  if (loading) {
    return (
      <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
        <Text className="mb-3 text-base font-bold text-text-primary">
          {title}
        </Text>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="small" color="#b8860b" />
          <Text className="mt-2 text-sm text-text-secondary">
            Loading addresses...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
        <Text className="mb-3 text-base font-bold text-text-primary">
          {title}
        </Text>
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={32}
            color="#ef4444"
          />
          <Text className="mt-2 text-sm text-error text-center">{error}</Text>
          <TouchableOpacity
            onPress={loadAddresses}
            className="mt-3 rounded-lg bg-primary px-4 py-2"
          >
            <Text className="text-sm font-medium text-primary-foreground">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (addresses.length === 0) {
    return (
      <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
        <Text className="mb-3 text-base font-bold text-text-primary">
          {title}
        </Text>
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={48}
            color="#C9A962"
          />
          <Text className="mt-4 text-center text-lg font-bold text-text-primary">
            No saved addresses
          </Text>
          <Text className="mt-2 text-center text-sm text-text-secondary px-4">
            Add your first address to continue with checkout
          </Text>
          <TouchableOpacity
            onPress={handleAddNewAddress}
            className="mt-6 rounded-lg bg-primary px-8 py-3"
          >
            <Text className="font-semibold text-primary-foreground">
              Add Address
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-text-primary">{title}</Text>
        <TouchableOpacity onPress={handleManageAddresses}>
          <Text className="text-sm font-medium text-primary">Manage</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <View className="flex-row gap-3">
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              onPress={() => handleAddressSelect(address)}
              className={`min-w-72 rounded-lg border-2 p-4 ${
                selectedAddressId === address.id
                  ? "border-primary bg-primary/5"
                  : "border-surface-border bg-surface-light"
              }`}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text-primary">
                    {address.label || "Address"}
                  </Text>
                  {address.isDefault && (
                    <View className="flex-row items-center mt-1">
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={14}
                        color="#b8860b"
                      />
                      <Text className="ml-1 text-xs text-primary font-medium">
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                {selectedAddressId === address.id && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#b8860b"
                  />
                )}
              </View>

              <Text className="text-sm text-text-primary leading-5">
                {formatAddress(address)}
              </Text>
              <Text className="mt-2 text-sm text-text-secondary">
                Phone: {address.phone}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Add new address card */}
          <TouchableOpacity
            onPress={handleAddNewAddress}
            className="min-w-48 rounded-lg border-2 border-dashed border-surface-border bg-surface-light p-4 items-center justify-center"
          >
            <MaterialCommunityIcons name="plus" size={32} color="#C9A962" />
            <Text className="mt-2 text-sm font-medium text-primary text-center">
              Add New{"\n"}Address
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
