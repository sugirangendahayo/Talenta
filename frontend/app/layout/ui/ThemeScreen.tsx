import { useTheme } from "@/contexts/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ThemeScreen() {
  const navigation = useNavigation();
  const { isDark, themeMode, setThemeMode } = useTheme();

  const selectedTheme =
    themeMode === "dark" ? "Dark" : themeMode === "light" ? "Light" : "System";

  const handleThemeSelect = (label: string) => {
    const map: Record<string, "light" | "dark" | "system"> = {
      Light: "light",
      Dark: "dark",
      System: "system",
    };
    setThemeMode(map[label]);
  };

  const themes = [
    { label: "System", icon: "theme-light-dark" as keyof typeof MaterialCommunityIcons.glyphMap },
    { label: "Light", icon: "weather-sunny" as keyof typeof MaterialCommunityIcons.glyphMap },
    { label: "Dark", icon: "weather-night" as keyof typeof MaterialCommunityIcons.glyphMap },
  ];

  return (
    <View className={`flex-1 ${isDark ? "bg-[#080A08]" : "bg-gray-50"}`}>
      {/* Header */}
      <View className={`${isDark ? "bg-[#080A08]" : "bg-gray-50"} px-6 pt-16 pb-6`}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? "#f8fafc" : "#111"}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-quicksand-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
          >
            Appearance
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Text
          className={`text-xs font-quicksand-bold uppercase tracking-widest mb-2 ml-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          Theme
        </Text>
        <View
          className={`${isDark ? "bg-[#141414] border-[#222]" : "bg-white border-gray-100"} rounded-2xl border mb-4 overflow-hidden`}
        >
          <View className="px-5 py-4">
            <Text
              className={`font-quicksand-semibold text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Choose how Talenta looks to you
            </Text>
            <View className="flex-row gap-3">
              {themes.map(({ label, icon }) => {
                const isSelected = selectedTheme === label;
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => handleThemeSelect(label)}
                    activeOpacity={0.8}
                    className={`flex-1 py-3 rounded-2xl items-center border ${
                      isSelected
                        ? "bg-cyan-700 border-cyan-600"
                        : isDark
                          ? "bg-[#1e1e1e] border-[#2a2a2a]"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={icon}
                      size={22}
                      color={isSelected ? "#fff" : isDark ? "#71717a" : "#71717a"}
                    />
                    <Text
                      className={`text-xs font-quicksand-bold mt-1.5 ${
                        isSelected
                          ? "text-white"
                          : isDark
                            ? "text-gray-500"
                            : "text-gray-500"
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

        <Text
          className={`text-xs font-quicksand-semibold ml-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}
        >
          System follows your device&apos;s appearance settings. Light and Dark override it.
        </Text>
      </ScrollView>
    </View>
  );
}