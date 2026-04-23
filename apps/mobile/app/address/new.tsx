import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  addressService,
  type Address,
  type CreateAddressData,
  type UpdateAddressData,
} from "@/services/address.service";
import Toast from "react-native-toast-message";

const emptyAddress: CreateAddressData = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  label: "",
};

export default function AddressFormScreen() {
  const params = useLocalSearchParams();
  const id = "id" in params ? (params.id as string) : undefined;
  const isEdit = !!id;

  const [formData, setFormData] = useState<CreateAddressData>(emptyAddress);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const getErrorMessage = (err: any, fallback: string) => {
    return err?.response?.data?.message || err?.message || fallback;
  };

  useEffect(() => {
    if (isEdit && id) {
      loadAddress();
    }
  }, [isEdit, id]);

  const loadAddress = async () => {
    try {
      setLoading(true);
      const address = await addressService.getAddress(id!);
      setFormData({
        fullName: address.fullName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        label: address.label || "",
      });
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Failed to load address");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Full name is required",
        position: "bottom",
      });
      return false;
    }
    if (!formData.addressLine1.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Address line 1 is required",
        position: "bottom",
      });
      return false;
    }
    if (!formData.city.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "City is required",
        position: "bottom",
      });
      return false;
    }
    if (!formData.state.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "State is required",
        position: "bottom",
      });
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Valid pincode is required (at least 6 digits)",
        position: "bottom",
      });
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Valid phone number is required (at least 10 digits)",
        position: "bottom",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const data = {
        ...formData,
        addressLine2: formData.addressLine2 || undefined,
        label: formData.label || undefined,
      };

      if (isEdit && id) {
        await addressService.updateAddress(id, data as UpdateAddressData);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Address updated successfully",
          position: "bottom",
        });
      } else {
        await addressService.createAddress(data);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Address added successfully",
          position: "bottom",
        });
      }

      router.back();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err, "Failed to save address");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
        position: "bottom",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof CreateAddressData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const inputClassName =
    "rounded-lg border border-surface-border bg-surface-light px-4 py-3 text-sm text-text-primary";

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
          {isEdit ? "Edit Address" : "Add New Address"}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Label */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Label (Optional)
            </Text>
            <TextInput
              value={formData.label}
              onChangeText={(text) => updateField("label", text)}
              placeholder="e.g., Home, Work, Office"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Full Name *
            </Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) => updateField("fullName", text)}
              placeholder="Enter your full name"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          {/* Address Line 1 */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Address Line 1 *
            </Text>
            <TextInput
              value={formData.addressLine1}
              onChangeText={(text) => updateField("addressLine1", text)}
              placeholder="Street address, P.O. box, company name"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          {/* Address Line 2 */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Address Line 2
            </Text>
            <TextInput
              value={formData.addressLine2}
              onChangeText={(text) => updateField("addressLine2", text)}
              placeholder="Apartment, suite, unit, building, floor"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          {/* City and State */}
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                City *
              </Text>
              <TextInput
                value={formData.city}
                onChangeText={(text) => updateField("city", text)}
                placeholder="Enter city"
                placeholderTextColor="#8A8A8A"
                className={inputClassName}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                State *
              </Text>
              <TextInput
                value={formData.state}
                onChangeText={(text) => updateField("state", text)}
                placeholder="Enter state"
                placeholderTextColor="#8A8A8A"
                className={inputClassName}
              />
            </View>
          </View>

          {/* Pincode and Phone */}
          <View className="mb-6 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Pincode *
              </Text>
              <TextInput
                value={formData.pincode}
                onChangeText={(text) => updateField("pincode", text)}
                placeholder="Enter pincode"
                placeholderTextColor="#8A8A8A"
                keyboardType="number-pad"
                className={inputClassName}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Phone *
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => updateField("phone", text)}
                placeholder="Enter phone number"
                placeholderTextColor="#8A8A8A"
                keyboardType="phone-pad"
                className={inputClassName}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="border-t border-surface-border px-4 py-4">
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className={`rounded-lg py-4 items-center justify-center ${
            saving ? "bg-surface-light" : "bg-primary"
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-bold text-primary-foreground">
              {isEdit ? "Update Address" : "Save Address"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
