import { View, Text, Image, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Product {
  id: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  badge?: "Bestseller" | "New Arrival";
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
}

export function ProductCard({
  product,
  onPress,
  onAddToCart,
}: ProductCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`full-${i}`}
          name="star"
          size={14}
          color="#C9A962"
        />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons
          key="half"
          name="star-half-full"
          size={14}
          color="#C9A962"
        />,
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#C9A962"
        />,
      );
    }

    return stars;
  };

  const getBadgeColor = (badge?: string) => {
    if (badge === "Bestseller") return "#C9A962";
    if (badge === "New Arrival") return "#D4B896";
    return "#C9A962";
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-1">
      {/* Product Image Container */}
      <View className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface shadow shadow-black/30 mb-3">
        <Image
          source={{ uri: product.image }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Badge */}
        {product.badge && (
          <View
            className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border"
            style={{ borderColor: getBadgeColor(product.badge) + "33" }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: getBadgeColor(product.badge) }}
            >
              {product.badge}
            </Text>
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity
          onPress={onAddToCart}
          className="absolute bottom-3 right-3 w-10 h-10 bg-primary rounded-full justify-center items-center shadow-lg active:scale-90"
        >
          <MaterialCommunityIcons name="plus" size={20} color="#0A0A0A" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <Text className="font-display text-sm font-semibold text-text-primary leading-tight mb-2">
        {product.title}
      </Text>

      {/* Rating */}
      {product.rating > 0 && product.reviews > 0 ? (
        <View className="flex-row items-center mb-2">
          <View className="flex-row">{renderStars(product.rating)}</View>
          <Text className="text-[10px] text-text-secondary ml-1 font-medium">
            ({product.reviews})
          </Text>
        </View>
      ) : null}

      {/* Price */}
      <View className="flex-row gap-2">
        <Text className="text-sm font-bold text-primary">₹{product.price}</Text>
        {product.originalPrice && (
          <Text className="text-xs text-text-muted line-through">
            ₹{product.originalPrice}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
