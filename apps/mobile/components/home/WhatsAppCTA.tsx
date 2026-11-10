import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  getWhatsAppContact,
  type WhatsAppContact,
} from "@/services/content.service";
import { getStores } from "@/services/store.service";

export function WhatsAppAndStoreCTA() {
  const [contact, setContact] = useState<WhatsAppContact | null>(null);
  const [isFindingStore, setIsFindingStore] = useState(false);

  useEffect(() => {
    const loadContactDetails = async () => {
      try {
        const whatsappContact = await getWhatsAppContact();
        setContact(whatsappContact);
      } catch (error) {
        console.error("Failed to load contact details:", error);
      }
    };

    void loadContactDetails();
  }, []);

  const handleStoreLocator = async () => {
    if (isFindingStore) return;

    setIsFindingStore(true);
    try {
      const Location = await import("expo-location");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Location Permission Required",
          "Allow location access to find the nearest store.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const stores = await getStores({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      const store = stores.items[0];

      if (!store) {
        Alert.alert("No Nearby Store", "No active stores were found nearby.");
        return;
      }

      const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error finding nearby store:", error);
      const message =
        error instanceof Error && error.message.includes("ExpoLocation")
          ? "Please rebuild the mobile app after installing the location package."
          : "Please try again later.";
      Alert.alert("Unable to Find Store", message);
    } finally {
      setIsFindingStore(false);
    }
  };

  const handleWhatsAppPress = async () => {
    if (!contact) {
      Alert.alert("WhatsApp Unavailable", "Please try again later.", [
        { text: "OK" },
      ]);
      return;
    }

    const phoneNumber = contact.whatsappNumber.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(contact.defaultMessage);
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    const webUrl = `https://wa.me/${phoneNumber}?text=${message}`;

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
      console.error("Error opening WhatsApp:", error);
      Alert.alert(
        "WhatsApp Not Available",
        "Please make sure WhatsApp is installed on your device.",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <View className="bg-surface px-4 py-8 md:px-6 md:py-12 border-t border-surface-border">
      <View className="mx-auto w-full max-w-md items-center gap-6 md:gap-8">
        {/* Heading */}
        <Text className="text-center text-xl md:text-2xl font-bold text-text-primary font-display px-2">
          Need expert help or prefer store pickup?
        </Text>

        {/* Buttons */}
        <View className="w-full gap-3 md:gap-4">
          {/* Store Locator Button */}
          <TouchableOpacity
            onPress={handleStoreLocator}
            disabled={isFindingStore}
            className="w-full rounded-full border-2 border-primary py-4 md:py-4 min-h-[48px] flex items-center justify-center"
            style={{ opacity: isFindingStore ? 0.6 : 1 }}
          >
            <Text className="text-center font-bold text-primary text-base md:text-base">
              {isFindingStore
                ? "Finding Nearby Store..."
                : "Find a Store Near You"}
            </Text>
          </TouchableOpacity>

          {/* WhatsApp Button */}
          <TouchableOpacity
            className="w-full flex-row items-center justify-center gap-2 rounded-full bg-whatsapp py-4 md:py-4 shadow-lg shadow-whatsapp/20 min-h-[48px]"
            onPress={handleWhatsAppPress}
          >
            <MaterialCommunityIcons name="whatsapp" size={24} color="white" />
            <Text className="font-bold text-text-primary text-base md:text-base">
              Chat on WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
