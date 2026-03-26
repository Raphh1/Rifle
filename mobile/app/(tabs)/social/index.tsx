import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFriends, useFriendRequests, useMyRooms, useUnreadCount } from "@/api/socialQueries";

interface MenuItemProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  badge?: number;
  onPress: () => void;
}

function MenuItem({ icon, title, subtitle, badge, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity
      className="bg-dark-800 rounded-2xl p-4 flex-row items-center border border-dark-700"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 rounded-full bg-indigo-600/20 items-center justify-center mr-4">
        <Ionicons name={icon} size={24} color="#6366f1" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{title}</Text>
        <Text className="text-dark-400 text-sm">{subtitle}</Text>
      </View>
      {badge !== undefined && badge > 0 && (
        <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center mr-2">
          <Text className="text-white text-xs font-bold">{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#475569" />
    </TouchableOpacity>
  );
}

export default function SocialScreen() {
  const { data: friends } = useFriends();
  const { data: requests } = useFriendRequests();
  const { data: rooms } = useMyRooms();
  const { data: unread } = useUnreadCount();

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-4 py-4 gap-3">
      <Text className="text-white text-2xl font-bold mb-2">Social</Text>

      <MenuItem
        icon="heart"
        title="Favoris"
        subtitle="Vos evenements favoris"
        onPress={() => router.push("/(tabs)/social/favorites")}
      />
      <MenuItem
        icon="people"
        title="Amis"
        subtitle={`${friends?.length ?? 0} amis`}
        badge={requests?.length}
        onPress={() => router.push("/(tabs)/social/friends")}
      />
      <MenuItem
        icon="chatbubbles"
        title="Salons"
        subtitle={`${rooms?.length ?? 0} salons`}
        onPress={() => router.push("/(tabs)/social/rooms")}
      />
      <MenuItem
        icon="notifications"
        title="Notifications"
        subtitle="Vos notifications"
        badge={unread?.count}
        onPress={() => router.push("/(tabs)/social/notifications")}
      />
    </ScrollView>
  );
}
