import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export function WhatsAppCTA() {
  const handleWhatsAppPress = async () => {
    const phoneNumber = '917688992293';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
    const webUrl = `https://wa.me/${phoneNumber}`;

    try {
      // Try WhatsApp app first
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to web WhatsApp
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert(
        'WhatsApp Not Available',
        'Please make sure WhatsApp is installed on your device.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View className="bg-white px-4 py-8 md:px-6 md:py-12">
      <View className="mx-auto w-full max-w-md items-center gap-6 md:gap-8">
        {/* Heading */}
        <Text className="text-center text-xl md:text-2xl font-bold text-gray-900 font-display px-2">
          Need expert help or prefer store pickup?
        </Text>

        {/* Buttons */}
        <View className="w-full gap-3 md:gap-4">
          {/* Store Locator Button */}
          <TouchableOpacity className="w-full rounded-full border-2 border-primary py-4 md:py-4 min-h-[48px] flex items-center justify-center">
            <Text className="text-center font-bold text-primary text-base md:text-base">
              Find a Store Near You
            </Text>
          </TouchableOpacity>

          {/* WhatsApp Button */}
          <TouchableOpacity 
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-whatsapp py-4 md:py-4 shadow-lg shadow-whatsapp/20 min-h-[48px]"
            onPress={handleWhatsAppPress}
          >
            <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
            <Text className="font-bold text-white text-base md:text-base">
              Chat on WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
