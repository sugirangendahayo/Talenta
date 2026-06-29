// app/(admin-tabs)/admin/Analytics.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getAnalytics } from "@/lib/adminService";
import type { AdminAnalytics, JobStatus } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Simple bar ───────────────────────────────────────────────────────────────

function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-[13px] font-quicksandBold text-gray-800 dark:text-gray-200">
          {label}
        </Text>
        <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400">
          {value}{" "}
          <Text className="text-gray-400 dark:text-gray-500">({pct}%)</Text>
        </Text>
      </View>
      <View className="h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-[#222]">
        <View
          className="h-2 rounded-full"
          style={{
            backgroundColor: color,
            width: `${Math.max(2, pct)}%`, // At least a tiny dot if >0, or 2% just for visual
          }}
        />
      </View>
    </View>
  );
}

// ─── Count card ───────────────────────────────────────────────────────────────

function CountCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <View
      className="flex-1 bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-4 items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center mb-2">
        <Ionicons name={icon} size={20} color="#0E7490" />
      </View>
      <Text className="text-[28px] font-quicksandBold text-gray-800 dark:text-gray-100">
        {value.toLocaleString()}
      </Text>
      <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 mt-1 text-center">
        {label}
      </Text>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-5 mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-x-2 mb-4">
        <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
          <Ionicons name={icon} size={15} color="#0E7490" />
        </View>
        <Text className="text-[15px] font-quicksandBold text-gray-900 dark:text-gray-100">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  active: "#059669",
  paused: "#D97706",
  closed: "#6B7280",
  expired: "#DC2626",
  draft: "#2563EB",
};

export default function AdminAnalytics() {
  const { isDark } = useTheme();
  const { t } = useTranslation(["admin", "common"]);
  const router = useRouter();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ??
          t("analytics.loadError", { defaultValue: "Failed to load analytics" })
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  const totalEmployers =
    (data?.verifiedEmployers ?? 0) + (data?.unverifiedEmployers ?? 0);
  const totalJobseekers =
    (data?.jobseekerWithDocs ?? 0) + (data?.jobseekerWithoutDocs ?? 0);
  const totalJobs = Object.values(data?.jobsByStatus ?? {}).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
        {/* ── Header ── */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-center border-b border-gray-100 dark:border-[#2a2a2a]">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="mr-4 w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("analytics.title", { defaultValue: "Analytics" })}
          </Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
          onPress={onRefresh}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0E7490"
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 140,
        }}
      >
        {/* ── Summary counts ── */}
          <CountCard
            label={t("stats.applications", { defaultValue: "Applications" })}
            value={data?.totalApplications ?? 0}
            icon="document-text-outline"
          />

        {/* ── Employer verification ── */}
        <SectionCard
          title={t("analytics.employerVerification", {
            defaultValue: "Employer Verification",
          })}
          icon="business-outline"
        >
          <BarRow
            label={t("employers.verified", { defaultValue: "Verified" })}
            value={data?.verifiedEmployers ?? 0}
            total={totalEmployers}
            color="#059669"
          />
          <BarRow
            label={t("employers.unverified", { defaultValue: "Unverified" })}
            value={data?.unverifiedEmployers ?? 0}
            total={totalEmployers}
            color="#D97706"
          />
          <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-1 text-right">
            {totalEmployers} {t("filters.total", { defaultValue: "total" })}
          </Text>
        </SectionCard>

        {/* ── Jobseeker documents ── */}
        <SectionCard
          title={t("analytics.jobseekerDocs", {
            defaultValue: "Jobseeker Documents",
          })}
          icon="people-outline"
        >
          <BarRow
            label={t("jobseekers.hasDocs", { defaultValue: "Has Documents" })}
            value={data?.jobseekerWithDocs ?? 0}
            total={totalJobseekers}
            color="#2563EB"
          />
          <BarRow
            label={t("jobseekers.noDocs", { defaultValue: "No Documents" })}
            value={data?.jobseekerWithoutDocs ?? 0}
            total={totalJobseekers}
            color="#6B7280"
          />
          <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-1 text-right">
            {totalJobseekers} {t("filters.total", { defaultValue: "total" })}
          </Text>
        </SectionCard>

        {/* ── Jobs by status ── */}
        <SectionCard
          title={t("analytics.jobsByStatus", {
            defaultValue: "Jobs By Status",
          })}
          icon="briefcase-outline"
        >
          {(Object.entries(data?.jobsByStatus ?? {}) as [JobStatus, number][]).map(
            ([status, count]) => (
              <BarRow
                key={status}
                label={t(`status.${status}`, {
                  defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
                })}
                value={count}
                total={totalJobs}
                color={JOB_STATUS_COLORS[status]}
              />
            )
          )}
          <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-1 text-right">
            {totalJobs} {t("filters.total", { defaultValue: "total" })}
          </Text>
        </SectionCard>
      </ScrollView>
    </View>
    </>
  );
}
