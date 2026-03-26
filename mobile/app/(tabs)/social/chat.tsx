import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRoomDetail, useRoomMessages, useSendMessage } from "@/api/socialQueries";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/social";

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      className={`mb-2 max-w-[80%] ${isOwn ? "self-end" : "self-start"}`}
    >
      {!isOwn && (
        <Text className="text-indigo-400 text-xs font-medium mb-0.5 ml-1">
          {message.sender.name}
        </Text>
      )}
      {message.parent && (
        <View className="bg-dark-700/50 rounded-lg px-2 py-1 mb-1">
          <Text className="text-dark-400 text-xs" numberOfLines={1}>
            {message.parent.sender.name}: {message.parent.content}
          </Text>
        </View>
      )}
      <View
        className={`rounded-2xl px-4 py-2.5 ${
          isOwn ? "bg-indigo-600" : "bg-dark-700"
        }`}
      >
        <Text className={isOwn ? "text-white" : "text-dark-200"}>
          {message.deletedAt ? "Message supprime" : message.content}
        </Text>
      </View>
      <Text className="text-dark-600 text-[10px] mt-0.5 mx-1">{time}</Text>
    </View>
  );
}

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { data: room } = useRoomDetail(roomId);
  const { data: messagesData, isLoading } = useRoomMessages(roomId);
  const sendMessage = useSendMessage();

  const messages = messagesData?.data ?? [];

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join_room", roomId);

    socket.on("new_message", () => {
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
    });

    return () => {
      socket.emit("leave_room", roomId);
      socket.off("new_message");
    };
  }, [socket, roomId, queryClient]);

  const handleSend = () => {
    const content = newMessage.trim();
    if (!content) return;

    sendMessage.mutate(
      { roomId, content },
      {
        onSuccess: () => {
          setNewMessage("");
          queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dark-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="px-4 py-3 bg-dark-800 border-b border-dark-700">
        <Text className="text-white font-bold text-lg">{room?.name}</Text>
        {room?.event && (
          <Text className="text-dark-400 text-sm">{room.event.title}</Text>
        )}
      </View>

      {/* Messages */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          inverted
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === user?.id}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="chatbubble-outline" size={40} color="#475569" />
              <Text className="text-dark-500 mt-2">Aucun message</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View className="px-4 py-3 bg-dark-800 border-t border-dark-700 flex-row items-end gap-2">
        <TextInput
          className="flex-1 bg-dark-700 rounded-2xl px-4 py-2.5 text-white max-h-24"
          placeholder="Votre message..."
          placeholderTextColor="#64748b"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center"
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
