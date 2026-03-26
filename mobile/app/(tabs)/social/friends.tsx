import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFriends,
  useFriendRequests,
  useSearchUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
} from "@/api/socialQueries";
import type { Friend, FriendRequest, SearchUser } from "@/types/social";

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: friends, isLoading } = useFriends();
  const { data: requests } = useFriendRequests();
  const { data: searchResults } = useSearchUsers(searchQuery);
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const removeFriend = useRemoveFriend();

  const handleRemove = (userId: string, name: string) => {
    Alert.alert("Retirer l'ami", `Retirer ${name} de vos amis ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Retirer",
        style: "destructive",
        onPress: () => removeFriend.mutate(userId),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-dark-900">
      {/* Search */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl px-4">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            className="flex-1 py-3 px-3 text-white"
            placeholder="Rechercher un utilisateur..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {searchQuery.length >= 2 && searchResults ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-2"
          renderItem={({ item }: { item: SearchUser }) => (
            <View className="bg-dark-800 rounded-xl p-3 mb-2 flex-row items-center border border-dark-700">
              <View className="w-10 h-10 rounded-full bg-indigo-600/20 items-center justify-center mr-3">
                <Text className="text-indigo-400 font-bold">
                  {item.name[0]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">{item.name}</Text>
                <Text className="text-dark-400 text-sm">{item.email}</Text>
              </View>
              <TouchableOpacity
                className="bg-indigo-600 rounded-lg px-3 py-1.5"
                onPress={() => sendRequest.mutate(item.id)}
              >
                <Text className="text-white text-sm font-medium">Ajouter</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={[
            ...(requests?.map((r) => ({ type: "request" as const, data: r })) ?? []),
            ...(friends?.map((f) => ({ type: "friend" as const, data: f })) ?? []),
          ]}
          keyExtractor={(item) => item.data.id}
          contentContainerClassName="px-4 py-2"
          ListHeaderComponent={
            requests && requests.length > 0 ? (
              <Text className="text-dark-300 font-semibold mb-2">
                Demandes ({requests.length})
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            if (item.type === "request") {
              const req = item.data as FriendRequest;
              return (
                <View className="bg-dark-800 rounded-xl p-3 mb-2 flex-row items-center border border-indigo-700/30">
                  <View className="w-10 h-10 rounded-full bg-indigo-600/20 items-center justify-center mr-3">
                    <Text className="text-indigo-400 font-bold">
                      {req.sender.name[0]}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">
                      {req.sender.name}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="bg-green-600 rounded-lg px-3 py-1.5"
                      onPress={() => acceptRequest.mutate(req.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-600 rounded-lg px-3 py-1.5"
                      onPress={() => declineRequest.mutate(req.id)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            const friend = item.data as Friend;
            return (
              <View className="bg-dark-800 rounded-xl p-3 mb-2 flex-row items-center border border-dark-700">
                <View className="w-10 h-10 rounded-full bg-indigo-600/20 items-center justify-center mr-3">
                  <Text className="text-indigo-400 font-bold">
                    {friend.name[0]}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">
                    {friend.name}
                  </Text>
                  <Text className="text-dark-400 text-sm">{friend.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(friend.id, friend.name)}
                >
                  <Ionicons
                    name="person-remove-outline"
                    size={20}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="people-outline" size={48} color="#475569" />
              <Text className="text-dark-500 text-base mt-4">
                Aucun ami pour le moment
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
