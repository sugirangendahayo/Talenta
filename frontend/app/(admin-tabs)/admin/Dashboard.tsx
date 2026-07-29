// app/(admin-tabs)/admin/Dashboard.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  getAdminStats,
  getPendingReportCount,
  getRecentActivity,
} from "@/lib/adminService";
import type {
  AdminEmployer,
  AdminJob,
  AdminJobseeker,
  AdminStats,
  RecentActivity,
} from "@/types/admin.types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AdminDashboardSkeleton } from "@/components/skeletons/AdminDashboardSkeleton";
import UserAvatar from "@/components/common/UserAvatar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function RecentCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { primary: string; secondary: string; date: string; imageUrl?: string | null; verified?: boolean }[];
}) {
  return (
    <View className="px-6 pt-5">
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] items-center justify-center">
          {icon}
        </View>
        <Text className="text-[15px] font-quicksandBold text-gray-900 dark:text-gray-100">
          {title}
        </Text>
      </View>
      <View
        className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {rows.map((row, i) => (
          <View key={i}>
            <View className="flex-row items-center px-4 py-3.5">
              <View className="mr-3">
                <UserAvatar
                  imageUrl={row.imageUrl}
                  name={row.primary}
                  size={32}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Text
                    className="text-sm font-quicksandBold text-gray-800 dark:text-gray-100"
                    numberOfLines={1}
                  >
                    {row.primary}
                  </Text>
                  {row.verified && (
                    <MaterialIcons name="verified" size={12} color="#0E7490" />
                  )}
                </View>
                <Text
                  className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5"
                  numberOfLines={1}
                >
                  {row.secondary}
                </Text>
              </View>
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 ml-3">
                {formatDate(row.date)}
              </Text>
            </View>
            {i < rows.length - 1 && (
              <View className="h-px bg-gray-100 dark:bg-[#222] mx-4" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation(["admin", "common"]);
  const { unreadCount } = useNotifications();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingReports, setPendingReports] = useState(0);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [s, a, rCount] = await Promise.all([
        getAdminStats(),
        getRecentActivity(),
        getPendingReportCount(),
      ]);
      setStats(s);
      setActivity(a);
      setPendingReports(rCount);
    } catch (e: any) {
      setError(
        e?.message ??
          t("dashboard.loadError", {
            defaultValue: "Failed to load dashboard",
          }),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading && !refreshing) {
    return <AdminDashboardSkeleton />;
  }

  // Stat items — all Ionicons names, no JSX passed as icon value
  const statItems: {
    label: string;
    value: number;
    icon: React.ComponentProps<typeof Ionicons>["name"];
  }[] = [
    {
      label: t("stats.employers", { defaultValue: "Employers" }),
      value: stats?.totalEmployers ?? 0,
      icon: "business-outline",
    },
    {
      label: t("stats.jobseekers", { defaultValue: "Jobseekers" }),
      value: stats?.totalJobseekers ?? 0,
      icon: "people-outline",
    },
    {
      label: t("stats.jobs", { defaultValue: "Jobs" }),
      value: stats?.totalJobs ?? 0,
      icon: "briefcase-outline",
    },
    {
      label: t("stats.applications", { defaultValue: "Applications" }),
      value: stats?.totalApplications ?? 0,
      icon: "document-text-outline",
    },
  ];

  // Quick actions — icon is React.ReactNode, not Ionicons name string
  const quickActions: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: number;
    onPress: () => void;
  }[] = [
    {
      title: t("actions.employerVerification", {
        defaultValue: "Employer Verification",
      }),
      subtitle: t("actions.employerVerificationDesc", {
        defaultValue: "Review & verify employer accounts",
      }),
      icon: (
        <Ionicons name="shield-checkmark-outline" size={15} color="#6B7280" />
      ),
      onPress: () => router.push("/(admin-tabs)/admin/Employers"),
    },
    {
      title: t("actions.jobseekerDocs", {
        defaultValue: "Jobseeker Documents",
      }),
      subtitle: t("actions.jobseekerDocsDesc", {
        defaultValue: "Review submitted CV & ID documents",
      }),
      icon: <Ionicons name="people-outline" size={15} color="#6B7280" />,
      onPress: () => router.push("/(admin-tabs)/admin/Jobseekers"),
    },
    {
      title: t("actions.jobModeration", { defaultValue: "Job Moderation" }),
      subtitle: t("actions.jobModerationDesc", {
        defaultValue: "Pause, activate or close job listings",
      }),
      icon: <Ionicons name="briefcase-outline" size={15} color="#6B7280" />,
      onPress: () => router.push("/(admin-tabs)/admin/Jobs"),
    },
    {
      title: t("actions.usersOverview", { defaultValue: "Users Overview" }),
      subtitle: t("actions.usersOverviewDesc", {
        defaultValue: "All users by role",
      }),
      icon: <Ionicons name="people-circle-outline" size={15} color="#6B7280" />,
      onPress: () => router.push("/admin/Users"),
    },
    {
      title: t("actions.reportsInbox", { defaultValue: "Reports Inbox" }),
      subtitle: t("actions.reportsInboxDesc", {
        count: pendingReports,
        defaultValue: `${pendingReports} report${pendingReports !== 1 ? "s" : ""} awaiting review`,
      }),
      icon: <Ionicons name="flag-outline" size={15} color="#6B7280" />,
      badge: pendingReports,
      onPress: () => router.push("/(admin-tabs)/admin/Reports"),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* Header */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("dashboard.title", { defaultValue: "Dashboard" })}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
            {t("dashboard.subtitle", { defaultValue: "Platform overview" })}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => router.push("/admin/Analytics")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
          >
            <Ionicons name="bar-chart-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(admin-tabs)/admin/notifications")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
          >
            <Ionicons name="notifications-outline" size={18} color="#6B7280" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center border border-white dark:border-[#080A08]">
                <Text className="text-[9px] font-quicksandBold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6B7280"
            colors={["#6B7280"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Error */}
        {error && (
          <View className="mx-6 mt-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4">
            <Text className="text-red-500 dark:text-red-400 font-quicksandMedium text-sm">
              {error}
            </Text>
          </View>
        )}

        {/* Platform Overview — UNTOUCHED as requested, icon squircle aligned to system */}
        <View className="px-6 pt-5">
          <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-3">
            {t("dashboard.platformOverview", {
              defaultValue: "Platform Overview",
            })}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {statItems.map((item) => (
              <View
                key={item.label}
                className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-4"
                style={{
                  width: "47%",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="w-9 h-9 bg-gray-100 dark:bg-[#1e1e1e] rounded-xl items-center justify-center mb-2">
                  <Ionicons name={item.icon} size={17} color="#6B7280" />
                </View>
                <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100">
                  {item.value.toLocaleString()}
                </Text>
                <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick access — grouped in one card, quiet section label, dividers between rows */}
        <View className="px-6 pt-6">
          <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mb-3 ml-1">
            {t("dashboard.quickAccess", { defaultValue: "Quick access" })}
          </Text>
          <View
            className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {quickActions.map((action, i) => (
              <View key={action.title}>
                <TouchableOpacity
                  onPress={action.onPress}
                  activeOpacity={0.75}
                  className="flex-row items-center px-4 py-4"
                >
                  <View className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center mr-3">
                    {action.icon}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-quicksandBold text-gray-800 dark:text-gray-100">
                      {action.title}
                    </Text>
                    <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
                      {action.subtitle}
                    </Text>
                  </View>
                  {(action.badge ?? 0) > 0 && (
                    <View className="bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1 mr-2">
                      <Text className="text-[9px] font-quicksandBold text-white">
                        {(action.badge ?? 0) > 99 ? "99+" : action.badge}
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={15} color="#D1D5DB" />
                </TouchableOpacity>
                {i < quickActions.length - 1 && (
                  <View className="h-px bg-gray-100 dark:bg-[#222] mx-4" />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent employers */}
        {(activity?.recentEmployers?.length ?? 0) > 0 && (
          <RecentCard
            title={t("dashboard.newEmployers", {
              defaultValue: "New Employers",
            })}
            icon={
              <Ionicons name="business-outline" size={15} color="#6B7280" />
            }
            rows={activity!.recentEmployers.map((e: AdminEmployer) => ({
              primary: e.company_name,
              secondary: e.email,
              date: e.created_at,
              imageUrl: e.profile_image_url,
              verified:
                e.business_verification_status === "approved" &&
                !!e.premium_plan &&
                e.premium_plan !== "free",
            }))}
          />
        )}

        {/* Recent jobseekers */}
        {(activity?.recentJobseekers?.length ?? 0) > 0 && (
          <RecentCard
            title={t("dashboard.newJobseekers", {
              defaultValue: "New Jobseekers",
            })}
            icon={<Ionicons name="people-outline" size={15} color="#6B7280" />}
            rows={activity!.recentJobseekers.map((js: AdminJobseeker) => ({
              primary: js.full_name || `${(js as any).first_name || ""} ${(js as any).last_name || ""}`.trim() || "Unknown",
              secondary: js.email,
              date: js.created_at,
              imageUrl: js.profile_image_url,
              verified: js.premium_plan === "professional",
            }))}
          />
        )}

        {/* Recent jobs */}
        {(activity?.recentJobs?.length ?? 0) > 0 && (
          <RecentCard
            title={t("dashboard.newJobs", { defaultValue: "New Job Listings" })}
            icon={
              <Ionicons name="briefcase-outline" size={15} color="#6B7280" />
            }
            rows={activity!.recentJobs.map((j: AdminJob) => ({
              primary: j.title,
              secondary:
                j.employer_profiles?.company_name ??
                t("common:unknown", { defaultValue: "Unknown employer" }),
              date: j.created_at,
            }))}
          />
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
