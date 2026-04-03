import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpertBundles } from "./ExperBundles";
import { CategoryList } from "./CategoryList";

export default function CategoriesLayout() {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 px-4 py-6">
        <CategoryList />
        <ExpertBundles />

        {/* Spacer for bottom nav */}
        <View className="h-28" />
      </ScrollView>
    </SafeAreaView>
  );
}
