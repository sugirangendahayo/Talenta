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
        <View className="bg-gray-50 dark:bg-gray-900/40 rounded-full w-12 h-12 items-center justify-center flex-row border border-gray-100 dark:border-gray-800">
          <Ionicons name="document-text" size={16} color="gray" />
          <Text className="text-red-700 font-quicksandBold ml-1.5 text-sm">
            {applicationCount}
          </Text>
        </View>
      )}
    </View>
  );
}