// components/jobseeker/applications/ApplicationsHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface ApplicationsHeaderProps {
  applicationCount?: number;
}

export default function ApplicationsHeader({ applicationCount }: ApplicationsHeaderProps) {
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

      {applicationCount !== undefined && (
        <View className="bg-cyan-50 dark:bg-cyan-900/40 px-3.5 py-2.5 rounded-2xl items-center justify-center flex-row border border-cyan-100 dark:border-cyan-800">
          <Ionicons name="document-text" size={16} color="#0E7490" />
          <Text className="text-cyan-700 font-quicksandBold ml-1.5 text-sm">
            {applicationCount}
          </Text>
        </View>
      )}
    </View>
  );
}