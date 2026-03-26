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
import QRCode from "react-native-qrcode-svg";
import { useUserTickets } from "@/api/queries";
import { useAuth } from "@/context/useAuth";
import type { Ticket, TicketStatus } from "@/types/api";

const statusConfig: Record<
  TicketStatus,
  { label: string; color: string; bg: string }
> = {
  paid: { label: "Valide", color: "text-green-400", bg: "bg-green-600/20" },
  pending: {
    label: "En attente",
    color: "text-yellow-400",
    bg: "bg-yellow-600/20",
  },
  used: { label: "Utilise", color: "text-dark-400", bg: "bg-dark-600/20" },
  cancelled: {
    label: "Annule",
    color: "text-red-400",
    bg: "bg-red-600/20",
  },
};

function TicketCard({ ticket }: { ticket: Ticket }) {
  const status = statusConfig[ticket.status];
  const date = ticket.event
    ? new Date(ticket.event.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <View className="bg-dark-800 rounded-2xl p-4 mb-4 border border-dark-700">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <Text className="text-white text-lg font-bold">
            {ticket.event?.title ?? "Evenement"}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text className="text-dark-400 text-sm ml-1">{date}</Text>
          </View>
        </View>
        <View className={`${status.bg} rounded-full px-3 py-1`}>
          <Text className={`${status.color} text-xs font-semibold`}>
            {status.label}
          </Text>
        </View>
      </View>

      {ticket.qrCode && ticket.status === "paid" && (
        <View className="items-center py-4 bg-white rounded-xl mb-3">
          <QRCode value={ticket.qrCode} size={160} />
        </View>
      )}

      {ticket.status === "paid" && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-indigo-600/20 border border-indigo-600 rounded-xl py-2.5 items-center"
            onPress={() =>
              router.push(`/(tabs)/tickets/transfer?id=${ticket.id}`)
            }
          >
            <Text className="text-indigo-400 font-semibold text-sm">
              Transferer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-red-600/10 border border-red-600/50 rounded-xl py-2.5 items-center"
            onPress={() =>
              router.push(`/(tabs)/tickets/cancel?id=${ticket.id}`)
            }
          >
            <Text className="text-red-400 font-semibold text-sm">Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function TicketsListScreen() {
  const { data: tickets, isLoading, refetch, isRefetching } = useUserTickets();
  const { user } = useAuth();
  const isOrganizer = user?.role === "organizer" || user?.role === "admin";

  return (
    <View className="flex-1 bg-dark-900">
      {isOrganizer && (
        <View className="px-4 pt-4">
          <TouchableOpacity
            className="bg-indigo-600 rounded-xl py-3 items-center flex-row justify-center gap-2"
            onPress={() => router.push("/(tabs)/tickets/scanner")}
          >
            <Ionicons name="qr-code" size={20} color="white" />
            <Text className="text-white font-semibold">Scanner un billet</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => <TicketCard ticket={item} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="ticket-outline" size={48} color="#475569" />
              <Text className="text-dark-500 text-base mt-4">
                Aucun billet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
