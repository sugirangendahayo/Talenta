// app/(admin-tabs)/admin/Analytics.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getAnalytics } from "@/lib/adminService";
import type { AdminAnalytics, JobStatus } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Simple bar ───────────────────────────────────────────────────────────────

function BarRow({
  label,
  value,
  total,
  color,
  isDark,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  isDark: boolean;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const trackColor = isDark ? "#2D2D2D" : "#F3F4F6";

  return (
    <View style={styles.barRow}>
      <View style={styles.barLabelRow}>
        <Text
          style={[styles.barLabel, { color: isDark ? "#D1D5DB" : "#374151" }]}
        >
          {label}
        </Text>
        <Text
          style={[styles.barValue, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
        >
          {value} <Text style={{ color: isDark ? "#4B5563" : "#D1D5DB" }}>({pct}%)</Text>
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${pct}%`,
            },
          ]}
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
  color,
  isDark,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.countCard,
        { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
      ]}
    >
      <View style={[styles.countIconBg, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.countValue, { color: isDark ? "#F9FAFB" : "#111827" }]}>
        {value.toLocaleString()}
      </Text>
      <Text style={[styles.countLabel, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          { color: isDark ? "#9CA3AF" : "#6B7280" },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  active:  "#059669",
  paused:  "#D97706",
  closed:  "#DC2626",
  expired: "#6B7280",
  draft:   "#6366F1",
};

export default function AdminAnalytics() {
  const { isDark } = useTheme();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const bg = isDark ? "#080A08" : "#F3F4F6";

  const load = useCallback(async () => {
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load analytics");
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
      <SafeAreaView
        style={[styles.centered, { backgroundColor: bg }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#6366F1" />
      </SafeAreaView>
    );
  }

  const totalEmployers =
    (data?.verifiedEmployers ?? 0) + (data?.unverifiedEmployers ?? 0);
  const totalJobseekers =
    (data?.jobseekerWithDocs ?? 0) + (data?.jobseekerWithoutDocs ?? 0);
  const totalJobs = Object.values(data?.jobsByStatus ?? {}).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}
          >
            Analytics
          </Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </TouchableOpacity>
        </View>

        {/* Summary counts */}
        <View style={styles.countGrid}>
          <CountCard
            label="Applications"
            value={data?.totalApplications ?? 0}
            icon="document-text-outline"
            color="#6366F1"
            isDark={isDark}
          />
          <CountCard
            label="Interviews"
            value={data?.totalInterviews ?? 0}
            icon="calendar-outline"
            color="#EC4899"
            isDark={isDark}
          />
        </View>

        {/* Employer verification */}
        <SectionCard title="EMPLOYER VERIFICATION" isDark={isDark}>
          <BarRow
            label="Verified"
            value={data?.verifiedEmployers ?? 0}
            total={totalEmployers}
            color="#059669"
            isDark={isDark}
          />
          <BarRow
            label="Unverified"
            value={data?.unverifiedEmployers ?? 0}
            total={totalEmployers}
            color="#DC2626"
            isDark={isDark}
          />
          <Text
            style={[
              styles.totalText,
              { color: isDark ? "#4B5563" : "#D1D5DB" },
            ]}
          >
            {totalEmployers} employers total
          </Text>
        </SectionCard>

        {/* Jobseeker documents */}
        <SectionCard title="JOBSEEKER DOCUMENTS" isDark={isDark}>
          <BarRow
            label="Has Documents"
            value={data?.jobseekerWithDocs ?? 0}
            total={totalJobseekers}
            color="#0EA5E9"
            isDark={isDark}
          />
          <BarRow
            label="No Documents"
            value={data?.jobseekerWithoutDocs ?? 0}
            total={totalJobseekers}
            color="#9CA3AF"
            isDark={isDark}
          />
          <Text
            style={[
              styles.totalText,
              { color: isDark ? "#4B5563" : "#D1D5DB" },
            ]}
          >
            {totalJobseekers} jobseekers total
          </Text>
        </SectionCard>

        {/* Jobs by status */}
        <SectionCard title="JOBS BY STATUS" isDark={isDark}>
          {(Object.entries(data?.jobsByStatus ?? {}) as [JobStatus, number][]).map(
            ([status, count]) => (
              <BarRow
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                value={count}
                total={totalJobs}
                color={JOB_STATUS_COLORS[status]}
                isDark={isDark}
              />
            ),
          )}
          <Text
            style={[
              styles.totalText,
              { color: isDark ? "#4B5563" : "#D1D5DB" },
            ]}
          >
            {totalJobs} jobs total
          </Text>
        </SectionCard>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 16,
  },
  title: { fontSize: 26, fontFamily: "Quicksand_700Bold" },
  refreshBtn: {
    padding: 6,
    borderRadius: 10,
  },
  countGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  countCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  countIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  countValue: { fontSize: 28, fontFamily: "Quicksand_700Bold" },
  countLabel: {
    fontSize: 12,
    fontFamily: "Quicksand_500Medium",
    marginTop: 2,
    textAlign: "center",
  },
  sectionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Quicksand_700Bold",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  barRow: { marginBottom: 12 },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  barLabel: { fontSize: 13, fontFamily: "Quicksand_600SemiBold" },
  barValue: { fontSize: 12, fontFamily: "Quicksand_500Medium" },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 4,
    minWidth: 4,
  },
  totalText: {
    fontSize: 11,
    fontFamily: "Quicksand_400Regular",
    marginTop: 4,
    textAlign: "right",
  },
});
