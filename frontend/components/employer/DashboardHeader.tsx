import UserAvatar from "@/components/common/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { EmployerProfile } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import TalentaVerifiedBadge from "./TalentaVerifiedBadge";
import { useTheme } from "@/contexts/ThemeContext";


interface DashboardHeaderProps {}

export default function DashboardHeader() {
  const { profile, role } = useAuth();
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const { unreadCount } = useNotifications();
  const { isDark } = useTheme();

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

  const profileImageUrl =
    role === "employer" && profile
      ? (profile as EmployerProfile).profile_image_url
      : undefined;

  // First letter of company name for avatar (kept as fallback inside UserAvatar)
  const initial = companyName.charAt(0).toUpperCase();

  return (
    <View className="bg-white dark:bg-[#080A08] px-6 pt-4 pb-4 border-b border-gray-100 dark:border-[#222]">
      <View className="flex-row items-center justify-between">
        {/* Left: Avatar + greeting */}
        <View className="flex-row items-center gap-3">
          <UserAvatar imageUrl={profileImageUrl} name={companyName} size={44} />
          <View>
            <Text className="text-xs font-quicksandMedium text-gray-400">
              {getGreeting()}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-base font-quicksandBold text-gray-900 dark:text-gray-100">
                {companyName}
              </Text>
              {role === "employer" && profile && (
                <TalentaVerifiedBadge
                  businessStatus={
                    (profile as EmployerProfile).business_verification_status
                  }
                  premiumPlan={(profile as EmployerProfile).premium_plan}
                  className="scale-90 origin-left"
                />
              )}
            </View>
          </View>
        </View>

        {/* Right: action icons */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center relative"
            onPress={() =>
              router.push("/(employer-tabs)/employers/notifications")
            }
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center border border-white dark:border-[#080A08]">
                <Text className="text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
