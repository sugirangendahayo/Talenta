// components/jobseeker/applications/ApplicationsHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface ApplicationsHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function ApplicationsHeader({ onRefresh, isRefreshing }: ApplicationsHeaderProps) {
  const { t } = useTranslation("jobs");

  return (
    <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-200">
          {t("applications.header.title")}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
          {t("applications.header.subtitle")}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onRefresh}
        disabled={isRefreshing}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t("applications.header.refresh", {
          defaultValue: "Refresh applications",
        })}
        className="bg-cyan-50 w-11 h-11 rounded-2xl items-center justify-center"
      >
        <Ionicons
          name="refresh"
          size={20}
          color="#0E7490"
          style={isRefreshing ? { opacity: 0.4 } : undefined}
        />
      </TouchableOpacity>
    </View>
  );
}