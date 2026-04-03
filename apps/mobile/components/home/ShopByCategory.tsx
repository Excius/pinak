import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";

interface Category {
  id: string;
  name: string;
  image: string;
  hasGradient?: boolean;
}

const CATEGORIES: Category[] = [
  {
    id: "lips",
    name: "Lips",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAROZyFguGF_qE3UIvDCtjGSbbBrLyC6GMKxGk55udiUUxM8lRABTUKbOtbCVoH9PZWTeMZMxYI3qX8ND8z1h-bPhLzX2XkMgLM8f3ZVkFm9dWxs1Gl6QPZhP6-JBY5dhJEzlnkdlV5FbZwJJYLKN-N8SmX5BYNXt-eZELzElyv5dfRd3kKqNS3okco8DoPKgwiqoiLwPi__ESmVPK7pXFLLdoqCrlRuXGIRGxbziUn9YCdDMjDg82q5L4OhAdpzAPKTy0cpQPy-OM",
    hasGradient: true,
  },
  {
    id: "face",
    name: "Face",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_j8yD9DHW29mHnnddf_ulUuyvgRSlVpd7WOvHqGzyrI2P0WjITqrHksEYsluf9wuc50_DDVGm7Y92OFIc_nh4ul5cddIS7BVPwYwTlDoEjb9WG7JxzXuJiSyB7mOVXnxDVVfoMBthI3A00RrHKxUemB6OauNwcgYlIAcAbA_S4XCU2rs4LPGxRvSHTBzpVo-Cahzif-q28vx9eRzuvD446uP7ykBD_wH5LNioMbgOtU8zIqhyfiYn2KoW_LrhR19GjAnr1vXal40",
  },
  {
    id: "eyes",
    name: "Eyes",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqoshkVYjHr4VmbU-Ap9-EvjeIUt8rSi5544INEEP4YLWhzfix4IDDVzbJ0wvS2uA899j6NdY8teQWhApAKP9o9Bq5fqdDvu79iVRpBne_Tq4QitnbqeNiBVVwFjDhwDscu5YwNI3Ii8FZOAPmRK9eLiP17FvfjJ0ywbVWe8ISZf5kkXlgXSh9At6CcraSr5wy-2alEruwi-FPu4wffuahWw31bTkHeqYfgTLV8_teV8IMI7Tyd975_Wg21ry5eJmNk-Cemb1XdIs",
  },
  {
    id: "skincare",
    name: "Skin",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBJxE2dGD3oW_hM50y1Q6caaBYNXL4LsPlod-2TPiXlZ8P95rl9OJQBc27IkaCgqt35uys5MZSHqZBu4rIYh_WLGZYEgXOMGixdPqZPxeiQE0JMD8-K97cfwzwXiQGOU4B3lNGvBcr4P53MADga1vFA0jSlfekEiO61MQpJrrP1UMzJSi-87HsQO2lgDehRYYaWu3tBwrBcRJ1Vlt9wIQKv8Sp7kleZujlLfptB3LtjDX6KXuUCkzgfJk6DCkfmnds3_M4SKLm2Apw",
  },
];

export function ShopByCategory() {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  return (
    <View className="py-6">
      <View className="mb-4 flex-row items-end justify-between px-4">
        <Text className="text-xl font-bold font-display text-text-primary">
          Shop by Category
        </Text>
        <TouchableOpacity onPress={() => router.push("/categories")}>
          <Text className="text-xs font-bold uppercase tracking-wider text-primary">
            See All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            className="mr-6 items-center gap-3"
          >
            <View
              className={`h-28 w-28 rounded-full border-2 border-primary/30 p-1 ${
                category.hasGradient ? "bg-primary/20" : "bg-surface"
              }`}
            >
              <View className="h-full w-full overflow-hidden rounded-full border-2 border-surface-border">
                <Image
                  source={{ uri: category.image }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
            </View>
            <Text className="text-sm font-semibold text-text-primary">
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
