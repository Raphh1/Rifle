import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/useAuth";
import {
  useOrganizerDashboard,
  useAdminDashboard,
  useAdminUsers,
} from "@/api/queries";

function StatCard({
  icon,
  label,
  value,
  color = "#6366f1",
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View className="bg-dark-800 rounded-2xl p-4 flex-1 border border-dark-700">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-dark-400 text-sm mt-1">{label}</Text>
    </View>
  );
}

function OrganizerDashboard() {
  const { data, isLoading } = useOrganizerDashboard();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-4 py-4">
      <Text className="text-white text-2xl font-bold mb-4">
        Dashboard Organisateur
      </Text>

      <View className="flex-row gap-3 mb-4">
        <StatCard
          icon="calendar"
          label="Evenements"
          value={data.eventsCount}
        />
        <StatCard
          icon="ticket"
          label="Billets vendus"
          value={data.ticketsSold}
          color="#22c55e"
        />
      </View>

      <StatCard
        icon="cash"
        label="Revenus"
        value={`${data.revenues} \u20ac`}
        color="#eab308"
      />

      {data.events.length > 0 && (
        <View className="mt-6">
          <Text className="text-dark-300 font-semibold mb-3">
            Par evenement
          </Text>
          {data.events.map((event) => (
            <View
              key={event.id}
              className="bg-dark-800 rounded-xl p-3 mb-2 border border-dark-700"
            >
              <Text className="text-white font-semibold" numberOfLines={1}>
                {event.title}
              </Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-dark-400 text-sm">
                  {event.ticketsSold}/{event.capacity} billets
                </Text>
                <Text className="text-indigo-400 font-medium">
                  {event.revenues} \u20ac
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView className="flex-1 bg-dark-900" contentContainerClassName="px-4 py-4">
      <Text className="text-white text-2xl font-bold mb-4">
        Dashboard Admin
      </Text>

      <View className="flex-row gap-3 mb-3">
        <StatCard icon="people" label="Utilisateurs" value={data.users} />
        <StatCard icon="calendar" label="Evenements" value={data.events} />
      </View>

      <View className="flex-row gap-3">
        <StatCard
          icon="ticket"
          label="Billets"
          value={data.ticketsSold}
          color="#22c55e"
        />
        <StatCard
          icon="cash"
          label="Revenus"
          value={`${data.revenues} \u20ac`}
          color="#eab308"
        />
      </View>
    </ScrollView>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();

  if (user?.role === "admin") return <AdminDashboard />;
  return <OrganizerDashboard />;
}
