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

  return (
    <View className="bg-white px-4 py-4 border-b border-gray-200">
      <View className="flex flex-row items-center justify-between">
        {/* Left: Company Logo & Greeting */}
        <View className="flex flex-row items-center gap-3">
          <View className="w-12 h-12 bg-cyan-100 rounded-full items-center justify-center flex">
            <Ionicons name="business" size={24} color="#0E7490" />
          </View>
          <View>
            <Text className="text-lg font-quicksandBold text-gray-800">
              {getGreeting()}
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500">
              {companyName}
            </Text>
          </View>
        </View>

        {/* Right: Notifications */}
        <TouchableOpacity
          className="relative"
          onPress={() => router.push("/(employer-tabs)/employers/Profile")}
        >
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center flex">
            <Ionicons name="notifications-outline" size={22} color="#374151" />
          </View>
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center flex px-1">
              <Text className="text-[10px] font-quicksandBold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
