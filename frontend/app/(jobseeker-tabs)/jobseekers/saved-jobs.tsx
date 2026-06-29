// app/jobseekers/saved-jobs.tsx
import { CompactJobCardSkeleton } from "@/components/skeletons/JobCardSkeleton";
import { SkeletonList } from "@/components/skeletons/SkeletonBase";
import { useAppliedSet, useBookmarksList } from "@/hooks/useBookmarks";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FILTER_TABS = [
  { key: "all", label: "All Saved" },
  { key: "applied", label: "Applied" },
  { key: "not_applied", label: "Not Applied" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

export default function SavedJobsScreen() {
  const router = useRouter();
  const { bookmarks, loading, refreshing, refresh, removeBookmark } =
    useBookmarksList();
  const { appliedIds } = useAppliedSet();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) =>
      n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      it: { bg: "#EFF6FF", text: "#1D4ED8" },
      design: { bg: "#FDF4FF", text: "#7E22CE" },
      business: { bg: "#FFF7ED", text: "#C2410C" },
      finance: { bg: "#F0FDF4", text: "#166534" },
      healthcare: { bg: "#FFF1F2", text: "#BE123C" },
      education: { bg: "#FFFBEB", text: "#92400E" },
      sales: { bg: "#F0FDFA", text: "#0F766E" },
      construction: { bg: "#FEF3C7", text: "#92400E" },
    };
    return colors[category] || { bg: "#F3F4F6", text: "#374151" };
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      it: "IT & Software",
      design: "Design",
      business: "Business",
      finance: "Finance",
      healthcare: "Healthcare",
      education: "Education",
      sales: "Sales",
      construction: "Construction",
      hospitality: "Hospitality",
      transport: "Transport",
      creative: "Creative",
      agriculture: "Agriculture",
      security: "Security",
    };
    return labels[category] || category;
  };

  const handleRemove = (jobId: string, jobTitle: string) => {
    Alert.alert("Remove bookmark", `Remove "${jobTitle}" from saved jobs?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeBookmark(jobId),
      },
    ]);
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const isApplied = appliedIds.has(b.job_id);
    if (activeFilter === "applied") return isApplied;
    if (activeFilter === "not_applied") return !isApplied;
    return true;
  });
  const PREVIEW_COUNT = 4;
  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="mb-6">
        <View className="gap-3 px-6">
          <SkeletonList
            count={PREVIEW_COUNT}
            renderItem={() => <CompactJobCardSkeleton />}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── HEADER ── */}
      <View className="pt-16 pb-5 px-5 bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#222]">
        <View className="flex-row items-center justify-between mb-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
          </TouchableOpacity>

          <View className="items-center flex-1 mx-3">
            <Text className="text-[18px] font-quicksandBold text-gray-900 dark:text-gray-100">
              Saved Jobs
            </Text>
            {bookmarks.length > 0 && (
              <Text className="text-xs font-quicksandMedium text-gray-400 mt-0.5">
                {bookmarks.length} {bookmarks.length === 1 ? "job" : "jobs"}{" "}
                saved
              </Text>
            )}
          </View>

          {/* Placeholder to balance the back button */}
          <View className="w-9" />
        </View>

        {/* ── Filter tabs ── */}
        {bookmarks.length > 0 && (
          <View className="flex-row gap-2 mt-4">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const count =
                tab.key === "all"
                  ? bookmarks.length
                  : tab.key === "applied"
                    ? bookmarks.filter((b) => appliedIds.has(b.job_id)).length
                    : bookmarks.filter((b) => !appliedIds.has(b.job_id)).length;

              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border ${
                    isActive
                      ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-700"
                      : "bg-white dark:bg-[#080A08] border-gray-200 dark:border-[#2a2a2a]"
                  }`}
                >
                  <Text
                    className={`text-xs font-quicksandBold ${
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {tab.label}
                  </Text>
                  <View
                    className={`px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-white dark:bg-[#080A08]/20" : "bg-gray-100 dark:bg-[#141414]"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-quicksandBold ${
                        isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ── EMPTY STATE ── */}
      {bookmarks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-20 h-20 rounded-3xl bg-cyan-50 items-center justify-center mb-5">
            <Ionicons name="bookmark-outline" size={36} color="#0E7490" />
          </View>
          <Text className="text-[18px] font-quicksandBold text-gray-800 dark:text-gray-200 text-center mb-2">
            No saved jobs yet
          </Text>
          <Text className="text-sm font-quicksandMedium text-gray-400 text-center leading-5 mb-6">
            Tap the bookmark icon on any job to save it here for later.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            className="bg-cyan-700 dark:bg-cyan-800 px-6 py-3 rounded-2xl flex-row items-center gap-2"
          >
            <Ionicons name="search-outline" size={16} color="white" />
            <Text className="text-white font-quicksandBold text-sm">
              Browse jobs
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredBookmarks.length === 0 ? (
        // Filter empty state
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-[#141414] items-center justify-center mb-4">
            <Ionicons name="filter-outline" size={28} color="#9CA3AF" />
          </View>
          <Text className="text-[16px] font-quicksandBold text-gray-700 dark:text-gray-300 text-center mb-1">
            No jobs here
          </Text>
          <Text className="text-sm font-quicksandMedium text-gray-400 text-center">
            No saved jobs match this filter.
          </Text>
        </View>
      ) : (
        // ── JOB LIST ────────────────────────────────────────────────────────
        <FlatList
          data={filteredBookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor="#0E7490"
            />
          }
          renderItem={({ item }) => {
            const job = item.jobs;
            if (!job) return null;

            const companyName =
              job.employer_profiles?.company_name || "Company";
            const salary = formatSalary(job.salary_min, job.salary_max);
            const jobTypes = job.job_type
              ? job.job_type.split(",").map((t: string) => t.trim())
              : [];
            const savedAgo = getTimeAgo(item.created_at);
            const isApplied = appliedIds.has(item.job_id);
            const catColor = getCategoryColor(job.category);
            const isExpiredOrClosed =
              job.status === "expired" || job.status === "closed";
            const isEmployerVerified =
              job.employer_profiles?.business_verification_status === "approved" &&
              job.employer_profiles?.premium_plan !== "free" &&
              !!job.employer_profiles?.premium_plan;

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/jobseekers/job-details/[id]",
                    params: { id: job.id },
                  })
                }
                activeOpacity={0.8}
                className="bg-white dark:bg-[#080A08] rounded-3xl overflow-hidden"
                style={{
                  shadowColor: "#94A3B8",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                }}
              >
                {/* ── Status stripe for expired/closed ── */}
                {isExpiredOrClosed && (
                  <View className="bg-amber-50 px-4 py-2 flex-row items-center gap-1.5">
                    <Ionicons name="time-outline" size={13} color="#D97706" />
                    <Text className="text-amber-700 font-quicksandBold text-[11px]">
                      {job.status === "expired"
                        ? "Listing expired"
                        : "Position closed"}
                    </Text>
                  </View>
                )}

                <View className="p-4">
                  {/* ── Top row: avatar + info + bookmark remove ── */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-3">
                      {/* Company avatar */}
                      <View className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-cyan-50 border border-cyan-100 items-center justify-center">
                        <Text className="text-xl font-quicksandBold text-cyan-600 dark:text-cyan-400">
                          {companyName.charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View className="flex-1 ml-3">
                        <View className="flex-row items-center gap-1 mb-0.5">
                          <Text
                            className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs"
                            numberOfLines={1}
                          >
                            {companyName}
                          </Text>
                          {isEmployerVerified && (
                            <MaterialIcons
                              name="verified"
                              size={11}
                              color="#0E7490"
                            />
                          )}
                        </View>
                        <Text
                          className="text-[15px] font-quicksandBold text-gray-900 dark:text-gray-100 leading-tight"
                          numberOfLines={2}
                        >
                          {job.title}
                        </Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <Ionicons
                            name="location-sharp"
                            size={11}
                            color="#0E7490"
                          />
                          <Text
                            className="text-gray-400 font-quicksandMedium text-[11px]"
                            numberOfLines={1}
                          >
                            {job.location || "Location not specified"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Remove bookmark */}
                    <TouchableOpacity
                      onPress={() => handleRemove(item.job_id, job.title)}
                      activeOpacity={0.7}
                      className="w-8 h-8 rounded-full bg-cyan-700 dark:bg-cyan-800 items-center justify-center"
                    >
                      <Ionicons name="bookmark" size={15} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* ── Tags ── */}
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    {/* Category pill */}
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: catColor.bg }}
                    >
                      <Text
                        className="text-[11px] font-quicksandBold"
                        style={{ color: catColor.text }}
                      >
                        {getCategoryLabel(job.category)}
                      </Text>
                    </View>

                    {jobTypes.slice(0, 2).map((type: string, i: number) => (
                      <View
                        key={i}
                        className="bg-gray-100 dark:bg-[#141414] px-3 py-1 rounded-full"
                      >
                        <Text className="text-gray-600 dark:text-gray-400 text-[11px] font-quicksandMedium">
                          {type}
                        </Text>
                      </View>
                    ))}

                    <View className="bg-gray-50 dark:bg-[#080A08] px-2.5 py-1 rounded-full border border-gray-100 dark:border-[#222]">
                      <Text className="text-gray-400 text-[11px] font-quicksandMedium">
                        Saved {savedAgo}
                      </Text>
                    </View>
                  </View>

                  {/* ── Footer: salary + CTA ── */}
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-[#222]">
                    <Text className="text-cyan-700 text-sm font-quicksandBold">
                      {salary}
                    </Text>

                    {isApplied ? (
                      // Applied badge
                      <View className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
                          color="#059669"
                        />
                        <Text className="text-emerald-700 text-[11px] font-quicksandBold">
                          Applied
                        </Text>
                      </View>
                    ) : isExpiredOrClosed ? (
                      // Can't apply
                      <View className="bg-gray-100 dark:bg-[#141414] px-3 py-1.5 rounded-full">
                        <Text className="text-gray-400 text-[11px] font-quicksandBold">
                          Not available
                        </Text>
                      </View>
                    ) : (
                      // Apply now CTA
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/jobseekers/job-details/[id]",
                            params: { id: job.id },
                          })
                        }
                        activeOpacity={0.8}
                        className="flex-row items-center gap-1.5 bg-gray-900 px-4 py-1.5 rounded-full"
                      >
                        <Text className="text-white text-[11px] font-quicksandBold">
                          Apply now
                        </Text>
                        <MaterialIcons
                          name="arrow-outward"
                          size={12}
                          color="white"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            filteredBookmarks.length > 0 ? (
              <View className="pt-2 pb-32 items-center">
                <Text className="text-gray-300 font-quicksandMedium text-xs">
                  {filteredBookmarks.length} saved{" "}
                  {filteredBookmarks.length === 1 ? "job" : "jobs"}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
