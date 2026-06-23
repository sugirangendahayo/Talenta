import { useAuth } from "@/contexts/AuthContext";
import { EmployerProfile } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface DashboardHeaderProps {
  unreadCount?: number;
}

export default function DashboardHeader({
  unreadCount = 0,
}: DashboardHeaderProps) {
  const { profile, role } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greetings.goodMorning");
    if (hour < 18) return t("greetings.goodAfternoon");
    return t("greetings.goodEvening");
  };

  const companyName =
    role === "employer" && profile
      ? (profile as EmployerProfile).company_name || "There"
      : "There";

  // First letter of company name for avatar
  const initial = companyName.charAt(0).toUpperCase();

  return (
    <View className="bg-white dark:bg-[#080A08] px-6 pt-4 pb-4 border-b border-gray-100 dark:border-[#222]">
      <View className="flex-row items-center justify-between">
        {/* Left: Avatar + greeting */}
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 bg-cyan-50 rounded-full items-center justify-center border border-cyan-100">
            <Text className="text-base font-quicksandBold text-cyan-700">
              {initial}
            </Text>
          </View>
          <View>
            <Text className="text-xs font-quicksandMedium text-gray-400">
              {getGreeting()}
            </Text>
            <Text className="text-base font-quicksandBold text-gray-900 dark:text-gray-100">
              {companyName}
            </Text>
          </View>
        </View>

        {/* Right: action icons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="w-9 h-9 bg-gray-100 dark:bg-[#141414] rounded-full items-center justify-center"
            onPress={() => router.push("/(employer-tabs)/employers/Profile")}
          >
            <View className="relative">
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#374151"
              />
              {unreadCount > 0 && (
                <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full min-w-[14px] h-[14px] items-center justify-center px-0.5">
                  <Text className="text-[9px] font-quicksandBold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}