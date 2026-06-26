// components/employer/EmployerJobsHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface EmployerJobsHeaderProps {
  onPostJob?: () => void;
}

export default function EmployerJobsHeader({ onPostJob }: EmployerJobsHeaderProps) {
  const { t } = useTranslation("jobs");

  return (
    <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
      <View className="flex-1 pr-4">
        <Text className="font-quicksandBold text-3xl text-gray-800 dark:text-gray-200">
          {t("header.title")}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
          {t("header.subtitle")}
        </Text>
      </View>

      <TouchableOpacity
        className="bg-cyan-700 rounded-2xl px-4 py-3 flex-row items-center gap-2"
        onPress={onPostJob}
        activeOpacity={0.85}
        accessibilityRole="button"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons name="add" size={18} color="white" />
        <Text className="text-white font-quicksandBold text-sm">
          {t("buttons.postJob")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}