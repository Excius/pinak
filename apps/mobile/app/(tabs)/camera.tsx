import { View, Text, Button } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { useEffect, useState } from "react";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) return null;

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Camera permission is required</Text>
        <Button
          title="Grant permission"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        />
      </View>
    );
  }

  return <CameraView style={{ flex: 1 }} />;
}
