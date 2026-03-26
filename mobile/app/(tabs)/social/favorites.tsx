import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyFavorites } from "@/api/socialQueries";
import type { FavoriteEvent } from "@/types/social";

function FavoriteCard({ event }: { event: FavoriteEvent }) {
  const date = new Date(event.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <TouchableOpacity
      className="bg-dark-800 rounded-2xl overflow-hidden mb-3 border border-dark-700 flex-row"
      onPress={() => router.push(`/(tabs)/events/${event.id}`)}
      activeOpacity={0.7}
    >
      {event.imageUrl && (
        <Image
          source={{ uri: event.imageUrl }}
          className="w-24 h-24"
          resizeMode="cover"
        />
      )}
      <View className="flex-1 p-3 justify-center">
        <Text className="text-white font-bold" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="text-dark-400 text-sm mt-1">{date}</Text>
        <Text className="text-indigo-400 text-sm mt-1">
          {event.price === 0 ? "Gratuit" : `${event.price} \u20ac`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FavoritesScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyFavorites(page);

  return (
    <View className="flex-1 bg-dark-900">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => <FavoriteCard event={item} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="heart-outline" size={48} color="#475569" />
              <Text className="text-dark-500 text-base mt-4">
                Aucun favori
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
