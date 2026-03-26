import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEventDetail, useBuyTicket, useDeleteEvent } from "@/api/queries";
import {
  useFavoriteStatus,
  useToggleFavorite,
  useEventRating,
} from "@/api/socialQueries";
import { useAuth } from "@/context/useAuth";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: event, isLoading } = useEventDetail(id);
  const { data: favoriteStatus } = useFavoriteStatus(id);
  const { data: rating } = useEventRating(id);
  const toggleFavorite = useToggleFavorite();
  const buyTicket = useBuyTicket();
  const deleteEvent = useDeleteEvent();

  if (isLoading || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-dark-900">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const date = new Date(event.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isOwner =
    user?.id === event.organizer?.id || user?.role === "admin";
  const canBuy = event.remaining > 0 && !event.deletedAt;

  const handleBuy = () => {
    Alert.alert(
      "Acheter un billet",
      `Confirmer l'achat pour "${event.title}" (${event.price === 0 ? "Gratuit" : `${event.price} \u20ac`}) ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () =>
            buyTicket.mutate(event.id, {
              onSuccess: () =>
                Alert.alert("Billet achete !", "Retrouvez-le dans vos billets."),
              onError: (err) =>
                Alert.alert("Erreur", err.message),
            }),
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer l'evenement",
      "Cette action est irreversible. Les billets seront annules.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () =>
            deleteEvent.mutate(event.id, {
              onSuccess: () => router.back(),
              onError: (err) => Alert.alert("Erreur", err.message),
            }),
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-dark-900">
      {event.imageUrl && (
        <Image
          source={{ uri: event.imageUrl }}
          className="w-full h-64"
          resizeMode="cover"
        />
      )}

      <View className="px-4 py-6">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 mr-4">
            <View className="bg-indigo-600/20 rounded-full px-3 py-1 self-start mb-2">
              <Text className="text-indigo-400 text-xs font-semibold capitalize">
                {event.category}
              </Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {event.title}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              toggleFavorite.mutate({
                eventId: event.id,
                isFavorited: favoriteStatus?.isFavorited ?? false,
              })
            }
            className="mt-1"
          >
            <Ionicons
              name={favoriteStatus?.isFavorited ? "heart" : "heart-outline"}
              size={28}
              color={favoriteStatus?.isFavorited ? "#ef4444" : "#94a3b8"}
            />
          </TouchableOpacity>
        </View>

        {/* Rating */}
        {rating && rating.count > 0 && (
          <View className="flex-row items-center mb-4">
            <Ionicons name="star" size={16} color="#eab308" />
            <Text className="text-yellow-500 font-semibold ml-1">
              {rating.average.toFixed(1)}
            </Text>
            <Text className="text-dark-500 ml-1">({rating.count} avis)</Text>
          </View>
        )}

        {/* Info cards */}
        <View className="bg-dark-800 rounded-2xl p-4 mb-4 gap-3 border border-dark-700">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="#6366f1" />
            <Text className="text-dark-200 ml-3">{date}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#6366f1" />
            <Text className="text-dark-200 ml-3">{event.location}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={18} color="#6366f1" />
            <Text className="text-dark-200 ml-3">
              {event.remaining} / {event.capacity} places restantes
            </Text>
          </View>
          {event.organizer && (
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={18} color="#6366f1" />
              <Text className="text-dark-200 ml-3">
                Par {event.organizer.name}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-dark-300 text-base font-semibold mb-2">
            Description
          </Text>
          <Text className="text-dark-400 leading-6">{event.description}</Text>
        </View>

        {/* Actions */}
        <View className="gap-3">
          {canBuy && (
            <TouchableOpacity
              className="bg-indigo-600 rounded-xl py-4 items-center"
              onPress={handleBuy}
              disabled={buyTicket.isPending}
              activeOpacity={0.8}
            >
              {buyTicket.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Acheter - {event.price === 0 ? "Gratuit" : `${event.price} \u20ac`}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {isOwner && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-dark-700 rounded-xl py-3 items-center"
                onPress={() =>
                  router.push(`/(tabs)/events/edit?id=${event.id}`)
                }
              >
                <Text className="text-white font-semibold">Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600/20 border border-red-600 rounded-xl py-3 items-center"
                onPress={handleDelete}
              >
                <Text className="text-red-400 font-semibold">Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
