import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface AddressFormProps {
  title: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  onFullNameChange: (text: string) => void;
  onAddressLine1Change: (text: string) => void;
  onAddressLine2Change: (text: string) => void;
  onCityChange: (text: string) => void;
  onStateChange: (text: string) => void;
  onPincodeChange: (text: string) => void;
  onPhoneChange: (text: string) => void;
}

export function AddressForm({
  title,
  fullName,
  addressLine1,
  addressLine2,
  city,
  state,
  pincode,
  phone,
  onFullNameChange,
  onAddressLine1Change,
  onAddressLine2Change,
  onCityChange,
  onStateChange,
  onPincodeChange,
  onPhoneChange,
}: AddressFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const inputClassName =
    "rounded-lg border border-surface-border bg-surface-light px-4 py-3 text-sm text-text-primary";

  return (
    <View className="mb-4 rounded-lg border border-surface-border bg-surface p-4">
      {/* Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="mb-4 flex-row items-center justify-between"
      >
        <Text className="text-base font-bold text-text-primary">{title}</Text>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#C9A962"
        />
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Full Name *
            </Text>
            <TextInput
              value={fullName}
              onChangeText={onFullNameChange}
              placeholder="Enter your full name"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Address Line 1 *
            </Text>
            <TextInput
              value={addressLine1}
              onChangeText={onAddressLine1Change}
              placeholder="Enter your address"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              Address Line 2
            </Text>
            <TextInput
              value={addressLine2}
              onChangeText={onAddressLine2Change}
              placeholder="Optional"
              placeholderTextColor="#8A8A8A"
              className={inputClassName}
            />
          </View>

          {/* City and State Row */}
          <View className="mb-4 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                City *
              </Text>
              <TextInput
                value={city}
                onChangeText={onCityChange}
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
                value={state}
                onChangeText={onStateChange}
                placeholder="Enter state"
                placeholderTextColor="#8A8A8A"
                className={inputClassName}
              />
            </View>
          </View>

          {/* Pincode and Phone Row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-2 text-sm font-semibold text-text-primary">
                Pincode *
              </Text>
              <TextInput
                value={pincode}
                onChangeText={onPincodeChange}
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
                value={phone}
                onChangeText={onPhoneChange}
                placeholder="Enter phone"
                placeholderTextColor="#8A8A8A"
                keyboardType="phone-pad"
                className={inputClassName}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
