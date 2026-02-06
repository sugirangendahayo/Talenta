import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { HighPriorityApplicant } from "@/hooks/useDashboard";

interface ApplicantItemProps {
  applicant: HighPriorityApplicant;
}

const ApplicantItem = ({ applicant }: ApplicantItemProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="flex flex-row items-center justify-between py-3 border-b border-gray-100"
      onPress={() =>
        router.push({
          pathname: "/(employer-tabs)/employers/Applicants",
          params: { applicationId: applicant.id },
        })
      }
    >
      <View className="flex-1">
        <View className="flex flex-row items-center gap-2">
          <Text className="text-sm font-quicksandBold text-gray-800">
            {applicant.applicant_name}
          </Text>
          {applicant.is_new && (
            <View className="bg-red-500 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-quicksandBold text-white">NEW</Text>
            </View>
          )}
        </View>
        <Text className="text-xs font-quicksandMedium text-gray-500 mt-0.5">
          {applicant.job_title}
        </Text>
      </View>
      <View className="flex flex-row items-center gap-2">
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-xs font-quicksandBold text-green-700">
            {applicant.match_score}% match
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

interface AttentionSectionProps {
  applicants: HighPriorityApplicant[];
}

export default function AttentionSection({ applicants }: AttentionSectionProps) {
  const router = useRouter();

  if (applicants.length === 0) return null;

  return (
    <View className="mx-4 my-2">
      <View className="bg-white rounded-2xl p-4 border border-gray-200">
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center flex">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                Requiring Attention
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                {applicants.length} high-priority applicant{applicants.length > 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex flex-row items-center gap-1"
            onPress={() => router.push("/(employer-tabs)/employers/Applicants")}
          >
            <Text className="text-sm font-quicksandBold text-cyan-700">
              View All
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#0E7490" />
          </TouchableOpacity>
        </View>

        {/* Applicants List */}
        <View>
          {applicants.map((applicant) => (
            <ApplicantItem key={applicant.id} applicant={applicant} />
          ))}
        </View>
      </View>
    </View>
  );
}