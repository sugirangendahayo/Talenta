// app/(admin-tabs)/admin/Analytics.tsx
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

const JOB_STATUS_META: Record<
  JobStatus,
  { accentHex: string; badgeBg: string; badgeText: string }
> = {
  active:  { accentHex: "#059669", badgeBg: "bg-emerald-50 dark:bg-emerald-900/20", badgeText: "text-emerald-700 dark:text-emerald-400" },
  paused:  { accentHex: "#D97706", badgeBg: "bg-amber-50 dark:bg-amber-900/20",   badgeText: "text-amber-700 dark:text-amber-400"   },
  expired: { accentHex: "#DC2626", badgeBg: "bg-red-50 dark:bg-red-900/20",       badgeText: "text-red-700 dark:text-red-400"       },
  draft:   { accentHex: "#2563EB", badgeBg: "bg-blue-50 dark:bg-blue-900/20",     badgeText: "text-blue-700 dark:text-blue-400"     },
  closed:  { accentHex: "#6B7280", badgeBg: "bg-gray-100 dark:bg-[#1e1e1e]",      badgeText: "text-gray-600 dark:text-gray-400"     },
};

function RatioBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <View className="h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-[#222] mt-2">
      <View className="h-1.5 rounded-full" style={{ backgroundColor: color, width: `${Math.max(2, pct)}%` }} />
    </View>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-5 mb-4"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
          {icon}
        </View>
        <Text className="text-[15px] font-quicksandBold text-gray-900 dark:text-gray-100">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function SplitStat({
  leftLabel, leftValue, leftColor,
  rightLabel, rightValue, rightColor,
  total,
}: {
  leftLabel: string; leftValue: number; leftColor: string;
  rightLabel: string; rightValue: number; rightColor: string;
  total: number;
}) {
  const leftPct  = total === 0 ? 0 : Math.round((leftValue / total) * 100);
  const rightPct = total === 0 ? 0 : 100 - leftPct;
  return (
    <View>
      <View className="flex-row gap-3">
        <View className="flex-1 bg-gray-50 dark:bg-[#141414] rounded-xl p-3 border border-gray-100 dark:border-[#2a2a2a]">
          <View className="flex-row items-center gap-1.5 mb-1">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: leftColor }} />
            <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400">{leftLabel}</Text>
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100">{leftValue.toLocaleString()}</Text>
          <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">{leftPct}% of total</Text>
          <RatioBar value={leftValue} total={total} color={leftColor} />
        </View>
        <View className="flex-1 bg-gray-50 dark:bg-[#141414] rounded-xl p-3 border border-gray-100 dark:border-[#2a2a2a]">
          <View className="flex-row items-center gap-1.5 mb-1">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rightColor }} />
            <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400">{rightLabel}</Text>
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100">{rightValue.toLocaleString()}</Text>
          <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">{rightPct}% of total</Text>
          <RatioBar value={rightValue} total={total} color={rightColor} />
        </View>
      </View>
      <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-2 text-right">
        {total.toLocaleString()} total
      </Text>
    </View>
  );
}

export default function AdminAnalytics() {
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
        e?.message ?? t("analytics.loadError", { defaultValue: "Failed to load analytics" })
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  const totalEmployers   = (data?.verifiedEmployers ?? 0) + (data?.unverifiedEmployers ?? 0);
  const totalJobseekers  = (data?.jobseekerWithDocs ?? 0) + (data?.jobseekerWithoutDocs ?? 0);
  const totalJobs        = Object.values(data?.jobsByStatus ?? {}).reduce((a, b) => a + b, 0);
  const jobStatusEntries = Object.entries(data?.jobsByStatus ?? {}) as [JobStatus, number][];

  const summaryStats = [
    { label: t("stats.employers",   { defaultValue: "Employers" }),   value: totalEmployers,               icon: "business-outline"       },
    { label: t("stats.jobseekers",  { defaultValue: "Jobseekers" }),  value: totalJobseekers,              icon: "people-outline"         },
    { label: t("stats.jobs",        { defaultValue: "Jobs" }),        value: totalJobs,                    icon: "briefcase-outline"      },
    { label: t("stats.applications",{ defaultValue: "Applications"}), value: data?.totalApplications ?? 0, icon: "document-text-outline"  },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">

        {/* Header */}
        <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-center justify-between border-b border-gray-100 dark:border-[#2a2a2a]">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("analytics.title", { defaultValue: "Analytics" })}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
          >
            <Ionicons name="refresh-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0E7490" colors={["#0E7490"]} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 }}
        >
          {/* Summary grid */}
          <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mb-2 ml-1">
            {t("analytics.sections.summary", { defaultValue: "Platform summary" })}
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-5">
            {summaryStats.map(({ label, value, icon }) => (
              <View
                key={label}
                className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-4 items-center"
                style={{ width: "47%", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
              >
                <View className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center mb-2">
                  <Ionicons name={icon as any} size={17} color="#0E7490" />
                </View>
                <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100">
                  {value.toLocaleString()}
                </Text>
                <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Employer verification — binary split */}
          <SectionCard
            title={t("analytics.employerVerification", { defaultValue: "Employer Verification" })}
            icon={<Ionicons name="shield-checkmark-outline" size={15} color="#0E7490" />}
          >
            <SplitStat
              leftLabel={t("employers.verified",   { defaultValue: "Verified" })}
              leftValue={data?.verifiedEmployers ?? 0}
              leftColor="#059669"
              rightLabel={t("employers.unverified", { defaultValue: "Unverified" })}
              rightValue={data?.unverifiedEmployers ?? 0}
              rightColor="#D97706"
              total={totalEmployers}
            />
          </SectionCard>

          {/* Jobseeker documents — binary split */}
          <SectionCard
            title={t("analytics.jobseekerDocs", { defaultValue: "Jobseeker Documents" })}
            icon={<Ionicons name="people-outline" size={15} color="#0E7490" />}
          >
            <SplitStat
              leftLabel={t("jobseekers.hasDocs", { defaultValue: "Has Documents" })}
              leftValue={data?.jobseekerWithDocs ?? 0}
              leftColor="#2563EB"
              rightLabel={t("jobseekers.noDocs",  { defaultValue: "No Documents" })}
              rightValue={data?.jobseekerWithoutDocs ?? 0}
              rightColor="#6B7280"
              total={totalJobseekers}
            />
          </SectionCard>

          {/* Jobs by status — status-colored chips matching the app's badge system */}
          <SectionCard
            title={t("analytics.jobsByStatus", { defaultValue: "Jobs by Status" })}
            icon={<Ionicons name="briefcase-outline" size={15} color="#0E7490" />}
          >
            <View className="flex-row flex-wrap gap-3 mb-3">
              {jobStatusEntries.map(([status, count]) => {
                const meta = JOB_STATUS_META[status];
                const pct  = totalJobs === 0 ? 0 : Math.round((count / totalJobs) * 100);
                return (
                  <View
                    key={status}
                    className={`flex-row items-center gap-2 px-3 py-3 rounded-xl ${meta.badgeBg}`}
                    style={{ minWidth: "46%" }}
                  >
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: meta.accentHex, flexShrink: 0 }} />
                    <View className="flex-1">
                      <Text className={`text-xs font-quicksandBold capitalize ${meta.badgeText}`}>
                        {t(`status.${status}`, { defaultValue: status.charAt(0).toUpperCase() + status.slice(1) })}
                      </Text>
                      <View className="flex-row items-baseline gap-1 mt-0.5">
                        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100">
                          {count.toLocaleString()}
                        </Text>
                        <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500">
                          {pct}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 text-right">
              {totalJobs.toLocaleString()} {t("filters.total", { defaultValue: "total" })}
            </Text>
          </SectionCard>
        </ScrollView>
      </View>
    </>
  );
}