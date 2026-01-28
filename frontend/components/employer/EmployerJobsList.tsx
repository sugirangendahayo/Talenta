import { Job } from "@/types/job.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

interface EmployerJobsListProps {
  jobs: any[];
  selectedCategory: string;
  searchQuery: string;
  statusFilter: string;
  onRefresh: () => void;
}

const EmployerJobsList: React.FC<EmployerJobsListProps> = ({
  jobs,
  selectedCategory,
  searchQuery,
  statusFilter,
  onRefresh,
}) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // Filter jobs based on category, search query, and status
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Category filter
      const categoryMatch =
        selectedCategory === "all" || job.category === selectedCategory;

      // Search filter
      const searchLower = searchQuery.toLowerCase().trim();
      const searchMatch =
        searchLower === "" ||
        job.title.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower);

      // Status filter
      const statusMatch = statusFilter === "all" || job.status === statusFilter;

      return categoryMatch && searchMatch && statusMatch;
    });
  }, [selectedCategory, searchQuery, statusFilter, jobs]);

  // Get status badge configuration
  const getStatusBadge = (status: string, expiresAt?: string) => {
    // Check if job is expired (even if status is still "active")
    const isExpired =
      expiresAt && new Date(expiresAt) < new Date() && status === "active";

    if (isExpired) {
      return {
        text: "Expired",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
      };
    }

    switch (status) {
      case "active":
        return {
          text: "Active",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      case "expired":
        return {
          text: "Expired",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
        };
      case "closed":
        return {
          text: "Closed",
          bgColor: "bg-gray-200",
          textColor: "text-gray-700",
        };
      case "paused":
        return {
          text: "Paused",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
        };
      case "draft":
        return {
          text: "Draft",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
        };
      default:
        return {
          text: status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
        };
    }
  };

  // Format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }
    return min
      ? `From $${min.toLocaleString()}`
      : `Up to $${max?.toLocaleString()}`;
  };

  // Format date
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

  // Get days until expiry
  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    expiry.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle job actions
  const handlePauseJob = async (jobId: string) => {
    try {
      const { error } = await supabase.rpc("pause_job", { job_id: jobId });

      if (error) throw error;

      toast.success("Job paused successfully");
      onRefresh();
    } catch (error: any) {
      console.error("Error pausing job:", error);
      toast.error(error.message || "Failed to pause job");
    }
  };

  const handleReactivateJob = async (jobId: string) => {
    try {
      const { error } = await supabase.rpc("reactivate_job", { job_id: jobId });

      if (error) throw error;

      toast.success("Job reactivated successfully");
      onRefresh();
    } catch (error: any) {
      console.error("Error reactivating job:", error);
      toast.error(error.message || "Failed to reactivate job");
    }
  };

  const handleCloseJob = async (jobId: string) => {
    Alert.alert(
      "Close Job",
      "Are you sure you want to close this job? This action will hide it from jobseekers.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Job",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.rpc("close_job", {
                job_id: jobId,
              });

              if (error) throw error;

              toast.success("Job closed successfully");
              onRefresh();
            } catch (error: any) {
              console.error("Error closing job:", error);
              toast.error(error.message || "Failed to close job");
            }
          },
        },
      ],
    );
  };

  const handleRenewJob = async (jobId: string) => {
    // Default renewal: 30 days from now
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    const expiryString = newExpiryDate.toISOString().split("T")[0];

    try {
      const { error } = await supabase.rpc("renew_job", {
        job_id: jobId,
        new_expiry_date: expiryString,
      });

      if (error) throw error;

      toast.success("Job renewed for 30 days");
      onRefresh();
    } catch (error: any) {
      console.error("Error renewing job:", error);
      toast.error(error.message || "Failed to renew job");
    }
  };

  // Render action buttons based on status
  const renderActionButtons = (job: any) => {
    const status = job.status;
    const isExpired = job.expires_at && new Date(job.expires_at) < new Date();

    if (status === "active" && !isExpired) {
      return (
        <>
          <TouchableOpacity
            onPress={() => handlePauseJob(job.id)}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="pause" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCloseJob(job.id)}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </>
      );
    }

    if (status === "paused") {
      return (
        <>
          <TouchableOpacity
            onPress={() => handleReactivateJob(job.id)}
            className="bg-green-100 p-2 rounded-full"
          >
            <Ionicons name="play" size={20} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCloseJob(job.id)}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </>
      );
    }

    if (status === "expired" || (status === "active" && isExpired)) {
      return (
        <>
          <TouchableOpacity
            onPress={() => handleRenewJob(job.id)}
            className="bg-cyan-100 p-2 rounded-full"
          >
            <Ionicons name="refresh" size={20} color="#0E7490" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleCloseJob(job.id)}
            className="bg-gray-100 p-2 rounded-full"
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </>
      );
    }

    if (status === "closed") {
      return (
        <TouchableOpacity
          onPress={() => handleRenewJob(job.id)}
          className="bg-cyan-100 p-2 rounded-full"
        >
          <Ionicons name="refresh" size={20} color="#0E7490" />
        </TouchableOpacity>
      );
    }

    if (status === "draft") {
      return (
        <TouchableOpacity
          // Navigate to edit
          className="bg-cyan-100 p-2 rounded-full"
        >
          <Ionicons name="create-outline" size={20} color="#0E7490" />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderJobItem = ({ item }: { item: any }) => {
    const statusBadge = getStatusBadge(item.status, item.expires_at);
    const daysLeft = getDaysUntilExpiry(item.expires_at);

    return (
      <TouchableOpacity className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm border border-gray-200">
        <View className="flex-1">
          {/* Header: Job Info + Status */}
          <View className="flex flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-quicksandBold text-gray-800 mb-1">
                {item.title}
              </Text>
              <View className="flex flex-row items-center gap-1">
                <Ionicons name="location-sharp" size={13} color="#0E7490" />
                <Text className="text-gray-600 font-quicksandMedium text-sm">
                  {item.location}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View className={`${statusBadge.bgColor} px-3 py-1 rounded-full`}>
              <Text
                className={`${statusBadge.textColor} text-xs font-quicksandBold`}
              >
                {statusBadge.text}
              </Text>
            </View>
          </View>

          {/* Type Badges */}
          {item.job_type && (
            <View className="flex flex-row flex-wrap gap-2 mb-3">
              {item.job_type
                .split(",")
                .slice(0, 2)
                .map((type: string, index: number) => (
                  <View
                    key={index}
                    className="bg-gray-100 px-3 py-2 rounded-full"
                  >
                    <Text className="text-gray-700 text-xs font-quicksandMedium">
                      {type.trim()}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {/* Stats Row */}
          <View className="flex flex-row items-center gap-4 mb-3 flex-wrap">
            <View className="flex flex-row items-center gap-1">
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text className="text-xs font-quicksandBold text-gray-700">
                {formatDate(item.created_at)}
              </Text>
            </View>
            {daysLeft !== null && (
              <View className="flex flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
                <Text
                  className={`text-xs font-quicksandBold ${
                    daysLeft < 7
                      ? "text-red-600"
                      : daysLeft < 30
                        ? "text-yellow-600"
                        : "text-gray-700"
                  }`}
                >
                  {daysLeft > 0
                    ? `${daysLeft} days left`
                    : daysLeft === 0
                      ? "Expires today"
                      : "Expired"}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {item.description && (
            <Text className="text-gray-500 text-sm font-quicksandMedium mb-3">
              {item.description.substring(0, 100)}
              {item.description.length > 100 ? "..." : ""}
            </Text>
          )}

          {/* Footer: Salary + Actions */}
          <View className="flex flex-row justify-between items-center gap-2">
            <Text className="text-cyan-600 text-sm font-quicksandMedium p-2 bg-gray-100 rounded-full">
              {formatSalary(item.salary_min, item.salary_max)}
            </Text>
            <View className="flex flex-row gap-2">
              {renderActionButtons(item)}
              <TouchableOpacity
                // Navigate to applicants
                onPress={() =>
                  router.push({
                    pathname: "/(employer-tabs)/employers/Applicants",
                    params: { jobId: item.id },
                  })
                }
                className="bg-cyan-700 p-2 rounded-full"
              >
                <MaterialIcons name="arrow-outward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center flex py-20 px-8">
      <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
      <Text className="text-xl font-quicksandBold text-gray-800 mt-4 text-center">
        No jobs found
      </Text>
      <Text className="text-gray-500 font-quicksandMedium text-sm mt-2 text-center">
        {jobs.length === 0
          ? "Start by posting your first job"
          : "Try adjusting your filters"}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredJobs}
        ListHeaderComponent={
          <View className="px-4 py-2 flex flex-row justify-between items-center">
            <Text className="text-xl font-quicksandBold text-gray-800">
              Your Job Posts ({filteredJobs.length})
            </Text>
          </View>
        }
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0E7490"]}
            tintColor="#0E7490"
          />
        }
      />
    </View>
  );
};

export default EmployerJobsList;
