import type { HighPriorityApplicant } from "@/hooks/useDashboard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface ApplicantItemProps {
  applicant: HighPriorityApplicant;
}

const ApplicantItem = ({ applicant }: ApplicantItemProps) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3 border-b border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/(employer-tabs)/employers/Applicants",
          params: { applicationId: applicant.id },
        })
      }
    >
      {/* Avatar initial */}
      <View className="w-8 h-8 bg-cyan-50 rounded-full items-center justify-center mr-3 border border-cyan-100">
        <Text className="text-xs font-quicksandBold text-cyan-700">
          {applicant.applicant_name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-quicksandBold text-gray-800">
            {applicant.applicant_name}
          </Text>
          {applicant.is_new && (
            <View className="bg-cyan-700 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] font-quicksandBold text-white">
                {t("priority.new")}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs font-quicksandMedium text-gray-500 mt-0.5">
          {applicant.job_title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {/* Neutral match score chip — no green */}
        <View className="bg-gray-100 px-2 py-1 rounded-full">
          <Text className="text-xs font-quicksandBold text-gray-700">
            {applicant.match_score}% {t("priority.match")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

interface AttentionSectionProps {
  applicants: HighPriorityApplicant[];
}

export default function AttentionSection({
  applicants,
}: AttentionSectionProps) {
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  if (applicants.length === 0) return null;

  return (
    <View className="mx-4 my-2">
      <View className="bg-white rounded-2xl p-4 border border-gray-100">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-cyan-50 rounded-full items-center justify-center">
              <Ionicons name="alert-circle-outline" size={18} color="#0E7490" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                {t("sections.attention.title")}
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-400">
                {applicants.length}{" "}
                {t("sections.attention.highPriorityApplicant")}
                {applicants.length > 1 ? t("sections.attention.plural") : ""}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-0.5"
            onPress={() => router.push("/(employer-tabs)/employers/Applicants")}
          >
            <Text className="text-sm font-quicksandBold text-cyan-700">
              {t("common.viewAll")}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#0E7490" />
          </TouchableOpacity>
        </View>

        {/* List */}
        <View>
          {applicants.map((applicant) => (
            <ApplicantItem key={applicant.id} applicant={applicant} />
          ))}
        </View>
      </View>
    </View>
  );
}
