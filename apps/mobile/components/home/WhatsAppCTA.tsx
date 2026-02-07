import { View, Text, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export function WhatsAppCTA() {
  return (
    <View className="bg-white px-6 py-12">
      <View className="mx-auto max-w-md items-center gap-8">
        {/* Heading */}
        <Text className="text-center text-2xl font-bold text-gray-900 font-display">
          Need expert help or prefer store pickup?
        </Text>

        {/* Buttons */}
        <View className="w-full gap-4">
          {/* Store Locator Button */}
          <TouchableOpacity className="w-full rounded-full border-2 border-primary py-4">
            <Text className="text-center font-bold text-primary">
              Find a Store Near You
            </Text>
          </TouchableOpacity>

          {/* WhatsApp Button */}
          <TouchableOpacity className="w-full flex-row items-center justify-center gap-2 rounded-full bg-whatsapp py-4 shadow-lg shadow-whatsapp/20">
            <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
            <Text className="font-bold text-white">Chat on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
