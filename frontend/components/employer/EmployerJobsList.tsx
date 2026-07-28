// components/employer/EmployerJobsList.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

interface EmployerJobsListProps {
  jobs: any[];
  selectedCategory: string;
  searchQuery: string;
  statusFilter: string;
  onRefresh: () => void;
  onScroll?: (event: any) => void;
  onEditDraft?: (job: any) => void;
}

// Single source of truth for status presentation — same accent-edge pattern
// used on ApplicationCard so both sides of the app feel like one product.
const STATUS_META: Record<
  string,
  { accent: string; badgeBg: string; badgeText: string; label: string }
> = {
  active:  { accent: "#059669", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", label: "status.active"   },
  paused:  { accent: "#D97706", badgeBg: "bg-amber-50",   badgeText: "text-amber-700",   label: "status.paused"   },
  expired: { accent: "#DC2626", badgeBg: "bg-red-50",     badgeText: "text-red-700",     label: "status.expired"  },
  draft:   { accent: "#2563EB", badgeBg: "bg-blue-50",    badgeText: "text-blue-700",    label: "status.draft"    },
  closed:  { accent: "#6B7280", badgeBg: "bg-gray-100",   badgeText: "text-gray-600",    label: "status.closed"   },
};
const DEFAULT_META = STATUS_META.closed;

const EmployerJobsList: React.FC<EmployerJobsListProps> = ({
  jobs,
  selectedCategory,
  searchQuery,
  statusFilter,
  onRefresh,
  onScroll,
  onEditDraft,
}) => {
  const router = useRouter();
  const { t } = useTranslation("jobs");
  const { isDark } = useTheme();
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const categoryMatch =
        selectedCategory === "all" || job.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase().trim();
      const searchMatch =
        searchLower === "" ||
        job.title.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower);
      const statusMatch = statusFilter === "all" || job.status === statusFilter;
      return categoryMatch && searchMatch && statusMatch;
    });
  }, [selectedCategory, searchQuery, statusFilter, jobs]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return t("salary.notSpecified");
    if (min && max) {
      const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
      return `${fmt(min)} - ${fmt(max)}`;
    }
    return min ? `From $${min.toLocaleString()}` : `Up to $${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000);
    if (diffDays === 0) return t("time.today");
    if (diffDays === 1) return t("time.yesterday");
    if (diffDays < 7) return t("time.daysAgo", { days: diffDays });
    if (diffDays < 30) return t("time.weeksAgo", { weeks: Math.floor(diffDays / 7) });
    if (diffDays < 365) return t("time.monthsAgo", { months: Math.floor(diffDays / 30) });
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    return Math.ceil(ms / 86400000);
  };

  // ── Action handlers (logic untouched, debug logs removed) ──────────────

  const handlePauseJob = async (jobId: string) => {
    try {
      const { error } = await supabase.rpc("pause_job", { job_id: jobId });
      if (error) throw error;
      toast.success(t("messages.jobPaused"));
      await onRefresh();
    } catch (error: any) {
      toast.error(error.message || t("errors.pauseJobFailed"));
    }
  };

  const handleReactivateJob = async (jobId: string) => {
    try {
      const { error } = await supabase.rpc("reactivate_job", { job_id: jobId });
      if (error) throw error;
      toast.success(t("messages.jobReactivated"));
      await onRefresh();
    } catch (error: any) {
      toast.error(error.message || t("errors.reactivateJobFailed"));
    }
  };

  const handleCloseJob = async (jobId: string) => {
    Alert.alert(t("alerts.closeJob.title"), t("alerts.closeJob.message"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.closeJob"),
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase.rpc("close_job", { job_id: jobId });
            if (error) throw error;
            toast.success(t("messages.jobClosed"));
            await onRefresh();
          } catch (error: any) {
            toast.error(error.message || t("errors.closeJobFailed"));
          }
        },
      },
    ]);
  };

  const handleRenewJob = async (jobId: string) => {
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    const expiryString = newExpiryDate.toISOString().split("T")[0];
    try {
      const { error } = await supabase.rpc("renew_job", {
        job_id: jobId,
        new_expiry_date: expiryString,
      });
      if (error) throw error;
      toast.success(t("messages.jobRenewed"));
      await onRefresh();
    } catch (error: any) {
      toast.error(error.message || t("errors.renewJobFailed"));
    }
  };

  // ── Action row ─────────────────────────────────────────────────────────
  // Plain text links separated by a thin divider — no colored icon buttons,
  // no rainbow. Each action is labeled so there's no ambiguity about what
  // the icon means. The "View applicants" link stays as the primary CTA.
  const renderActions = (job: any) => {
    const { status } = job;

    const Divider = () => (
      <View className="w-px h-3.5 bg-gray-200 dark:bg-gray-700 mx-1" />
    );

    const ActionLink = ({
      label,
      onPress,
      destructive,
    }: {
      label: string;
      onPress: () => void;
      destructive?: boolean;
    }) => (
      <TouchableOpacity
        onPress={(e) => { e.stopPropagation(); onPress(); }}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        activeOpacity={0.6}
        accessibilityRole="button"
      >
        <Text
          className={`text-xs font-quicksandBold ${
            destructive ? "text-red-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );

    if (status === "active") {
      return (
        <>
          <ActionLink
            label={t("actions.pause", { defaultValue: "Pause" })}
            onPress={() => handlePauseJob(job.id)}
          />
          <Divider />
          <ActionLink
            label={t("actions.close", { defaultValue: "Close" })}
            onPress={() => handleCloseJob(job.id)}
            destructive
          />
        </>
      );
    }
    if (status === "paused") {
      return (
        <>
          <ActionLink
            label={t("actions.reactivate", { defaultValue: "Reactivate" })}
            onPress={() => handleReactivateJob(job.id)}
          />
          <Divider />
          <ActionLink
            label={t("actions.close", { defaultValue: "Close" })}
            onPress={() => handleCloseJob(job.id)}
            destructive
          />
        </>
      );
    }
    if (status === "expired") {
      return (
        <>
          <ActionLink
            label={t("actions.renew", { defaultValue: "Renew 30d" })}
            onPress={() => handleRenewJob(job.id)}
          />
          <Divider />
          <ActionLink
            label={t("actions.close", { defaultValue: "Close" })}
            onPress={() => handleCloseJob(job.id)}
            destructive
          />
        </>
      );
    }
    if (status === "draft") {
      return (
        <ActionLink
          label={t("actions.edit", { defaultValue: "Edit draft" })}
          onPress={() => onEditDraft?.(job)}
        />
      );
    }
    if (status === "closed") {
      return (
        <Text className="text-xs font-quicksandMedium text-gray-400">
          {t("status.hiringComplete")}
        </Text>
      );
    }
    return null;
  };

  const renderJobItem = ({ item }: { item: any }) => {
    const meta = STATUS_META[item.status] ?? DEFAULT_META;
    const daysLeft = getDaysUntilExpiry(item.expires_at);
    const salary = formatSalary(item.salary_min, item.salary_max);
    const jobTypes = item.job_type
      ? item.job_type.split(",").map((t: string) => t.trim())
      : [];

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/employer/job-details/[id]",
            params: { id: item.id },
          })
        }
        activeOpacity={0.8}
        accessibilityRole="button"
        className="bg-white dark:bg-[#111111] mx-4 my-2 rounded-2xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        }}
      >

        <View className="flex-1 p-4">
          {/* Title + status badge */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-quicksandBold text-gray-800 dark:text-gray-200"
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

            <View className={`flex-row items-center ${meta.badgeBg} px-2.5 py-1 rounded-full`}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: meta.accent,
                  marginRight: 5,
                }}
              />
              <Text className={`${meta.badgeText} text-xs font-quicksandBold`}>
                {t(meta.label)}
              </Text>
            </View>
          </View>

          {/* Job type chips */}
          {jobTypes.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {jobTypes.slice(0, 2).map((type: string, i: number) => (
                <View key={i} className="bg-gray-100 dark:bg-[#222] px-3 py-1 rounded-full">
                  <Text className="text-gray-600 dark:text-gray-300 text-xs font-quicksandMedium">
                    {type}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Meta row: posted date + expiry warning */}
          <View className="flex-row items-center gap-3 mb-3">
            <Text className="text-gray-400 font-quicksandMedium text-xs">
              {formatDate(item.created_at)}
            </Text>
            {daysLeft !== null && (
              <>
                <Text className="text-gray-200 dark:text-gray-700">•</Text>
                <Text
                  className={`text-xs font-quicksandBold ${
                    daysLeft < 7
                      ? "text-red-500"
                      : daysLeft < 30
                      ? "text-amber-500"
                      : "text-gray-400"
                  }`}
                >
                  {daysLeft > 0
                    ? `${daysLeft} ${t("time.daysLeft")}`
                    : daysLeft === 0
                    ? t("time.expiresToday")
                    : t("time.expired")}
                </Text>
              </>
            )}
          </View>

          {/* Footer: salary + actions + view applicants */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-50 dark:border-[#2a2a2a]">
            <View className="flex-row items-center gap-3 flex-1 flex-shrink">
              <Text className="text-cyan-700 text-sm font-quicksandBold">
                {salary}
              </Text>
              <Text className="text-gray-200 dark:text-gray-700">|</Text>
              {renderActions(item)}
            </View>

            {/* View applicants CTA */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: "/(employer-tabs)/employers/Applicants",
                  params: { jobId: item.id },
                });
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("actions.viewApplicants", { defaultValue: "View applicants" })}
              className="w-9 h-9 rounded-full bg-cyan-700 items-center justify-center ml-3"
            >
              <MaterialIcons name="arrow-outward" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="items-center justify-center py-20 px-8">
      <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#1a1a1a] items-center justify-center mb-5">
        <Ionicons name="briefcase-outline" size={36} color={iconColor} />
      </View>
      <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-200 text-center">
        {t("empty.noJobsFound")}
      </Text>
      <Text className="text-gray-500 font-quicksandMedium text-sm mt-2 text-center leading-5">
        {jobs.length === 0
          ? t("empty.startByPosting")
          : t("empty.tryAdjustingFilters", { status: statusFilter })}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <FlatList
        data={filteredJobs}
        ListHeaderComponent={
          <View className="px-5 py-3">
            <Text className="text-gray-400 font-quicksandMedium text-xs">
              {t("list.yourJobPosts", { count: filteredJobs.length })}
            </Text>
          </View>
        }
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 4, paddingBottom: 32 }}
        ListEmptyComponent={renderEmptyState}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0E7490"]}
            tintColor="#0E7490"
          />
        }
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default EmployerJobsList;