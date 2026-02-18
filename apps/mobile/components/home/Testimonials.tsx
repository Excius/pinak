import { View, Text, ScrollView, Image } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Testimonial {
  id: string;
  name: string;
  text: string;
  image: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Ananya S.",
    text: '"The Bridal Kit made me glow on my big day!"',
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9EOPCYTx3zo6i1__i4oWxE5Gc1fpV5mGUsZRdZca8AvvHAu5CsriFBa_Kyo4hzqVvguJZnNHhnwdOae2AmD4Nxjr_qX_4w2pZ7j1mMOBMdGHMUVaAj0lU9z7-EbAItvr7AAORbUROYU_tmnNoO8rNZjVYUxBjNrMjOg1ksNOX3JJc8-VixkdY-KW2UvwRZ2UBH2DwgZJ-I3xz_wo4zIufBWAU1cys60IaYD5kKr2y8HFMirIT1yGY-q2__bl1he1ZImrkYt77gnE",
    rating: 5,
  },
  {
    id: "2",
    name: "Vikram R.",
    text: '"Best quality products I have ever used. Highly recommend!"',
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACSOPTTgDkM9V78NNLN1leDuau6WDiBJtnXgAWb7pp3pLW4_jnTNKhyaxcc5gGRdW8DyWLwGSMiZNwJ_2TpiJsePqOboIsnX4dH9wasRO6iaclv1ZkzcLfkl-ZX2v8C0lQvd-cc6cHzf4SLcO_6MTochuSjHhwKJLWPErlhJn6HXH2zmU5V738wScH8oCShL9eIJJ_rGjVcZuP6uUkLpG2JUWyUoJAODi4MCFv-LxUny7OfT4VN-PoOrpC1E32ZtrDg5AL6a5ncU0",
    rating: 5,
  },
  {
    id: "3",
    name: "Priya K.",
    text: '"Love the shades in the Lipstick Combo. So elegant!"',
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACVhQGOBdvPYtCb5Jnry-5XcfHqVKLJkG0c7kGWzPKPSfQKe6jJ3dGybo7tzmQD57h2ID74m3hcvHGoSSiEEFkhxEok5ZuTPlsFmavfG5S5YPV5gqen8um7FTOjcFYhJBaBWODFEkwgLugaNbbFwmXs68X05hEJNKNSIcvTfjaUeY2PYpUmvFZHGtumZkZg5aIsREXpetEG1ZgYEnx-hdXluaTpsShUbT4lVoyvt9W2EBG_ZqSKBExrtfGlio_MXPzJNxP4nSvq4Y",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <View className="overflow-hidden bg-background-light py-12">
      {/* Header */}
      <View className="mb-8 items-center px-4">
        <Text className="text-lg font-bold uppercase tracking-widest text-primary">
          Testimonials
        </Text>
        {/* <Text className="mt-1 italic text-2xl font-bold font-display text-gray-900">
          Real Testimonialss
        </Text> */}
      </View>

      {/* Testimonials Carousel */}
      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        {TESTIMONIALS.map((testimonial) => (
          <View
            key={testimonial.id}
            className="mr-6 w-80 rounded-2xl border border-primary/10 bg-primary/5 p-6 shadow-sm"
          >
            {/* Avatar */}
            <View className="self-center mb-4 h-16 w-16 overflow-hidden rounded-full border-2 border-primary/20">
              <Image
                source={{ uri: testimonial.image }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>

            {/* Rating */}
            <View className="mb-3 flex-row justify-center gap-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <MaterialCommunityIcons
                  key={i}
                  name="star"
                  size={14}
                  color="#b08d55"
                />
              ))}
            </View>

            {/* Quote */}
            <Text className="mb-4 text-center text-lg leading-relaxed italic text-gray-800 font-display">
              {testimonial.text}
            </Text>

            {/* Name */}
            <Text className="text-center text-xs font-bold uppercase tracking-widest text-primary">
              {testimonial.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
