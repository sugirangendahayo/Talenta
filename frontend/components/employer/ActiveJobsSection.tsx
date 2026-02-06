import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import type { ActiveJob } from "@/hooks/useDashboard";

interface JobCardProps {
  job: ActiveJob;
  onRefresh: () => void;
}

const JobCard = ({ job, onRefresh }: JobCardProps) => {
  const router = useRouter();

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!job.expires_at) return null;
    const expiry = new Date(job.expires_at);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate days active
  const getDaysActive = () => {
    const created = new Date(job.created_at);
    const today = new Date();
    const diffTime = today.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const daysActive = getDaysActive();

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return "Not specified";
    if (job.salary_min && job.salary_max) {
      const formatNum = (num: number) =>
        num >= 1000 ? `$${(num / 1000).toFixed(0)}k` : `$${num}`;
      return `${formatNum(job.salary_min)} - ${formatNum(job.salary_max)}`;
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

              toast.success("Job paused successfully");
              onRefresh();
            } catch (error: any) {
              console.error("Error pausing job:", error);
              toast.error(error.message || "Failed to pause job");
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3"
      onPress={() =>
        router.push({
          pathname: "/(employer-tabs)/employers/job-details/[id]",
          params: { id: job.id },
        })
      }
    >
      {/* Job Info */}
      <View className="mb-3">
        <Text className="text-base font-quicksandBold text-gray-800 mb-1">
          {job.title}
        </Text>
        <View className="flex flex-row items-center gap-3 flex-wrap">
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="cash-outline" size={14} color="#10B981" />
            <Text className="text-xs font-quicksandMedium text-gray-600">
              {formatSalary()}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color="#0E7490" />
            <Text className="text-xs font-quicksandMedium text-gray-600">
              {job.location}
            </Text>
          </View>
          {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
            <View className="flex flex-row items-center gap-1">
              <Ionicons
                name="time-outline"
                size={14}
                color={daysUntilExpiry < 7 ? "#EF4444" : "#F59E0B"}
              />
              <Text
                className={`text-xs font-quicksandMedium ${
                  daysUntilExpiry < 7 ? "text-red-600" : "text-orange-600"
                }`}
              >
                Expires in {daysUntilExpiry} day{daysUntilExpiry > 1 ? "s" : ""}
              </Text>
            </View>
          )}
          {daysActive > 0 && (
            <View className="flex flex-row items-center gap-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-xs font-quicksandMedium text-gray-600">
                {daysActive} day{daysActive > 1 ? "s" : ""} active
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats & Actions */}
      <View className="flex flex-row items-center justify-between pt-3 border-t border-gray-200">
        <View className="flex flex-row items-center gap-4">
          <TouchableOpacity
            className="flex flex-row items-center gap-1"
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: "/(employer-tabs)/employers/Applicants",
                params: { jobId: job.id },
              });
            }}
          >
            <Ionicons name="people-outline" size={16} color="#0E7490" />
            <Text className="text-xs font-quicksandBold text-gray-700">
              {job.applicants_count} applicant
              {job.applicants_count !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-gray-200 px-3 py-1.5 rounded-full flex flex-row items-center gap-1"
          onPress={(e) => {
            e.stopPropagation();
            handlePause();
          }}
        >
          <Ionicons name="pause" size={14} color="#6B7280" />
          <Text className="text-xs font-quicksandBold text-gray-700">
            Pause
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

  if (jobs.length === 0) return null;

  return (
    <View className="mx-4 my-2">
      <View className="bg-white rounded-2xl p-4 border border-gray-200">
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-2">
            <View className="w-8 h-8 bg-cyan-100 rounded-full items-center justify-center flex">
              <Ionicons name="briefcase" size={18} color="#0E7490" />
            </View>
            <View>
              <Text className="text-base font-quicksandBold text-gray-800">
                Active Jobs
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500">
                {jobs.length} position{jobs.length > 1 ? "s" : ""} open
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex flex-row items-center gap-1"
            onPress={() => router.push("/(employer-tabs)/employers/Jobs")}
          >
            <Text className="text-sm font-quicksandBold text-cyan-700">
              View All
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#0E7490" />
          </TouchableOpacity>
        </View>

        {/* Jobs List */}
        <View>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onRefresh={onRefresh} />
          ))}
        </View>
      </View>
    </View>
  );
}
