import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import {
  getWhatsAppContact,
  type WhatsAppContact,
} from "@/services/content.service";

export default function ContactScreen() {
  const [contact, setContact] = useState<WhatsAppContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWhatsAppContact()
      .then(setContact)
      .catch((reason) => {
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load contact details",
        );
      });
  }, []);

  const openWhatsApp = () => {
    if (!contact) return;
    const number = contact.whatsappNumber.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      contact.defaultMessage || "Hello Pinak!",
    );
    void Linking.openURL(`https://wa.me/${number}?text=${message}`).catch(
      () => {
        setError("Unable to open WhatsApp. Please try again.");
      },
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-surface-border px-4 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 rounded-full bg-surface-light p-2"
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#C9A962" />
        </Pressable>
        <Text className="font-display text-2xl font-bold text-text-primary">
          Contact Us
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 rounded-2xl border border-primary/20 bg-surface p-5">
          <MaterialCommunityIcons
            name="heart-outline"
            size={30}
            color="#C9A962"
          />
          <Text className="mt-4 font-display text-2xl font-bold text-text-primary">
            We&apos;re here to help
          </Text>
          <Text className="mt-2 text-base leading-6 text-text-secondary">
            Have a question about an order, product, or your Pinak experience?
            Our team would love to hear from you.
          </Text>
          <Pressable
            disabled={!contact}
            onPress={openWhatsApp}
            className="mt-5 flex-row items-center justify-center rounded-xl bg-primary px-4 py-3"
          >
            {contact ? (
              <>
                <MaterialCommunityIcons
                  name="whatsapp"
                  size={21}
                  color="#0A0A0A"
                />
                <Text className="ml-2 font-semibold text-background">
                  Chat on WhatsApp
                </Text>
              </>
            ) : (
              <ActivityIndicator color="#0A0A0A" />
            )}
          </Pressable>
        </View>

        <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
          Get in touch
        </Text>
        {error ? (
          <Text className="mb-3 text-sm text-red-400">{error}</Text>
        ) : null}
        <View className="rounded-2xl border border-surface-border bg-surface p-5">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#C9A962"
            />
            <View className="ml-4 flex-1">
              <Text className="text-sm text-text-secondary">Email</Text>
              <Text className="mt-1 text-base font-semibold text-text-primary">
                {contact?.supportEmail || "Loading..."}
              </Text>
            </View>
          </View>
          <View className="mt-5 flex-row items-center">
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color="#C9A962"
            />
            <View className="ml-4 flex-1">
              <Text className="text-sm text-text-secondary">
                Phone / WhatsApp
              </Text>
              <Text className="mt-1 text-base font-semibold text-text-primary">
                {contact?.supportPhone || "Loading..."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
