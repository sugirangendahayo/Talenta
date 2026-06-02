import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useApplications } from "@/hooks/useApplications";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function Applications() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "shortlisted" | "rejected"
  >("all");
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);
  const { t } = useTranslation("jobs");

  const { applications, loading, refreshing, refresh, withdrawApplication } =
    useApplications({ status: activeFilter });

  const filters = [
    { id: "all" as const, label: t("applications.filters.all") },
    { id: "pending" as const, label: t("applications.filters.pending") },
    { id: "shortlisted" as const, label: t("applications.filters.shortlisted") },
    { id: "rejected" as const, label: t("applications.filters.rejected") },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: t("applications.status.pending"),
        };
      case "shortlisted":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: t("applications.status.shortlisted"),
        };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-700", label: t("applications.status.rejected") };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: t("applications.status.unknown") };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "hourglass-empty";
      case "shortlisted":
        return "check-circle";
      case "rejected":
        return "cancel";
      default:
        return "help";
    }
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return t("time.justNow");
    if (seconds < 3600) return t("time.minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("time.hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("time.daysAgo", { days: Math.floor(seconds / 86400) });
    return t("time.weeksAgo", { weeks: Math.floor(seconds / 604800) });
  };

  const handleWithdraw = (applicationId: string, jobTitle: string) => {
    Alert.alert(
      t("applications.withdraw.title"),
      t("applications.withdraw.message", { jobTitle }),
      [
        {
          text: t("buttons.cancel"),
          style: "cancel",
        },
        {
          text: t("applications.withdraw.confirmBtn"),
          style: "destructive",
          onPress: async () => {
            const success = await withdrawApplication(applicationId);
            if (success) {
              Alert.alert(t("applications.withdraw.successTitle"), t("applications.withdraw.successMessage"));
            } else {
              Alert.alert(t("applications.withdraw.errorTitle"), t("applications.withdraw.errorMessage"));
            }
          },
        },
      ],
    );
  };

  const handleViewJob = (jobId: string) => {
    router.push({
      pathname: "/jobseekers/job-details/[id]",
      params: { id: jobId },
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? "down" : "up";

    if (scrollDirection === "down" && currentScrollY > 50) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-6">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-quicksandBold text-gray-800">
              {t("applications.header.title")}
            </Text>
            <Text className="text-gray-500 font-quicksandMedium mt-1">
              {t("applications.header.subtitle")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={refresh}
            className="bg-cyan-100 p-3 rounded-2xl"
          >
            <Ionicons name="refresh" size={20} color="#0E7490" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex flex-row justify-between">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full border ${
                activeFilter === filter.id
                  ? "bg-cyan-700 border-cyan-700 border"
                  : "bg-white border-gray-300 border"
              }`}
            >
              <Text
                className={`font-quicksandMedium text-sm ${
                  activeFilter === filter.id ? "text-white" : "text-gray-700"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Applications Count */}
      {!loading && (
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-gray-600 font-quicksandMedium">
            {t("applications.list.showing", { count: applications.length })}
          </Text>
        </View>
      )}

      {/* Applications List */}
      {loading ? (
        <View className="flex-1 items-center justify-center flex">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="text-gray-600 font-quicksandMedium mt-4">
            {t("applications.list.loading")}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={["#0E7490"]}
              tintColor="#0E7490"
            />
          }
        >
          {applications.length > 0 ? (
            <View className="p-4">
              {applications.map((application) => {
                const status = getStatusColor(application.status);
                const salary = formatSalary(
                  application.jobs.salary_min,
                  application.jobs.salary_max,
                );
                const timeAgo = getTimeAgo(application.created_at);
                const companyName =
                  application.jobs.employer_profiles.company_name;
                const jobTypes = application.jobs.job_type
                  .split(",")
                  .map((t) => t.trim());

                return (
                  <TouchableOpacity
                    key={application.id}
                    className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-200"
                    onPress={() => handleViewJob(application.job_id)}
                  >
                    <View className="flex flex-row items-start justify-between mb-4">
                      <View className="flex flex-row items-center flex-1">
                        <View className="w-14 h-14 rounded-2xl border border-gray-200 bg-white p-2 items-center justify-center flex">
                          <Text className="text-2xl font-quicksandBold text-cyan-600">
                            {companyName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="ml-4 flex-1">
                          <Text className="text-lg font-quicksandBold text-gray-800">
                            {application.jobs.title}
                          </Text>
                          <View className="flex flex-row items-center mt-1">
                            <Text className="text-gray-600 font-quicksandMedium">
                              {companyName}
                            </Text>
                            <MaterialIcons
                              name="verified"
                              size={14}
                              color="#0E7490"
                              style={{ marginLeft: 4 }}
                            />
                          </View>
                        </View>
                      </View>
                      <View className={`${status.bg} px-3 py-1 rounded-full`}>
                        <Text
                          className={`${status.text} text-xs font-quicksandBold`}
                        >
                          {status.label}
                        </Text>
                      </View>
                    </View>

                    {/* Job Details */}
                    <View className="space-y-3">
                      <View className="flex flex-row items-center">
                        <View className="flex-1 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-xl mr-2">
                          <View className="bg-cyan-100 p-1.5 rounded-lg">
                            <Ionicons
                              name="location"
                              size={14}
                              color="#0E7490"
                            />
                          </View>
                          <Text
                            className="text-gray-700 font-quicksandSemibold text-xs ml-2 flex-1"
                            numberOfLines={1}
                          >
                            {application.jobs.location}
                          </Text>
                        </View>

                        <View className="flex-1 flex flex-row items-center bg-green-50 px-3 py-2 rounded-xl ml-2">
                          <View className="bg-green-100 p-1.5 rounded-lg">
                            <Ionicons name="cash" size={14} color="#059669" />
                          </View>
                          <Text
                            className="text-green-700 font-quicksandSemibold text-xs ml-2 flex-1"
                            numberOfLines={1}
                          >
                            {salary}
                          </Text>
                        </View>
                      </View>

                      <View className="flex flex-row items-center bg-gray-50 px-3 py-2 rounded-xl mt-2">
                        <View className="bg-purple-100 p-1.5 rounded-lg">
                          <MaterialIcons
                            name={getStatusIcon(application.status)}
                            size={14}
                            color="#7C3AED"
                          />
                        </View>
                        <Text className="text-gray-600 font-quicksandMedium text-xs ml-2">
                          {t("applications.list.applied")} {timeAgo}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex flex-row space-x-3 mt-4 gap-2">
                      <TouchableOpacity
                        onPress={() => handleViewJob(application.job_id)}
                        className="flex-1 bg-gray-100 py-2 rounded-2xl flex flex-row items-center justify-center"
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={16}
                          color="#6B7280"
                        />
                        <Text className="text-gray-700 font-quicksandMedium text-sm ml-2">
                          {t("applications.buttons.viewJob")}
                        </Text>
                      </TouchableOpacity>
                      {application.status === "pending" && (
                        <TouchableOpacity
                          onPress={() =>
                            handleWithdraw(
                              application.id,
                              application.jobs.title,
                            )
                          }
                          className="flex-1 bg-red-50 py-2 rounded-2xl flex flex-row items-center justify-center"
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={16}
                            color="#DC2626"
                          />
                          <Text className="text-red-600 font-quicksandMedium text-sm ml-2">
                            {t("applications.buttons.withdraw")}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            // Empty State
            <View className="flex-1 items-center justify-center flex py-20 px-8">
              <Ionicons name="document-outline" size={80} color="#D1D5DB" />
              <Text className="text-2xl font-quicksandBold text-gray-800 mt-6 text-center">
                {t("applications.empty.title")}
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-base mt-2 text-center">
                {activeFilter === "all"
                  ? t("applications.empty.noApplications")
                  : t("applications.empty.noFilteredApplications", { status: activeFilter })}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(jobseeker-tabs)/jobseekers/Jobs")}
                className="bg-cyan-700 rounded-2xl px-6 py-3 mt-6"
              >
                <Text className="text-white font-quicksandBold text-base">
                  {t("applications.buttons.browseJobs")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
