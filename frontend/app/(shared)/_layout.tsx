// app/(shared)/_layout.tsx
import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function SharedLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? "#080A08" : "#fff",
        },
        headerTintColor: isDark ? "#F3F4F6" : "#111827",
        headerTitleStyle: {
          fontFamily: "Quicksand-Bold",
        },
        headerShadowVisible: false,
        presentation: "card",
      }}
    />
  );
}
