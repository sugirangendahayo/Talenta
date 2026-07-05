// app/layout/ui/ThemeScreen.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const THEMES = [
  { label: "System", mode: "system" as const, icon: "theme-light-dark" as const },
  { label: "Light",  mode: "light"  as const, icon: "weather-sunny"    as const },
  { label: "Dark",   mode: "dark"   as const, icon: "weather-night"    as const },
];

export default function ThemeScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useTheme();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="bg-gray-50 dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
        >
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
          Appearance
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Section label ────────────────────────────────────────────
            Quiet lowercase label — not all-caps with tracking-widest,
            which is a different typographic convention from the rest of
            the app. */}
        <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mb-2 ml-1">
          Theme
        </Text>

        {/* ── Theme selector card ──────────────────────────────────── */}
        <View
          className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#222] rounded-2xl overflow-hidden mb-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="px-5 py-4">
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-4">
              Choose how Talenta looks to you
            </Text>

            <View className="flex-row gap-3">
              {THEMES.map(({ label, mode, icon }) => {
                const isSelected = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${label} theme`}
                    className={`flex-1 py-4 rounded-2xl items-center border ${
                      isSelected
                        ? "bg-cyan-700 border-cyan-700"
                        : "bg-gray-50 dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={22}
                      // isDark is only used here for the icon color prop — a value
                      // that can't be expressed as a NativeWind class. Everywhere
                      // else layout uses dark: classes.
                      color={isSelected ? "#ffffff" : "#9CA3AF"}
                    />
                    <Text
                      className={`text-xs font-quicksandBold mt-2 ${
                        isSelected
                          ? "text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Helper note ──────────────────────────────────────────────── */}
        <Text className="text-xs font-quicksandMedium text-center text-gray-400 dark:text-gray-500 ml-1 leading-5">
          System follows your device&apos;s appearance settings. Light and Dark override it.
        </Text>
      </ScrollView>
    </View>
  );
}