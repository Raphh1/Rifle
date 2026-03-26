import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/useAuth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/events" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f172a" },
        animation: "slide_from_right",
      }}
    />
  );
}
