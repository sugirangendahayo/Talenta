import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string | number;
  label: string;
  badge?: string;
  onPress?: () => void;
}

const StatCard = ({
  icon,
  iconColor,
  value,
  label,
  badge,
  onPress,
}: StatCardProps) => (
  <TouchableOpacity
    className="flex-1 bg-white dark:bg-[#080A08] rounded-2xl p-4 border border-gray-200 dark:border-[#2a2a2a] mx-1"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex items-center">
      <View
        className="w-12 h-12 rounded-full items-center justify-center flex mb-2"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200">{value}</Text>
      <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 text-center mt-1">
        {label}
      </Text>
      {badge && (
        <View className="bg-red-100 px-2 py-1 rounded-full mt-2">
          <Text className="text-xs font-quicksandBold text-red-600">
            {badge}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

interface StatsCardsProps {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    shortlistedApplicants: number;
    unreadMessages: number;
  };
}

export default function StatCards({ stats }: StatsCardsProps) {
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  const statCards = [
    {
      icon: "briefcase" as keyof typeof Ionicons.glyphMap,
      iconColor: "#0E7490",
      value: stats.activeJobs,
      label: t("stats.activeJobs"),
      onPress: () => router.push("/(employer-tabs)/employers/Jobs"),
    },
    {
      icon: "people" as keyof typeof Ionicons.glyphMap,
      iconColor: "#10B981",
      value: stats.totalApplicants,
      label: t("stats.applicants"),
      onPress: () => router.push("/(employer-tabs)/employers/Applicants"),
    },
    {
      icon: "star" as keyof typeof Ionicons.glyphMap,
      iconColor: "#F59E0B",
      value: stats.shortlistedApplicants,
      label: t("stats.shortlisted"),
      onPress: () => router.push("/(employer-tabs)/employers/Applicants"),
    },
    {
      icon: "mail" as keyof typeof Ionicons.glyphMap,
      iconColor: "#8B5CF6",
      value: stats.unreadMessages,
      label: t("stats.messages"),
      badge:
        stats.unreadMessages > 0
          ? `${stats.unreadMessages} ${t("stats.new")}`
          : undefined,
      onPress: () => router.push("/(employer-tabs)/employers/Profile"),
    },
  ];

  return (
    <View className="flex flex-row flex-wrap px-3 py-4">
      {statCards.map((stat, index) => (
        <View className="w-1/2 mb-3" key={index}>
          <StatCard {...stat} />
        </View>
      ))}
    </View>
  );
}
