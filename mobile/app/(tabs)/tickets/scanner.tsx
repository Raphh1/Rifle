import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useValidateTicket } from "@/api/queries";

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const validateTicket = useValidateTicket();

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-900">
        <Text className="text-dark-400">Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-900 px-6">
        <Ionicons name="camera-outline" size={64} color="#475569" />
        <Text className="text-dark-300 text-center text-base mt-4 mb-6">
          Rifle a besoin de la camera pour scanner les QR codes des billets.
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl py-3 px-8"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Autoriser la camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    validateTicket.mutate(
      { qrCode: data },
      {
        onSuccess: (result) => {
          Alert.alert(
            "Billet valide !",
            result.message,
            [{ text: "OK", onPress: () => setScanned(false) }]
          );
        },
        onError: (err) => {
          Alert.alert(
            "Erreur",
            err.message || "QR code invalide",
            [{ text: "OK", onPress: () => setScanned(false) }]
          );
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-dark-900">
      <CameraView
        className="flex-1"
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarCodeScanned}
      >
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-2 border-indigo-500 rounded-3xl" />
          <Text className="text-white mt-6 text-base font-medium">
            Placez le QR code dans le cadre
          </Text>
        </View>
      </CameraView>

      {scanned && (
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <TouchableOpacity
            className="bg-indigo-600 rounded-xl py-3 px-8"
            onPress={() => setScanned(false)}
          >
            <Text className="text-white font-semibold">
              Scanner a nouveau
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
