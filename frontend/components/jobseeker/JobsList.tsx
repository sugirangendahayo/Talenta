// components/jobseeker/JobsList.tsx
import { useJobs } from "@/hooks/useJobs";
import { useBookmarkSet, useAppliedSet } from "@/hooks/useBookmarks";
import { FullJobCardSkeleton } from "@/components/skeletons/JobCardSkeleton";
import { SkeletonList } from "@/components/skeletons/SkeletonBase";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/common/UserAvatar";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
  Text,
} from "react-native";


interface JobsListProps {
  selectedCategory: string;
  searchQuery: string;
  onScroll?: (event: any) => void;
}

const JobsList: React.FC<JobsListProps> = ({
  selectedCategory,
  searchQuery,
  onScroll,
}) => {
  const router = useRouter();
  const { t } = useTranslation(["home", "jobs"]);

  // ─── Shared bookmark & applied state ───────────────────────────────────────
  // Same hooks HomeJobs.tsx uses, so a bookmark made here, on Home, or on the
  // job details screen all read from the same source of truth and never drift.
  const { bookmarkedIds, toggleInSet } = useBookmarkSet();
  const { appliedIds } = useAppliedSet();

  const {
    jobs,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    newJobsCount,
    loadMore,
    refresh,
    loadNewJobs,
  } = useJobs({
    category: selectedCategory,
    searchQuery: searchQuery,
    pageSize: 10,
    recommended: false,
  });

  const handleJobPress = (jobId: string) => {
    router.push({
      pathname: "/jobseekers/job-details/[id]",
      params: { id: jobId },
    });
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
      return `$${num}`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return t("jobs:time.justNow");
    if (seconds < 3600) return t("jobs:time.minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("jobs:time.hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("jobs:time.daysAgo", { days: Math.floor(seconds / 86400) });
    return t("jobs:time.weeksAgo", { weeks: Math.floor(seconds / 604800) });
  };

  const renderJobItem = ({ item }: { item: any }) => {
    const companyName = item.employer_profiles?.company_name || "Company";
    const salary = formatSalary(item.salary_min, item.salary_max);
    const timeAgo = getTimeAgo(item.created_at);
    const jobTypes = item.job_type
      ? item.job_type.split(",").map((t: string) => t.trim())
      : [];
    const isBookmarked = bookmarkedIds.has(item.id);
    const isApplied = appliedIds.has(item.id);
    const isEmployerVerified =
      item.employer_profiles?.business_verification_status === "approved" &&
      item.employer_profiles?.premium_plan !== "free" &&
      !!item.employer_profiles?.premium_plan;

    return (
      <TouchableOpacity
        className="bg-white dark:bg-[#080A08] mx-4 my-2 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-[#222]"
        onPress={() => handleJobPress(item.id)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${item.title} ${t("jobs:at", { defaultValue: "at" })} ${companyName}`}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1 mr-3">
            <UserAvatar 
              imageUrl={item.employer_profiles?.profile_image_url} 
              name={companyName} 
              size={48} 
            />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center gap-1">
                <Text
                  className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs"
                  numberOfLines={1}
                >
                  {companyName}
                </Text>
                {isEmployerVerified && (
                  <MaterialIcons name="verified" size={12} color="#0E7490" />
                )}
              </View>
              <Text
                className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 mt-0.5"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons name="location-sharp" size={11} color="#0E7490" />
                <Text
                  className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs"
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Bookmark ── now actually wired up (it had no onPress before),
              fixed 40x40 tap area + hitSlop so it doesn't get swallowed by the
              card's own onPress underneath it. */}
          <TouchableOpacity
            onPress={() => toggleInSet(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityState={{ selected: isBookmarked }}
            accessibilityLabel={
              isBookmarked
                ? t("home:featuredJobs.unsave", { defaultValue: "Remove from saved jobs" })
                : t("home:featuredJobs.save", { defaultValue: "Save job" })
            }
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isBookmarked ? "bg-cyan-700 dark:bg-cyan-800" : "bg-gray-100 dark:bg-[#141414]"
            }`}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={16}
              color={isBookmarked ? "#ffffff" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        {/* Tags + posted date */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          {jobTypes.slice(0, 2).map((type: string, index: number) => (
            <View key={index} className="bg-gray-100 dark:bg-[#141414] px-3 py-1.5 rounded-full">
              <Text className="text-gray-600 dark:text-gray-400 text-xs font-quicksandMedium">{type}</Text>
            </View>
          ))}
          <View className="bg-gray-50 dark:bg-[#080A08] px-3 py-1.5 rounded-full border border-gray-100 dark:border-[#222]">
            <Text className="text-gray-400 text-xs font-quicksandMedium">{timeAgo}</Text>
          </View>
        </View>

        {/* Description preview — separated from the time-ago label instead of
            sharing one run-on Text block */}
        <Text
          className="text-gray-500 dark:text-gray-400 text-sm font-quicksandMedium mb-3 leading-5"
          numberOfLines={2}
        >
          {item.description}
        </Text>

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-[#222]">
          <Text className="text-cyan-700 text-sm font-quicksandBold">{salary}</Text>

          {/* ── Applied vs open ──────────────────────────────────────────────
              Already-applied jobs get the same quiet badge as Home (nothing to
              misfire). Otherwise, the circular arrow now actually does
              something — it was rendered with no onPress at all before — and
              carries the same hitSlop treatment as the bookmark button. */}
          {isApplied ? (
            <View
              accessible
              accessibilityLabel={t("home:featuredJobs.applied", { defaultValue: "Applied" })}
              className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-full"
            >
              <Ionicons name="checkmark-circle" size={13} color="#059669" />
              <Text className="text-emerald-700 text-xs font-quicksandBold">
                {t("home:featuredJobs.applied", { defaultValue: "Applied" })}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleJobPress(item.id)}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t("home:featuredJobs.applyTo", {
                defaultValue: `Apply to ${item.title}`,
              })}
              className="bg-cyan-700 dark:bg-cyan-800 w-10 h-10 rounded-full items-center justify-center"
            >
              <MaterialIcons name="arrow-outward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {newJobsCount > 0 && (
        <TouchableOpacity
          className="mx-4 mb-3 bg-cyan-600 p-3 rounded-2xl flex flex-row items-center justify-center"
          onPress={loadNewJobs}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={16} color="white" />
          <Text className="text-white font-quicksandBold text-sm ml-2">
            {t("home:stats.newAvailable", { count: newJobsCount })}
          </Text>
        </TouchableOpacity>
      )}
      <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200 px-4 pb-2">
        {t("jobs:allAvailable")}
      </Text>
    </>
  );

  // ─── Pagination footer: small spinner (this is fine — it's not the initial load) ──
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#0E7490" />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View className="flex-1 items-center justify-center flex py-20 px-8">
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-200 mt-4 text-center">
          {t("home:emptyStates.noJobs")}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-sm mt-2 text-center">
          {error ? error : t("home:search.noResults")}
        </Text>
      </View>
    );
  };

  // ─── Initial load → full-screen skeleton list ─────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
        {/* Keep the header visible so the screen doesn't jump */}
        <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200 px-4 py-3">
          {t("jobs:allAvailable")}
        </Text>
        <SkeletonList
          count={6}
          renderItem={() => <FullJobCardSkeleton />}
          staggerMs={60}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <FlatList
        data={jobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#0E7490"]}
            tintColor="#0E7490"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default JobsList;