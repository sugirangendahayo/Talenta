import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  category: string;
  experience_level: string;
  skills_required: string[];
  status: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export default function EmployerJobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Job not found");
        return;
      }

      setJob(data);
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return {
          text: "Active",
          icon: "checkmark-circle",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          iconColor: "#10B981",
        };
      case "expired":
        return {
          text: "Expired",
          icon: "time",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          iconColor: "#EF4444",
        };
      case "closed":
        return {
          text: "Closed",
          icon: "close-circle",
          bgColor: "bg-gray-200",
          textColor: "text-gray-700",
          iconColor: "#6B7280",
        };
      case "paused":
        return {
          text: "Paused",
          icon: "pause-circle",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          iconColor: "#F59E0B",
        };
      case "draft":
        return {
          text: "Draft",
          icon: "create",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          iconColor: "#3B82F6",
        };
      default:
        return {
          text: status,
          icon: "help-circle",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          iconColor: "#6B7280",
        };
    }
  };

  // Action handlers
  const handlePauseJob = async () => {
    if (!job) return;

    Alert.alert(
      "Pause Job",
      "This will temporarily hide the job from jobseekers. You can reactivate it anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pause",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const { error } = await supabase.rpc("pause_job", {
                job_id: job.id,
              });

              if (error) throw error;

              toast.success("Job paused successfully");
              fetchJobDetails(); // Refresh
            } catch (error: any) {
              console.error("Error pausing job:", error);
              toast.error(error.message || "Failed to pause job");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReactivateJob = async () => {
    if (!job) return;

    try {
      setActionLoading(true);
      const { error } = await supabase.rpc("reactivate_job", {
        job_id: job.id,
      });

      if (error) throw error;

      toast.success("Job reactivated successfully");
      fetchJobDetails(); // Refresh
    } catch (error: any) {
      console.error("Error reactivating job:", error);
      toast.error(error.message || "Failed to reactivate job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseJob = async () => {
    if (!job) return;

    Alert.alert(
      "Close Job",
      "Are you sure you want to close this job? This action will permanently hide it from jobseekers.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Job",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const { error } = await supabase.rpc("close_job", {
                job_id: job.id,
              });

              if (error) throw error;

              toast.success("Job closed successfully");
              fetchJobDetails(); // Refresh
            } catch (error: any) {
              console.error("Error closing job:", error);
              toast.error(error.message || "Failed to close job");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRenewJob = async () => {
    if (!job) return;

    Alert.alert(
      "Renew Job",
      "This will extend the job expiry by 30 days and make it active again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Renew",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const newExpiryDate = new Date();
              newExpiryDate.setDate(newExpiryDate.getDate() + 30);
              const expiryString = newExpiryDate.toISOString().split("T")[0];

              const { error } = await supabase.rpc("renew_job", {
                job_id: job.id,
                new_expiry_date: expiryString,
              });

              if (error) throw error;

              toast.success("Job renewed for 30 days");
              fetchJobDetails(); // Refresh
            } catch (error: any) {
              console.error("Error renewing job:", error);
              toast.error(error.message || "Failed to renew job");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleViewApplicants = () => {
    router.push({
      pathname: "/(employer-tabs)/employers/Applicants",
      params: { jobId: job?.id },
    });
  };

  // Utility functions
  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    expiry.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryDisplay = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      it: "IT & Software",
      design: "Design",
      business: "Business",
      construction: "Construction",
      finance: "Finance",
      healthcare: "Healthcare",
      education: "Education",
      sales: "Sales & Marketing",
      hospitality: "Hospitality",
      transport: "Transport",
      creative: "Creative",
      agriculture: "Agriculture",
      security: "Security & Law",
    };
    return (
      categoryNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-600 font-quicksandMedium mt-4">
          Loading job details...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-quicksandBold text-gray-800 mt-4 text-center">
          {error || "Job not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-cyan-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-quicksandBold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Derived values
  const statusBadge = getStatusBadge(job.status);
  const salary = formatSalary(job.salary_min, job.salary_max);
  const timeAgo = formatDate(job.created_at);
  const jobTypes = job.job_type.split(",").map((t) => t.trim());
  const categoryDisplay = getCategoryDisplay(job.category);
  const daysLeft = getDaysUntilExpiry(job.expires_at);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-16 pb-8 px-6 rounded-b-[40px] bg-cyan-700">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-lg font-quicksandBold text-white">
            Job Details
          </Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View className="px-4 pt-6">
          <View className="flex flex-row items-start justify-between mb-4">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-quicksandBold text-gray-800 mb-2">
                {job.title}
              </Text>
              <View className="flex flex-row items-center gap-1 mb-3">
                <Ionicons name="location-sharp" size={16} color="#0E7490" />
                <Text className="text-gray-600 font-quicksandMedium text-base">
                  {job.location}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View
              className={`${statusBadge.bgColor} px-4 py-2 rounded-full flex flex-row items-center gap-2`}
            >
              <Ionicons
                name={statusBadge.icon as any}
                size={18}
                color={statusBadge.iconColor}
              />
              <Text className={`${statusBadge.textColor} font-quicksandBold`}>
                {statusBadge.text}
              </Text>
            </View>
          </View>

          {/* Quick Info */}
          <View className="flex flex-row flex-wrap gap-3 mb-6">
            <View className="bg-cyan-100 px-4 py-3 rounded-2xl">
              <Text className="text-cyan-700 font-quicksandBold text-sm">
                {salary}
              </Text>
            </View>
            {jobTypes.map((type, index) => (
              <View key={index} className="bg-white px-4 py-3 rounded-2xl">
                <Text className="text-gray-700 font-quicksandMedium text-sm">
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons Section */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-quicksandBold text-gray-800 mb-3">
            Manage Job
          </Text>
          <View className="bg-white rounded-2xl p-4">
            <View className="flex flex-row flex-wrap gap-3">
              {/* View Applicants */}
              <TouchableOpacity
                onPress={handleViewApplicants}
                className="flex-1 min-w-[45%] bg-cyan-700 px-4 py-3 rounded-xl flex flex-row items-center justify-center gap-2"
              >
                <Ionicons name="people" size={20} color="white" />
                <Text className="text-white font-quicksandBold">
                  Applicants
                </Text>
              </TouchableOpacity>

              {/* Pause/Resume */}
              {job.status === "active" && (
                <TouchableOpacity
                  onPress={handlePauseJob}
                  disabled={actionLoading}
                  className="flex-1 min-w-[45%] bg-yellow-100 px-4 py-3 rounded-xl flex flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="pause" size={20} color="#F59E0B" />
                  <Text className="text-yellow-700 font-quicksandBold">
                    Pause
                  </Text>
                </TouchableOpacity>
              )}

              {job.status === "paused" && (
                <TouchableOpacity
                  onPress={handleReactivateJob}
                  disabled={actionLoading}
                  className="flex-1 min-w-[45%] bg-green-100 px-4 py-3 rounded-xl flex flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="play" size={20} color="#10B981" />
                  <Text className="text-green-700 font-quicksandBold">
                    Resume
                  </Text>
                </TouchableOpacity>
              )}

              {/* Renew (for expired/paused) */}
              {(job.status === "expired" || job.status === "paused") && (
                <TouchableOpacity
                  onPress={handleRenewJob}
                  disabled={actionLoading}
                  className="flex-1 min-w-[45%] bg-cyan-100 px-4 py-3 rounded-xl flex flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="refresh" size={20} color="#0E7490" />
                  <Text className="text-cyan-700 font-quicksandBold">
                    Renew
                  </Text>
                </TouchableOpacity>
              )}

              {/* Close */}
              {job.status !== "closed" && (
                <TouchableOpacity
                  onPress={handleCloseJob}
                  disabled={actionLoading}
                  className="flex-1 min-w-[45%] bg-red-100 px-4 py-3 rounded-xl flex flex-row items-center justify-center gap-2"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#EF4444"
                  />
                  <Text className="text-red-700 font-quicksandBold">Close</Text>
                </TouchableOpacity>
              )}

              {/* Edit (for drafts) */}
              {job.status === "draft" && (
                <TouchableOpacity className="flex-1 min-w-[45%] bg-blue-100 px-4 py-3 rounded-xl flex flex-row items-center justify-center gap-2">
                  <Ionicons name="create-outline" size={20} color="#3B82F6" />
                  <Text className="text-blue-700 font-quicksandBold">Edit</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Job Description */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            Job Description
          </Text>
          <Text className="text-gray-600 font-quicksandMedium text-base leading-6">
            {job.description}
          </Text>
        </View>

        {/* Experience Level */}
        {job.experience_level && (
          <View className="p-4 m-3 bg-white rounded-2xl">
            <View className="flex flex-row items-center gap-2 mb-3">
              <View className="p-3 bg-gray-200 rounded-full">
                <Ionicons name="briefcase" size={22} color="black" />
              </View>
              <Text className="text-xl font-quicksandBold text-gray-800">
                Experience Required
              </Text>
            </View>
            <Text className="text-gray-600 font-quicksandMedium text-base">
              {job.experience_level}
            </Text>
          </View>
        )}

        {/* Skills Required */}
        {job.skills_required && job.skills_required.length > 0 && (
          <View className="p-4 m-3 bg-white rounded-2xl">
            <View className="flex flex-row items-center gap-2 mb-3">
              <View className="p-3 bg-gray-200 rounded-full">
                <Octicons name="checklist" size={22} color="black" />
              </View>
              <Text className="text-xl font-quicksandBold text-gray-800">
                Required Skills
              </Text>
            </View>
            <View className="flex flex-row flex-wrap gap-2">
              {job.skills_required.map((skill, index) => (
                <View
                  key={index}
                  className="bg-cyan-50 px-3 py-2 rounded-full border border-cyan-200"
                >
                  <Text className="text-cyan-700 font-quicksandSemibold text-sm">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Job Information */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            Job Information
          </Text>
          <View className="bg-cyan-50 rounded-2xl p-4 space-y-3">
            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">Posted</Text>
              <Text className="text-gray-800 font-quicksandBold">
                {timeAgo}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />

            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">
                Expires
              </Text>
              <Text
                className={`font-quicksandBold ${
                  daysLeft < 7
                    ? "text-red-600"
                    : daysLeft < 30
                      ? "text-yellow-600"
                      : "text-gray-800"
                }`}
              >
                {daysLeft > 0
                  ? `In ${daysLeft} days`
                  : daysLeft === 0
                    ? "Today"
                    : "Expired"}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />

            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">
                Category
              </Text>
              <Text className="text-gray-800 font-quicksandBold">
                {categoryDisplay}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />

            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">Type</Text>
              <Text className="text-gray-800 font-quicksandBold">
                {jobTypes.join(", ")}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />

            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">Salary</Text>
              <Text className="text-gray-800 font-quicksandBold">{salary}</Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
