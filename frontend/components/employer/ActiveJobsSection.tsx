import type { ActiveJob } from "@/hooks/useDashboard";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

interface JobCardProps {
  job: ActiveJob;
  onRefresh: () => void;
}

const JobCard = ({ job, onRefresh }: JobCardProps) => {
  const router = useRouter();
  const { t } = useTranslation(["dashboard", "common"]);

  const getDaysUntilExpiry = () => {
    if (!job.expires_at) return null;
    const expiry = new Date(job.expires_at);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysActive = () => {
    const created = new Date(job.created_at);
    const today = new Date();
    const diffTime = today.getTime() - created.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const daysActive = getDaysActive();

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return t("jobs.notSpecified");
    if (job.salary_min && job.salary_max) {
      const formatNum = (num: number) =>
        num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
      return `${formatNum(job.salary_min)} – ${formatNum(job.salary_max)}`;
    }
    return job.salary_min
      ? `From $${job.salary_min}`
      : `Up to $${job.salary_max}`;
  };

  const handlePause = async () => {
    Alert.alert(
      "Pause Job",
      "This will temporarily hide the job from jobseekers. You can resume it anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pause",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.rpc("pause_job", {
                job_id: job.id,
              });
              if (error) throw error;
              toast.success(t("jobs.pausedSuccess"));
              onRefresh();
            } catch (error: any) {
              console.error("Error pausing job:", error);
              toast.error(error.message || t("jobs.pauseError"));
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      className="bg-gray-50 dark:bg-[#080A08] rounded-xl p-3 border border-gray-100 dark:border-[#222] mb-3"
      onPress={() =>
        router.push({
          pathname: "/employer/job-details/[id]",
          params: { id: job.id },
        })
      }
    >
      {/* Job title */}
      <Text className="text-sm font-quicksandBold text-gray-800 dark:text-gray-200 mb-2">
        {job.title}
      </Text>

      {/* Meta chips row */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        <View className="flex-row items-center gap-1 bg-gray-100 dark:bg-[#141414] rounded-full px-2.5 py-1">
          <Ionicons name="cash-outline" size={12} color="#6B7280" />
          <Text className="text-xs font-quicksandMedium text-gray-600 dark:text-gray-400">
            {formatSalary()}
          </Text>
        </View>

        <View className="flex-row items-center gap-1 bg-gray-100 dark:bg-[#141414] rounded-full px-2.5 py-1">
          <Ionicons name="location-outline" size={12} color="#6B7280" />
          <Text className="text-xs font-quicksandMedium text-gray-600 dark:text-gray-400">
            {job.location}
          </Text>
        </View>

        {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
          <View
            className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
              daysUntilExpiry < 7 ? "bg-red-50" : "bg-gray-100 dark:bg-[#141414]"
            }`}
          >
            <Ionicons
              name="time-outline"
              size={12}
              color={daysUntilExpiry < 7 ? "#EF4444" : "#6B7280"}
            />
            <Text
              className={`text-xs font-quicksandMedium ${
                daysUntilExpiry < 7 ? "text-red-500" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {daysUntilExpiry}d left
            </Text>
          </View>
        )}
      </View>

      {/* Footer: applicants count + pause action */}
      <View className="flex-row items-center justify-between pt-2.5 border-t border-gray-200 dark:border-[#2a2a2a]">
        <TouchableOpacity
          className="flex-row items-center gap-1.5"
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: "/(employer-tabs)/employers/Applicants",
              params: { jobId: job.id },
            });
          }}
        >
          <Ionicons name="people-outline" size={15} color="#6B7280" />
            <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-400">
            {job.applicants_count} {t("jobs.applicant")}
            {job.applicants_count !== 1 ? t("jobs.plural") : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1 border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#080A08] px-3 py-1.5 rounded-full"
          onPress={(e) => {
            e.stopPropagation();
            handlePause();
          }}
        >
          <Ionicons name="pause" size={12} color="#6B7280" />
          <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400">
            {t("jobs.pause")}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

interface ActiveJobsSectionProps {
  jobs: ActiveJob[];
  onRefresh: () => void;
}

export default function ActiveJobsSection({
  jobs,
  onRefresh,
}: ActiveJobsSectionProps) {
  const router = useRouter();
  const { t } = useTranslation(["dashboard", "common"]);

  if (jobs.length === 0) return null;

  return (
    // `collapsable={false}`: this section mounts/unmounts based on whether
    // there are active jobs, right below the always-present stats cards.
    // Without it, Android can flatten this view into its parent and then
    // fail to correctly re-layout it when it's inserted during a
    // pull-to-refresh, making the new job card appear to render on top of
    // the stats above it until the app is restarted.
    <View collapsable={false} className="mx-4 my-2">
      <View className="bg-white dark:bg-[#080A08] rounded-2xl p-4 border border-gray-100 dark:border-[#222]">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-full items-center justify-center">
              <Ionicons name="briefcase-outline" size={17} color="#6B7280" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200">
                {t("sections.activeJobs.title")}
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-400">
                {jobs.length} {t("jobs.position")}
                {jobs.length > 1 ? t("jobs.plural") : ""} {t("jobs.open")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center gap-0.5"
            onPress={() => router.push("/(employer-tabs)/employers/Jobs")}
          >
            <Text className="text-sm font-quicksandBold text-gray-600 dark:text-gray-400">
              {t("buttons.viewAll", { ns: "common" })}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Jobs list */}
        <View>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onRefresh={onRefresh} />
          ))}
        </View>
      </View>
    </View>
  );
}
