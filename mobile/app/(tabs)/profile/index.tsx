import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/useAuth";
import {
  useUpdateProfile,
  useUpdatePassword,
  useDeleteAccount,
} from "@/api/queries";

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const deleteAccount = useDeleteAccount();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("name", name);

    updateProfile.mutate(formData, {
      onSuccess: () => {
        refreshUser();
        Alert.alert("Profil mis a jour !");
      },
      onError: (err) => Alert.alert("Erreur", err.message),
    });
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as unknown as Blob);

      updateProfile.mutate(formData, {
        onSuccess: () => {
          refreshUser();
          Alert.alert("Avatar mis a jour !");
        },
        onError: (err) => Alert.alert("Erreur", err.message),
      });
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return;

    updatePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          Alert.alert("Mot de passe modifie !");
        },
        onError: (err) => Alert.alert("Erreur", err.message),
      }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irreversible. Toutes vos donnees seront supprimees.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () =>
            deleteAccount.mutate(undefined, {
              onSuccess: () => {
                logout();
                router.replace("/(auth)/login");
              },
            }),
        },
      ]
    );
  };

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      className="flex-1 bg-dark-900"
      contentContainerClassName="px-4 py-6"
    >
      {/* Avatar */}
      <View className="items-center mb-6">
        <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.7}>
          <View className="w-24 h-24 rounded-full bg-indigo-600/20 items-center justify-center border-2 border-indigo-600">
            <Ionicons name="person" size={40} color="#6366f1" />
          </View>
          <View className="absolute bottom-0 right-0 bg-indigo-600 w-8 h-8 rounded-full items-center justify-center">
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold mt-3">{user?.name}</Text>
        <Text className="text-dark-400">{user?.email}</Text>
        <View className="bg-indigo-600/20 rounded-full px-3 py-1 mt-2">
          <Text className="text-indigo-400 text-xs font-semibold capitalize">
            {user?.role}
          </Text>
        </View>
      </View>

      {/* Edit name */}
      <View className="bg-dark-800 rounded-2xl p-4 mb-4 border border-dark-700">
        <Text className="text-white font-semibold mb-3">Modifier le nom</Text>
        <TextInput
          className="bg-dark-700 rounded-xl px-4 py-3 text-white mb-3"
          value={name}
          onChangeText={setName}
          placeholder="Votre nom"
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl py-3 items-center"
          onPress={handleUpdateProfile}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change password */}
      <View className="bg-dark-800 rounded-2xl p-4 mb-4 border border-dark-700">
        <Text className="text-white font-semibold mb-3">
          Changer le mot de passe
        </Text>
        <TextInput
          className="bg-dark-700 rounded-xl px-4 py-3 text-white mb-3"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mot de passe actuel"
          placeholderTextColor="#64748b"
          secureTextEntry
        />
        <TextInput
          className="bg-dark-700 rounded-xl px-4 py-3 text-white mb-3"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nouveau mot de passe"
          placeholderTextColor="#64748b"
          secureTextEntry
        />
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl py-3 items-center"
          onPress={handleChangePassword}
          disabled={updatePassword.isPending}
        >
          {updatePassword.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">
              Changer le mot de passe
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View className="gap-3 mt-2">
        <TouchableOpacity
          className="bg-dark-800 border border-dark-700 rounded-xl py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold">Se deconnecter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600/10 border border-red-600/50 rounded-xl py-4 items-center"
          onPress={handleDeleteAccount}
        >
          <Text className="text-red-400 font-semibold">
            Supprimer le compte
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
