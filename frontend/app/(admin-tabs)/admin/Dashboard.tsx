// app/(admin-tabs)/admin/Dashboard.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getAdminStats,
  getRecentActivity,
} from "@/lib/adminService";
import type {
  AdminEmployer,
  AdminJob,
  AdminJobseeker,
  AdminStats,
  RecentActivity,
} from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
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
        styles.statCard,
        { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
      ]}
    >
      <View style={[styles.statIconBg, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: isDark ? "#F9FAFB" : "#111827" }]}>
        {value.toLocaleString()}
      </Text>
      <Text style={[styles.statLabel, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

function QuickActionCard({
  title,
  subtitle,
  icon,
  color,
  onPress,
  isDark,
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.quickCard,
        { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.quickIconBg, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.quickTitle, { color: isDark ? "#F9FAFB" : "#111827" }]}
        >
          {title}
        </Text>
        <Text
          style={[styles.quickSubtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={isDark ? "#4B5563" : "#D1D5DB"}
      />
    </TouchableOpacity>
  );
}

// ─── Recent Row ───────────────────────────────────────────────────────────────

function RecentRow({
  primary,
  secondary,
  date,
  isDark,
}: {
  primary: string;
  secondary: string;
  date: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.recentRow}>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.recentPrimary, { color: isDark ? "#F3F4F6" : "#111827" }]}
          numberOfLines={1}
        >
          {primary}
        </Text>
        <Text
          style={[styles.recentSecondary, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
          numberOfLines={1}
        >
          {secondary}
        </Text>
      </View>
      <Text style={[styles.recentDate, { color: isDark ? "#6B7280" : "#9CA3AF" }]}>
        {formatDate(date)}
      </Text>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={[styles.sectionHeader, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
      {title}
    </Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bg = isDark ? "#080A08" : "#F3F4F6";
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";

  const load = useCallback(async () => {
    try {
      setError(null);
      const [s, a] = await Promise.all([getAdminStats(), getRecentActivity()]);
      setStats(s);
      setActivity(a);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load dashboard");
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
          <View>
            <Text style={[styles.greeting, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
              Admin Panel
            </Text>
            <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
              Dashboard
            </Text>
          </View>
          <View style={[styles.avatarBadge, { backgroundColor: "#6366F1" }]}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Grid */}
        <SectionHeader title="PLATFORM OVERVIEW" isDark={isDark} />
        <View style={styles.statsGrid}>
          <StatCard
            label="Employers"
            value={stats?.totalEmployers ?? 0}
            icon="business-outline"
            color="#6366F1"
            isDark={isDark}
          />
          <StatCard
            label="Jobseekers"
            value={stats?.totalJobseekers ?? 0}
            icon="people-outline"
            color="#0EA5E9"
            isDark={isDark}
          />
          <StatCard
            label="Jobs"
            value={stats?.totalJobs ?? 0}
            icon="briefcase-outline"
            color="#10B981"
            isDark={isDark}
          />
          <StatCard
            label="Applications"
            value={stats?.totalApplications ?? 0}
            icon="document-text-outline"
            color="#F59E0B"
            isDark={isDark}
          />
          <StatCard
            label="Interviews"
            value={stats?.totalInterviews ?? 0}
            icon="calendar-outline"
            color="#EC4899"
            isDark={isDark}
          />
        </View>

        {/* Quick Actions */}
        <SectionHeader title="QUICK ACCESS" isDark={isDark} />
        <QuickActionCard
          title="Employer Verification"
          subtitle="Review & verify employer accounts"
          icon="business-outline"
          color="#6366F1"
          onPress={() => router.push("/(admin-tabs)/admin/Employers")}
          isDark={isDark}
        />
        <QuickActionCard
          title="Jobseeker Documents"
          subtitle="Review submitted CV & ID documents"
          icon="people-outline"
          color="#0EA5E9"
          onPress={() => router.push("/(admin-tabs)/admin/Jobseekers")}
          isDark={isDark}
        />
        <QuickActionCard
          title="Job Moderation"
          subtitle="Pause, activate or close job listings"
          icon="briefcase-outline"
          color="#10B981"
          onPress={() => router.push("/(admin-tabs)/admin/Jobs")}
          isDark={isDark}
        />
        <QuickActionCard
          title="Users Overview"
          subtitle="All users by role"
          icon="people-circle-outline"
          color="#F59E0B"
          onPress={() => router.push("/admin/Users")}
          isDark={isDark}
        />

        {/* Recent Employers */}
        {(activity?.recentEmployers?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="NEW EMPLOYERS" isDark={isDark} />
            <View style={[styles.recentCard, { backgroundColor: cardBg }]}>
              {activity!.recentEmployers.map((e: AdminEmployer, i: number) => (
                <View key={e.id}>
                  <RecentRow
                    primary={e.company_name}
                    secondary={e.email}
                    date={e.created_at}
                    isDark={isDark}
                  />
                  {i < activity!.recentEmployers.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6" },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Recent Jobseekers */}
        {(activity?.recentJobseekers?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="NEW JOBSEEKERS" isDark={isDark} />
            <View style={[styles.recentCard, { backgroundColor: cardBg }]}>
              {activity!.recentJobseekers.map(
                (js: AdminJobseeker, i: number) => (
                  <View key={js.id}>
                    <RecentRow
                      primary={`${js.first_name} ${js.last_name}`}
                      secondary={js.email}
                      date={js.created_at}
                      isDark={isDark}
                    />
                    {i < activity!.recentJobseekers.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6" },
                        ]}
                      />
                    )}
                  </View>
                ),
              )}
            </View>
          </>
        )}

        {/* Recent Jobs */}
        {(activity?.recentJobs?.length ?? 0) > 0 && (
          <>
            <SectionHeader title="NEW JOB LISTINGS" isDark={isDark} />
            <View style={[styles.recentCard, { backgroundColor: cardBg }]}>
              {activity!.recentJobs.map((j: AdminJob, i: number) => (
                <View key={j.id}>
                  <RecentRow
                    primary={j.title}
                    secondary={
                      j.employer_profiles?.company_name ?? "Unknown employer"
                    }
                    date={j.created_at}
                    isDark={isDark}
                  />
                  {i < activity!.recentJobs.length - 1 && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6" },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

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
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: { fontSize: 12, fontFamily: "Quicksand_600SemiBold", letterSpacing: 1 },
  title: { fontSize: 26, fontFamily: "Quicksand_700Bold", marginTop: 2 },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#DC2626", fontFamily: "Quicksand_500Medium", fontSize: 13 },
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Quicksand_700Bold",
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 4,
  },
  statCard: {
    width: "47%",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 24, fontFamily: "Quicksand_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Quicksand_500Medium", marginTop: 2 },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quickIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: { fontSize: 14, fontFamily: "Quicksand_700Bold" },
  quickSubtitle: { fontSize: 12, fontFamily: "Quicksand_400Regular", marginTop: 2 },
  recentCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 4,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  recentPrimary: { fontSize: 13, fontFamily: "Quicksand_600SemiBold" },
  recentSecondary: { fontSize: 11, fontFamily: "Quicksand_400Regular", marginTop: 1 },
  recentDate: { fontSize: 11, fontFamily: "Quicksand_500Medium" },
  divider: { height: 1, marginHorizontal: -14 },
});
