// components/jobseeker/applications/ApplicationsEmptyState.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ApplicationFilterId } from "@/types/appication";

interface ApplicationsEmptyStateProps {
  filter: ApplicationFilterId;
}

const EMPTY_STATE_ICON: Record<ApplicationFilterId, keyof typeof Ionicons.glyphMap> = {
  all: "document-outline",
  pending: "hourglass-outline",
  shortlisted: "checkmark-circle-outline",
  hired: "trophy-outline",
  rejected: "close-circle-outline",
};

export default function ApplicationsEmptyState({ filter }: ApplicationsEmptyStateProps) {
  const { t } = useTranslation("jobs");
  const router = useRouter();

  return (
    <View className="items-center justify-center px-8 py-20">
      <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#080A08] items-center justify-center mb-5">
        <Ionicons name={EMPTY_STATE_ICON[filter]} size={36} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-200 text-center">
        {t("applications.empty.title")}
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-sm mt-2 text-center leading-5">
        {filter === "all"
          ? t("applications.empty.noApplications")
          : t("applications.empty.noFilteredApplications", { status: filter })}
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(jobseeker-tabs)/jobseekers/Jobs")}
        activeOpacity={0.85}
        className="bg-cyan-700 dark:bg-cyan-800 rounded-2xl px-6 py-3 mt-6"
      >
        <Text className="text-white font-quicksandBold text-base">
          {t("applications.buttons.browseJobs")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}