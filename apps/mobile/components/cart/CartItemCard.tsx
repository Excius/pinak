import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CartItem } from "@/hooks/use-cart";

interface CartItemCardProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  const product = item.productVariant?.product;
  const variant = item.productVariant;
  const comboKit = item.comboKit;

  const isProductVariant = !!variant;
  const name = isProductVariant ? product?.name : comboKit?.name;
  const imageUrl = isProductVariant ? variant?.image?.url : comboKit?.imageUrl;
  const brand = isProductVariant ? product?.brand?.name : null;
  const optionValues = isProductVariant ? variant?.optionValues : null;

  return (
    <View className="flex-row gap-3 border-b border-surface-border px-4 py-3">
      {/* Product Image */}
      <View className="h-24 w-24 overflow-hidden rounded-lg bg-surface">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-surface">
            <MaterialCommunityIcons
              name="image-off"
              size={24}
              color="#B8B8B8"
            />
          </View>
        )}
      </View>

      {/* Product Details */}
      <View className="flex-1">
        {/* Name */}
        <Text className="mb-1 text-sm font-semibold text-text-primary line-clamp-2">
          {name}
        </Text>

        {/* Brand */}
        {brand && (
          <Text className="mb-1 text-xs text-text-secondary">{brand}</Text>
        )}

        {/* Option Values */}
        {optionValues && optionValues.length > 0 && (
          <Text className="mb-2 text-xs text-text-secondary">
            {optionValues
              .map((opt) => `${opt.optionName}: ${opt.valueName}`)
              .join(" • ")}
          </Text>
        )}

        {/* Price */}
        <Text className="mb-2 text-sm font-bold text-primary">
          ₹{item.unitPrice.toLocaleString("en-IN")}
        </Text>

        {/* Quantity Controls */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => onQuantityChange(Math.max(1, item.quantity - 1))}
            className="rounded-md border border-surface-border bg-surface p-1"
          >
            <MaterialCommunityIcons name="minus" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="w-8 text-center font-semibold text-text-primary">
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={() => onQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.availableStock}
            className={`rounded-md border border-surface-border ${
              item.quantity >= item.availableStock
                ? "bg-surface-light"
                : "bg-surface"
            } p-1`}
          >
            <MaterialCommunityIcons
              name="plus"
              size={16}
              color={
                item.quantity >= item.availableStock ? "#8B8B8B" : "#FFFFFF"
              }
            />
          </TouchableOpacity>

          {/* Remove Button */}
          <TouchableOpacity
            onPress={onRemove}
            className="ml-auto rounded-md p-1"
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color="#ef4444"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
