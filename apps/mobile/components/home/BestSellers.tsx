import { View, Text, TouchableOpacity, Image } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  badge: string;
  badgeStyle: "bestseller" | "discount";
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Radiance Liquid Foundation",
    price: 899,
    badge: "BESTSELLER",
    badgeStyle: "bestseller",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXmu7iznwH4qnTf6BKTzi7dZlo51ovYsHhoVForDubs80UCnKDsLXo6sT8yta7gSUa1Uo07e4Vh8uC3GfgKyAQ4lw90l0vACEce1vG1b-7bItV2YuA-7wtckWlqUx_TVSznAMpryYMk6YE0edEumCSwr4szuIKPKJ9njyZIn1qFx8rYDRt0Qo_KvMrM0tJsMBLWLlDQY28gd7SCdIAg6vsyx6FOGZ2na8TDR14jai_WgJWb_pbu3Veq8HfeB20q1VNLxOTh-24BpY",
  },
  {
    id: "2",
    name: "Velvet Matte Lipstick",
    price: 559,
    originalPrice: 699,
    badge: "-20%",
    badgeStyle: "discount",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtZCamXqwv1TNUoKS9Rf9YavunpAOo1rn440-pqmUvtP12vAOV6h185YYNyPnD3ygx2DX6jdRtsTG_-axGv0SRz5vqdrcLUhKWJOu223FP3LLKxwHi_2omGSWa3oZ7mpuqHAOpFqzLm-ve7fGTXSkE1QyV6UTJ8IPGdD14qEnkhjLro4zd9Rae9J7_8uP1dTk8Og6hy-frAF3wbrMudi6Pa49fnBOr4xK97R9N7jMvNMVGs2gI5RPe2M1zJfH4iOWBYodWNE44wjg",
  },
];

export function BestSellers() {
  return (
    <View className="overflow-hidden rounded-t-[2.5rem] border-t border-gray-100 bg-white shadow-lg">
      {/* Header */}
      <View className="items-center border-b border-gray-100 px-4 py-3 pt-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-primary pt-4">
          Customer Favorites
        </Text>
        <Text className="mt-1 text-2xl font-bold font-display text-gray-900">
          Best Sellers
        </Text>
      </View>

      {/* Products Grid */}
      <View className="gap-4 px-4 py-6">
        {PRODUCTS.reduce((rows, product, index) => {
          if (index % 2 === 0) rows.push([]);
          rows[rows.length - 1].push(product);
          return rows;
        }, [] as Product[][]).map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-4">
            {row.map((product) => (
              <View key={product.id} className="flex-1">
                {/* Product Image */}
                <View className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-50">
                  <Image
                    source={{ uri: product.image }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                  {/* Badge */}
                  <View
                    className={`absolute left-2 top-2 rounded-full px-2 py-1 z-10 ${
                      product.badgeStyle === "bestseller"
                        ? "bg-white"
                        : "bg-red-500"
                    }`}
                  >
                    <Text
                      className={`text-[0.6rem] font-bold uppercase ${
                        product.badgeStyle === "bestseller"
                          ? "text-primary"
                          : "text-white"
                      }`}
                    >
                      {product.badge}
                    </Text>
                  </View>
                  {/* Add Button */}
                  <TouchableOpacity className="absolute bottom-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <MaterialCommunityIcons
                      name="plus"
                      size={14}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>

                {/* Product Info */}
                <Text className="leading-tight text-base font-semibold text-gray-900 font-display">
                  {product.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  {product.originalPrice && (
                    <Text className="text-xs text-gray-500 line-through">
                      ₹ {product.originalPrice}
                    </Text>
                  )}
                  <Text
                    className={`text-xs font-bold ${
                      product.originalPrice ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    ₹ {product.price}
                  </Text>
                </View>
              </View>
            ))}
            {row.length === 1 && <View className="flex-1" />}
          </View>
        ))}
      </View>
    </View>
  );
}
