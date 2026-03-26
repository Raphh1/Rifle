import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/api/socialQueries";
import type { Notification, NotificationType } from "@/types/social";

const notifIcons: Record<NotificationType, React.ComponentProps<typeof Ionicons>["name"]> = {
  friend_request: "person-add",
  friend_accepted: "people",
  room_invite: "chatbubbles",
  new_message: "chatbubble",
  event_reminder: "calendar",
  review_received: "star",
};

function NotificationItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: () => void;
}) {
  const time = new Date(notif.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      className={`flex-row p-4 mb-2 rounded-2xl border ${
        notif.read
          ? "bg-dark-800 border-dark-700"
          : "bg-indigo-600/10 border-indigo-600/30"
      }`}
      onPress={onRead}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-indigo-600/20 items-center justify-center mr-3">
        <Ionicons
          name={notifIcons[notif.type] ?? "notifications"}
          size={20}
          color="#6366f1"
        />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold">{notif.title}</Text>
        {notif.body && (
          <Text className="text-dark-400 text-sm mt-0.5" numberOfLines={2}>
            {notif.body}
          </Text>
        )}
        <Text className="text-dark-600 text-xs mt-1">{time}</Text>
      </View>
      {!notif.read && (
        <View className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1" />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data ?? [];

  return (
    <View className="flex-1 bg-dark-900">
      {notifications.length > 0 && (
        <View className="px-4 pt-4">
          <TouchableOpacity
            className="self-end"
            onPress={() => markAllAsRead.mutate()}
          >
            <Text className="text-indigo-400 font-medium">
              Tout marquer comme lu
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => (
            <NotificationItem
              notif={item}
              onRead={() => {
                if (!item.read) markAsRead.mutate(item.id);
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons
                name="notifications-outline"
                size={48}
                color="#475569"
              />
              <Text className="text-dark-500 text-base mt-4">
                Aucune notification
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
