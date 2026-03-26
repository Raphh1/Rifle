import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/context/useAuth";
import { registerSchema } from "@/utils/validation";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setErrors({});

    const result = registerSchema.safeParse({ name, email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      router.replace("/(tabs)/events");
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Inscription impossible",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-indigo-500">Rifle</Text>
          <Text className="text-dark-400 mt-2">Creez votre compte</Text>
        </View>

        {errors.form && (
          <View className="bg-red-500/20 rounded-xl p-3 mb-4">
            <Text className="text-red-400 text-center">{errors.form}</Text>
          </View>
        )}

        <View className="gap-4">
          <View>
            <Text className="text-dark-300 mb-1 ml-1">Nom</Text>
            <TextInput
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white"
              placeholder="Votre nom"
              placeholderTextColor="#64748b"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
            {errors.name && (
              <Text className="text-red-400 text-sm mt-1 ml-1">
                {errors.name}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-dark-300 mb-1 ml-1">Email</Text>
            <TextInput
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white"
              placeholder="email@exemple.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && (
              <Text className="text-red-400 text-sm mt-1 ml-1">
                {errors.email}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-dark-300 mb-1 ml-1">Mot de passe</Text>
            <TextInput
              className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white"
              placeholder="Min. 6 caracteres"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {errors.password && (
              <Text className="text-red-400 text-sm mt-1 ml-1">
                {errors.password}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className="bg-indigo-600 rounded-xl py-4 items-center mt-2"
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                S'inscrire
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-dark-400">Deja un compte ? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-indigo-400 font-semibold">
                Se connecter
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
