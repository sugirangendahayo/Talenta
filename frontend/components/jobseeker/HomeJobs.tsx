// components/jobseeker/HomeJobs.tsx
import { useJobs } from "@/hooks/useJobs";
import { useSkillMatch } from "@/hooks/useSkillMatch";
import { useBookmarkSet, useAppliedSet } from "@/hooks/useBookmarks";
import { CompactJobCardSkeleton } from "@/components/skeletons/JobCardSkeleton";
import { SkeletonList } from "@/components/skeletons/SkeletonBase";
import SkillMatchBadge from "@/components/common/SkillMatchBadge";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/common/UserAvatar";

interface HomeJobsProps {
  selectedCategory: string;
  searchQuery: string;
}

const PREVIEW_COUNT = 4;

const HomeJobs: React.FC<HomeJobsProps> = ({ selectedCategory, searchQuery }) => {
  const router = useRouter();
  const { t } = useTranslation(["home", "jobs"]);

  // ─── Skill matching (reads from AuthContext — no extra DB call) ────────────
  const { getMatchForJob, sortJobsByMatch, hasSkills } = useSkillMatch();

  // ─── Bookmark & applied state ─────────────────────────────────────────────
  const { bookmarkedIds, toggleInSet } = useBookmarkSet();
  const { appliedIds } = useAppliedSet();

  const { jobs, loading, newJobsCount, loadNewJobs } = useJobs({
    category: selectedCategory,
    searchQuery,
    pageSize: PREVIEW_COUNT,
  });

  // Sort jobs by skill-match score (best first). Stable, memoised.
  const sortedJobs = useMemo(() => sortJobsByMatch(jobs), [jobs, sortJobsByMatch]);

  const handleJobPress = (jobId: string) => {
    router.push({ pathname: "/jobseekers/job-details/[id]", params: { id: jobId } });
  };

  const handleViewAll = () => {
    router.push("../../app/(jobseeker-tabs)/jobseekers/Jobs.tsx" as any);
  };

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
    return `${fmt(min)} - ${fmt(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return t("jobs:time.justNow");
    if (seconds < 3600) return t("jobs:time.minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("jobs:time.hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("jobs:time.daysAgo", { days: Math.floor(seconds / 86400) });
    return t("jobs:time.weeksAgo", { weeks: Math.floor(seconds / 604800) });
  };

  const isRecommending =
    hasSkills &&
    !searchQuery &&
    selectedCategory === "all";

  // ─── Section header ───────────────────────────────────────────────────────
  const SectionHeader = () => (
    <View className="flex-row items-start justify-between px-6 mb-4 gap-3">
      <View className="flex-1">
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-200" numberOfLines={1}>
          {isRecommending
            ? t("home:recommended.title", { defaultValue: "Recommended" })
            : t("home:featuredJobs.title", { defaultValue: "Latest Jobs" })}
        </Text>
        {isRecommending && (
          <Text
            className="text-xs font-quicksandMedium text-gray-400 mt-0.5"
            numberOfLines={1}
          >
            {t("home:recommended.basedOnSkills", { defaultValue: "Based on your skills" })}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={handleViewAll}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="flex-row items-center gap-1 flex-shrink-0 pt-0.5"
      >
        <Text className="text-cyan-700 font-quicksandBold text-sm">
          {t("home:featuredJobs.viewAll", { defaultValue: "View All" })}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#0E7490" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="mb-6">
        <SectionHeader />
        <View className="gap-3 px-6">
          <SkeletonList count={PREVIEW_COUNT} renderItem={() => <CompactJobCardSkeleton />} />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <SectionHeader />

      {/* New Jobs Banner */}
      {newJobsCount > 0 && (
        <TouchableOpacity
          className="mx-6 mb-3 bg-cyan-600 p-3 rounded-2xl flex-row items-center justify-center"
          onPress={loadNewJobs}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={16} color="white" />
          <Text className="text-white font-quicksandBold text-sm ml-2">
            {t("home:stats.newAvailable", {
              count: newJobsCount,
              defaultValue: `${newJobsCount} new jobs`,
            })}
          </Text>
        </TouchableOpacity>
      )}

      {/* Job Cards */}
      {sortedJobs.length === 0 ? (
        <View className="items-center py-12 px-8">
          <Ionicons name="search-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-sm mt-3 text-center">
            {t("home:search.noResults", { defaultValue: "No jobs found. Try a different search." })}
          </Text>
        </View>
      ) : (
        <View className="gap-3 px-6">
          {sortedJobs.slice(0, PREVIEW_COUNT).map((item: any) => {
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

            // Compute match score for this job
            const match = getMatchForJob(item);

            return (
              <TouchableOpacity
                key={item.id}
                className="bg-white dark:bg-[#080A08] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-[#222]"
                onPress={() => handleJobPress(item.id)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <TouchableOpacity 
                    onPress={() => router.push({
                      pathname: "/(shared)/user/[id]",
                      params: { id: item.employer_id, role: 'employer' }
                    })}
                    activeOpacity={0.75}
                    className="flex-row items-center flex-1 mr-3"
                  >
                    {/* Company avatar */}
                    <UserAvatar 
                      imageUrl={item.employer_profiles?.profile_image_url} 
                      name={companyName} 
                      size={48} 
                    />
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center gap-1">
                        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs">
                          {companyName}
                        </Text>
                        {isEmployerVerified && (
                          <MaterialIcons name="verified" size={12} color="#0E7490" />
                        )}
                      </View>
                      <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 mt-0.5">
                        {item.title}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name="location-sharp" size={11} color="#0E7490" />
                        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs">
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Bookmark button */}
                  <TouchableOpacity
                    onPress={async () => {
                      const wasSaved = bookmarkedIds.has(item.id);
                      await toggleInSet(item.id);
                      if (wasSaved) {
                        toast(t("home:featuredJobs.removedFromSaved", { defaultValue: "Removed from saved jobs" }));
                      } else {
                        toast.success(t("home:featuredJobs.savedJob", { defaultValue: "Job saved!" }));
                      }
                    }}
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

                {/* Tags row — includes skill match badge */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {jobTypes.slice(0, 2).map((type: string, index: number) => (
                    <View key={index} className="bg-gray-100 dark:bg-[#141414] px-3 py-1 rounded-full">
                      <Text className="text-gray-600 dark:text-gray-400 text-xs font-quicksandMedium">{type}</Text>
                    </View>
                  ))}
                  <View className="bg-gray-50 dark:bg-[#080A08] px-3 py-1 rounded-full border border-gray-100 dark:border-[#222]">
                    <Text className="text-gray-400 text-xs font-quicksandMedium">{timeAgo}</Text>
                  </View>
                  {/* Skill match badge */}
                  <SkillMatchBadge match={hasSkills ? match : null} />
                </View>

                {/* Footer */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 dark:border-[#222]">
                  <Text className="text-cyan-700 text-sm font-quicksandBold">{salary}</Text>

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
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
          })}
        </View>
      )}

      {/* View All */}
      {sortedJobs.length > 0 && (
        <TouchableOpacity
          onPress={handleViewAll}
          className="mx-6 mt-4 bg-gray-50 dark:bg-[#080A08] rounded-2xl p-4 flex-row items-center justify-center gap-2"
          activeOpacity={0.8}
        >
          <Text className="text-cyan-700 font-quicksandBold text-sm">
            {t("home:featuredJobs.viewAllJobs", { defaultValue: "View All Jobs" })}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#0E7490" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeJobs;