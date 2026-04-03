import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { CategoryCard } from "./CategoryCard";
import { useCategoryStore } from "@/store/category/store";

const CATEGORIES = [
  {
    id: "lips",
    title: "Lips",
    subtitle: "STATEMENT PIGMENTS",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDK_6pB0kghFue2TUvz4CW72mUue4O_cWX4ygEGKuz77YuZaNWvaUxxdqr5p7DNtGVLRC8ekSDtgY5-8Jk3KzXiR8Qo8B6yOnFwthwpvpXDPUUszv94wKynBw4md1zgPvsOt-ot5nMMojRXHD9HlvvsT0vo1EvfIZLvxW_N39_ONBho8Nd4P_7PJWOIgP-8-ckqmAu3IlSWrH8HzDfLZE4mCv8MdiC2U3EfKJJ8RvKw4IcL4vUhPJeK6aOnkjK6ItG9jwxQ8-7DaPw",
  },
  {
    id: "eyes",
    title: "Eyes",
    subtitle: "DEFINED & LUMINOUS",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgF3WRpfDUN58i0tV1D1nMUYlC4VnFW3cl_8sEJFzSoxt5D0VVFxMHw2_S4t165YjWh69k9iIjrI2wD_i4sTErkP6fSR_x8hx4fYJFUENba6Npixom_kG2aMTCylkS63AyUijf4Ero2UGRdSSmezAc2yxwVPn_3ofRO9aMmX6bHPicnbnzgc-Ixcq7o9Hvp2NDaeaB66OTxEWlrKEodXIeVdz_tlV3cJ9-Y4BHZgiAEvP5Vca_dPy0HUs1Nq0hyuiYsoXedJd9IVA",
  },
  {
    id: "face",
    title: "Face",
    subtitle: "FLAWLESS GLOW",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgdhlMGc4OQ2oy4ze8gfCY4wYUcajDX1_LT-a1KXKF0Gt5RPFV21noNxkXgydtab-3uMflTDWNsnULfJhICLNSfVxv_S64okiaJKmyvoH3eAM6S_msRDL7tnC1P87gHWt7Gfyfh9E2tS3XqQ1_89cOqGi0uzIeBSPFIQKhHsl-YAC_aCdeoYdQzor-g3kE01wZ6q9a1dvMUNRi-vTPA5tsyPkoC7lgtiKYmlh6V0DDO2y4wZ14FevFS1cqgzYHX7CPOVSys3fnT_g",
  },
  {
    id: "skincare",
    title: "Skincare",
    subtitle: "PURE RADIANCE",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBEEIx79Y5z9Kqec_zbVB23sXahA7BQp9UDSlfXQ0JsPrj1UNb1yW74mh7sCB2xn023FniLEUnnd7JqxBPSvXdUONX-bMyM08qCw0RKfd5V8Q6OT5QkuA-0vTwW98LtFGDOj7ak8BKGaFOGbRatoHDKqKjupce7F4dToYt4_SmuOB4RgsY_Pxtg-NjlUtT46KKuSdAqBL6mZCFUJL3wGlJTqte0ZhoDGdT798ljSd0f3IehTP2h_C82Wl_v5aEjG-tTKke6soUPodo",
  },
];

export function CategoryList() {
  const router = useRouter();
  const selectCategory = useCategoryStore((state) => state.selectCategory);

  const handleCategoryPress = (categoryId: string) => {
    selectCategory(categoryId);
    router.push(`/categories/${categoryId}`);
  };

  return (
    <View className="gap-4">
      {CATEGORIES.map((category) => (
        <CategoryCard
          key={category.id}
          title={category.title}
          subtitle={category.subtitle}
          imageUrl={category.imageUrl}
          onPress={() => handleCategoryPress(category.id)}
        />
      ))}
    </View>
  );
}
