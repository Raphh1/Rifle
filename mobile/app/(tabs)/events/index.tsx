import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEvents, useCategories } from "@/api/queries";
import type { Event, EventCategory } from "@/types/api";

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      className="bg-dark-800 rounded-2xl overflow-hidden mb-4 border border-dark-700"
      onPress={() => router.push(`/(tabs)/events/${event.id}`)}
      activeOpacity={0.7}
    >
      {event.imageUrl && (
        <Image
          source={{ uri: event.imageUrl }}
          className="w-full h-40"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="bg-indigo-600/20 rounded-full px-3 py-1">
            <Text className="text-indigo-400 text-xs font-semibold capitalize">
              {event.category}
            </Text>
          </View>
          <Text className="text-dark-400 text-xs">{date}</Text>
        </View>

        <Text className="text-white text-lg font-bold mb-1">
          {event.title}
        </Text>

        <View className="flex-row items-center mb-2">
          <Ionicons name="location-outline" size={14} color="#94a3b8" />
          <Text className="text-dark-400 text-sm ml-1">{event.location}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-indigo-400 font-bold text-lg">
            {event.price === 0 ? "Gratuit" : `${event.price} \u20ac`}
          </Text>
          <Text className="text-dark-500 text-xs">
            {event.remaining}/{event.capacity} places
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventListScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | ""
  >("");
  const { data, isLoading, refetch, isRefetching } = useEvents(page, 10, {
    search: search || undefined,
    category: selectedCategory || undefined,
  });
  const { data: categories } = useCategories();

  const events = data?.data ?? [];
  const meta = data?.meta;

  return (
    <View className="flex-1 bg-dark-900">
      {/* Search bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl px-4">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            className="flex-1 py-3 px-3 text-white"
            placeholder="Rechercher un evenement..."
            placeholderTextColor="#64748b"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ value: "", label: "Tous" }, ...(categories ?? [])]}
        keyExtractor={(item) => item.value || "all"}
        contentContainerClassName="px-4 py-2"
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full border ${
              selectedCategory === item.value
                ? "bg-indigo-600 border-indigo-500"
                : "bg-dark-800 border-dark-700"
            }`}
            onPress={() => {
              setSelectedCategory(item.value as EventCategory | "");
              setPage(1);
            }}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === item.value
                  ? "text-white"
                  : "text-dark-400"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Events list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pb-4"
          renderItem={({ item }) => <EventCard event={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#6366f1"
            />
          }
          onEndReached={() => {
            if (meta && page < meta.last_page) setPage((p) => p + 1);
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="calendar-outline" size={48} color="#475569" />
              <Text className="text-dark-500 text-base mt-4">
                Aucun evenement trouve
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
