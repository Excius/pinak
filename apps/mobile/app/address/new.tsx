import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  addressLine1: z.string().trim().min(1, "Address line 1 is required"),
  addressLine2: z.string(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  label: z.string(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressFormScreen() {
  const params = useLocalSearchParams();
  const id = "id" in params ? (params.id as string) : undefined;
  const returnTo =
    "returnTo" in params ? (params.returnTo as string) : undefined;
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AddressFormValues>({
    defaultValues: emptyAddress,
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const getErrorMessage = (err: any, fallback: string) => {
    const validationErrors = err?.response?.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      return validationErrors
        .map((item: { field?: string; message?: string }) =>
          item.field && item.message
            ? `${item.field}: ${item.message}`
            : item.message || String(item),
        )
        .join("\n");
    }

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
      reset({
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

  const handleSave = async (formData: AddressFormValues) => {
    try {
      setSaving(true);

      const data = {
        ...formData,
        fullName: formData.fullName.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode,
        phone: formData.phone,
        label: formData.label?.trim() || undefined,
      };

      let savedAddress: Address;
      if (isEdit && id) {
        savedAddress = await addressService.updateAddress(
          id,
          data as UpdateAddressData,
        );
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Address updated successfully",
          position: "bottom",
        });
      } else {
        savedAddress = await addressService.createAddress(data);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Address added successfully",
          position: "bottom",
        });
      }

      if (!isEdit && returnTo === "checkout") {
        router.replace({
          pathname: "/checkout",
          params: { selectedAddressId: savedAddress.id },
        });
      } else {
        router.back();
      }
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

  const inputClassName =
    "rounded-lg border border-surface-border bg-surface-light px-4 py-3 text-sm text-text-primary";

  const errorClassName =
    "rounded-lg border border-red-500 bg-surface-light px-4 py-3 text-sm text-text-primary";

  const errorText = (message?: string) =>
    message ? (
      <Text className="mt-1 text-xs text-red-500">{message}</Text>
    ) : null;

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
            <Controller
              control={control}
              name="label"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/\s+/g, " "))}
                  onBlur={onBlur}
                  placeholder="e.g., Home, Work, Office"
                  placeholderTextColor="#8A8A8A"
                  className={inputClassName}
                />
              )}
            />
          </View>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Full Name <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <>
                  <TextInput
                    ref={ref}
                    value={value}
                    onChangeText={(text) =>
                      onChange(text.replace(/\s+/g, " ").trimStart())
                    }
                    onBlur={onBlur}
                    placeholder="Enter your full name"
                    placeholderTextColor="#8A8A8A"
                    className={
                      errors.fullName ? errorClassName : inputClassName
                    }
                  />
                  {errorText(errors.fullName?.message)}
                </>
              )}
            />
          </View>

          {/* Address Line 1 */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Address Line 1 <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
              name="addressLine1"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <>
                  <TextInput
                    ref={ref}
                    value={value}
                    onChangeText={(text) =>
                      onChange(text.replace(/\s+/g, " ").trimStart())
                    }
                    onBlur={onBlur}
                    placeholder="Street address, P.O. box, company name"
                    placeholderTextColor="#8A8A8A"
                    className={
                      errors.addressLine1 ? errorClassName : inputClassName
                    }
                  />
                  {errorText(errors.addressLine1?.message)}
                </>
              )}
            />
          </View>

          {/* Address Line 2 */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Address Line 2
            </Text>
            <Controller
              control={control}
              name="addressLine2"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/\s+/g, " "))}
                  onBlur={onBlur}
                  placeholder="Apartment, suite, unit, building, floor"
                  placeholderTextColor="#8A8A8A"
                  className={inputClassName}
                />
              )}
            />
          </View>

          {/* City and State */}
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                City <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <>
                    <TextInput
                      ref={ref}
                      value={value}
                      onChangeText={(text) =>
                        onChange(text.replace(/\s+/g, " ").trimStart())
                      }
                      onBlur={onBlur}
                      placeholder="Enter city"
                      placeholderTextColor="#8A8A8A"
                      className={errors.city ? errorClassName : inputClassName}
                    />
                    {errorText(errors.city?.message)}
                  </>
                )}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                State <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="state"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <>
                    <TextInput
                      ref={ref}
                      value={value}
                      onChangeText={(text) =>
                        onChange(text.replace(/\s+/g, " ").trimStart())
                      }
                      onBlur={onBlur}
                      placeholder="Enter state"
                      placeholderTextColor="#8A8A8A"
                      className={errors.state ? errorClassName : inputClassName}
                    />
                    {errorText(errors.state?.message)}
                  </>
                )}
              />
            </View>
          </View>

          {/* Pincode and Phone */}
          <View className="mb-6 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Pincode <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="pincode"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <>
                    <TextInput
                      ref={ref}
                      value={value}
                      onChangeText={(text) =>
                        onChange(text.replace(/\D/g, "").slice(0, 6))
                      }
                      onBlur={onBlur}
                      placeholder="Enter pincode"
                      placeholderTextColor="#8A8A8A"
                      keyboardType="number-pad"
                      maxLength={6}
                      className={
                        errors.pincode ? errorClassName : inputClassName
                      }
                    />
                    {errorText(errors.pincode?.message)}
                  </>
                )}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Phone <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <>
                    <TextInput
                      ref={ref}
                      value={value}
                      onChangeText={(text) =>
                        onChange(text.replace(/\D/g, "").slice(0, 10))
                      }
                      onBlur={onBlur}
                      placeholder="Enter phone number"
                      placeholderTextColor="#8A8A8A"
                      keyboardType="phone-pad"
                      maxLength={10}
                      className={errors.phone ? errorClassName : inputClassName}
                    />
                    {errorText(errors.phone?.message)}
                  </>
                )}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="border-t border-surface-border px-4 py-4">
        <TouchableOpacity
          onPress={handleSubmit(handleSave, (formErrors) => {
            const firstInvalidField = Object.keys(formErrors)[0] as
              keyof AddressFormValues | undefined;
            if (firstInvalidField) setFocus(firstInvalidField);
          })}
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
