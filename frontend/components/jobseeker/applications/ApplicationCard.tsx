// components/jobseeker/applications/ApplicationCard.tsx
import {
  APPLICATION_STATUS_META,
  DEFAULT_STATUS_META,
} from "@/constants/applicationStatus";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { formatSalaryRange, getRelativeTimeLabel } from "../../../app/utils/formatters";
import type { JobApplication } from "@/types/appication";

interface ApplicationCardProps {
  application: JobApplication;
  onPress: (jobId: string) => void;
  onWithdraw: (applicationId: string, jobTitle: string) => void;
}   

function ApplicationCard({
  application,
  onPress,
  onWithdraw,
}: ApplicationCardProps) {
  const { t } = useTranslation("jobs");

  const status =
    APPLICATION_STATUS_META[application.status] ?? DEFAULT_STATUS_META;
  const companyName = application.jobs.employer_profiles.company_name;
  const salaryRange = formatSalaryRange(
    application.jobs.salary_min,
    application.jobs.salary_max,
  );
  const appliedLabel = getRelativeTimeLabel(application.created_at, t);
  const statusLabel = t(`applications.status.${application.status}`, {
    defaultValue: application.status,
  });

  return (
    <TouchableOpacity
      onPress={() => onPress(application.job_id)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t("applications.card.openLabel", {
        defaultValue: `${application.jobs.title} at ${companyName}, ${statusLabel}`,
      })}
      className="flex-row bg-white dark:bg-[#080A08] rounded-3xl mb-4 border border-gray-100 dark:border-[#222] overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      }}
    >
      {/* Status accent edge — lets the eye scan a whole list and read status from color alone */}
      <View style={{ width: 4, backgroundColor: status.accent }} />

      <View className="flex-1 p-4">
        {/* Company mark + role/company + status badge */}
        <View className="flex-row items-start">
          <View className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#080A08] border border-gray-100 dark:border-[#222] items-center justify-center">
            <Text className="text-lg font-quicksandBold text-cyan-700">
              {companyName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View className="flex-1 ml-3">
            <Text
              className="text-base font-quicksandBold text-gray-800 dark:text-gray-200"
              numberOfLines={1}
            >
              {application.jobs.title}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text
                className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-sm"
                numberOfLines={1}
              >
                {companyName}
              </Text>
              <MaterialIcons
                name="verified"
                size={13}
                color="#0E7490"
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>

          <View
            className={`flex-row items-center ${status.badgeBg} px-2.5 py-1 rounded-full ml-2`}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: status.accent,
                marginRight: 5,
              }}
            />
            <Text className={`${status.badgeText} text-xs font-quicksandBold`}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Where + what it pays — plain text, no decorative color blocks */}
        <View className="flex-row items-center mt-3">
          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
          <Text
            className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs ml-1 flex-shrink"
            numberOfLines={1}
          >
            {application.jobs.location}
          </Text>
          <Text className="text-gray-300 mx-2">•</Text>
          <Ionicons name="cash-outline" size={14} color="#9CA3AF" />
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs ml-1">
            {salaryRange}
          </Text>
        </View>

        {/* Applied date, plus the one action that's actually relevant here */}
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <Text className="text-gray-400 font-quicksandMedium text-xs">
            {t("applications.list.applied")} {appliedLabel}
          </Text>

          {application.status === "pending" ? (
            <TouchableOpacity
              onPress={() => onWithdraw(application.id, application.jobs.title)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={t("applications.buttons.withdraw")}
            >
              <Text className="text-red-600 font-quicksandBold text-xs">
                {t("applications.buttons.withdraw")}
              </Text>
            </TouchableOpacity>
          ) : (
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// The list can grow long — memo keeps re-renders scoped to the row that actually changed
export default memo(ApplicationCard);
