import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTransferTicket } from "@/api/queries";

export default function TransferTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [email, setEmail] = useState("");
  const transfer = useTransferTicket();

  const handleTransfer = () => {
    if (!email.trim()) return;

    Alert.alert(
      "Transferer le billet",
      `Confirmer le transfert vers ${email} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Transferer",
          onPress: () =>
            transfer.mutate(
              { ticketId: id, email },
              {
                onSuccess: () => {
                  Alert.alert("Billet transfere !", "", [
                    { text: "OK", onPress: () => router.back() },
                  ]);
                },
                onError: (err) => Alert.alert("Erreur", err.message),
              }
            ),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-900 px-6 justify-center"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text className="text-white text-2xl font-bold mb-2">
        Transferer un billet
      </Text>
      <Text className="text-dark-400 mb-6">
        Entrez l'email du destinataire.
      </Text>

      <TextInput
        className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white mb-4"
        placeholder="email@exemple.com"
        placeholderTextColor="#64748b"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        className="bg-indigo-600 rounded-xl py-4 items-center"
        onPress={handleTransfer}
        disabled={transfer.isPending}
      >
        {transfer.isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-base">
            Confirmer le transfert
          </Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
