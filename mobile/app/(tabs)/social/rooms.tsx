import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMyRooms } from "@/api/socialQueries";
import type { Room } from "@/types/social";

function RoomCard({ room }: { room: Room }) {
  const lastMsg = room.lastMessage;

  return (
    <TouchableOpacity
      className="bg-dark-800 rounded-2xl p-4 mb-3 border border-dark-700"
      onPress={() => router.push(`/(tabs)/social/chat?roomId=${room.id}`)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-start justify-between mb-1">
        <Text className="text-white font-bold text-base flex-1 mr-2" numberOfLines={1}>
          {room.name}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={14} color="#64748b" />
          <Text className="text-dark-500 text-xs ml-1">
            {room.membersCount}
          </Text>
        </View>
      </View>

      {room.event && (
        <Text className="text-indigo-400 text-sm mb-2">{room.event.title}</Text>
      )}

      {lastMsg && (
        <Text className="text-dark-400 text-sm" numberOfLines={1}>
          <Text className="text-dark-300 font-medium">
            {lastMsg.sender.name}:{" "}
          </Text>
          {lastMsg.content}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function RoomsScreen() {
  const { data: rooms, isLoading, refetch, isRefetching } = useMyRooms();

  return (
    <View className="flex-1 bg-dark-900">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={rooms ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => <RoomCard room={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="chatbubbles-outline" size={48} color="#475569" />
              <Text className="text-dark-500 text-base mt-4">
                Aucun salon
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
