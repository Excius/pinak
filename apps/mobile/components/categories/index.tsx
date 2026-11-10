import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpertBundles } from "./ExperBundles";
import { CategoryList } from "./CategoryList";

export default function CategoriesLayout() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface-light">
      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        <CategoryList />
        <ExpertBundles onPress={() => router.push("/sections")} />
      </ScrollView>
    </SafeAreaView>
  );
}
