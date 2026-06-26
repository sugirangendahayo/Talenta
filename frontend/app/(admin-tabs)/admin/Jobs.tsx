// app/(admin-tabs)/admin/Jobs.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getAdminJobs, updateJobStatus } from "@/lib/adminService";
import type { AdminJob, JobStatus } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  active:  { label: "Active",  color: "#059669", bg: "#D1FAE5", icon: "checkmark-circle" },
  paused:  { label: "Paused",  color: "#D97706", bg: "#FEF3C7", icon: "pause-circle" },
  closed:  { label: "Closed",  color: "#DC2626", bg: "#FEE2E2", icon: "close-circle" },
  expired: { label: "Expired", color: "#6B7280", bg: "#F3F4F6", icon: "time" },
  draft:   { label: "Draft",   color: "#6366F1", bg: "#EEF2FF", icon: "create" },
};

// ─── Filter chips ─────────────────────────────────────────────────────────────

const ALL_STATUSES: Array<JobStatus | "all"> = [
  "all", "active", "paused", "closed", "expired", "draft",
];

function FilterChip({
  label,
  active,
  color,
  onPress,
  isDark,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
  isDark: boolean;
}) {
  const activeColor = color ?? "#10B981";
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active
          ? { backgroundColor: activeColor }
          : { backgroundColor: isDark ? "#2D2D2D" : "#F3F4F6" },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? "#fff" : isDark ? "#9CA3AF" : "#6B7280" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── Job card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  onChangeStatus,
  isDark,
}: {
  job: AdminJob;
  onChangeStatus: (id: string, status: JobStatus) => void;
  isDark: boolean;
}) {
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const divider = isDark ? "#2D2D2D" : "#F3F4F6";

  const canActivate = job.status !== "active";
  const canPause    = job.status === "active";
  const canClose    = job.status !== "closed";

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconBg, { backgroundColor: "#10B98120" }]}>
          <Ionicons name="briefcase" size={18} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Text
            style={[styles.cardCompany, { color: textSecondary }]}
            numberOfLines={1}
          >
            {job.employer_profiles?.company_name ?? "Unknown employer"}
          </Text>
        </View>
        <StatusBadge status={job.status} />
      </View>

      {/* Meta */}
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <View style={styles.metaRow}>
        {job.category && (
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={13} color={textSecondary} />
            <Text style={[styles.metaText, { color: textSecondary }]}>
              {job.category}
            </Text>
          </View>
        )}
        {job.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={textSecondary} />
            <Text style={[styles.metaText, { color: textSecondary }]}>
              {job.location}
            </Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={textSecondary} />
          <Text style={[styles.metaText, { color: textSecondary }]}>
            {new Date(job.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <View style={styles.actionsRow}>
        {canActivate && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#D1FAE5" }]}
            onPress={() => onChangeStatus(job.id, "active")}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle-outline" size={14} color="#059669" />
            <Text style={[styles.actionText, { color: "#059669" }]}>Activate</Text>
          </TouchableOpacity>
        )}
        {canPause && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#FEF3C7" }]}
            onPress={() => onChangeStatus(job.id, "paused")}
            activeOpacity={0.8}
          >
            <Ionicons name="pause-circle-outline" size={14} color="#D97706" />
            <Text style={[styles.actionText, { color: "#D97706" }]}>Pause</Text>
          </TouchableOpacity>
        )}
        {canClose && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#FEE2E2" }]}
            onPress={() => onChangeStatus(job.id, "closed")}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
            <Text style={[styles.actionText, { color: "#DC2626" }]}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminJobs() {
  const { isDark } = useTheme();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const bg = isDark ? "#080A08" : "#F3F4F6";

  const load = useCallback(async () => {
    try {
      const data = await getAdminJobs();
      setJobs(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load jobs");
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

  const handleChangeStatus = (jobId: string, newStatus: JobStatus) => {
    const cfg = STATUS_CONFIG[newStatus];
    const currentJob = jobs.find((j) => j.id === jobId);

    Alert.alert(
      `${cfg.label} Job`,
      `Change "${currentJob?.title}" status to ${cfg.label}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: cfg.label,
          style: newStatus === "closed" ? "destructive" : "default",
          onPress: async () => {
            setActionLoading(jobId);
            try {
              await updateJobStatus(jobId, newStatus);
              setJobs((prev) =>
                prev.map((j) =>
                  j.id === jobId ? { ...j, status: newStatus } : j,
                ),
              );
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Failed to update job");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const filtered = jobs.filter((j) => {
    const matchesStatus =
      statusFilter === "all" ? true : j.status === statusFilter;
    const matchesSearch =
      search.trim() === ""
        ? true
        : j.title.toLowerCase().includes(search.toLowerCase()) ||
          (j.employer_profiles?.company_name ?? "")
            .toLowerCase()
            .includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: bg }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
          Jobs
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
          {jobs.length} total ·{" "}
          {jobs.filter((j) => j.status === "active").length} active
        </Text>
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={16}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
        <TextInput
          style={[styles.searchInput, { color: isDark ? "#F9FAFB" : "#111827" }]}
          placeholder="Search job or company…"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={16}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {ALL_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={s === "all" ? "All" : STATUS_CONFIG[s as JobStatus].label}
            active={statusFilter === s}
            color={s === "all" ? "#10B981" : STATUS_CONFIG[s as JobStatus].color}
            onPress={() => setStatusFilter(s)}
            isDark={isDark}
          />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="briefcase-outline"
              size={48}
              color={isDark ? "#374151" : "#D1D5DB"}
            />
            <Text
              style={[styles.emptyTitle, { color: isDark ? "#6B7280" : "#9CA3AF" }]}
            >
              No jobs found
            </Text>
          </View>
        ) : (
          filtered.map((job) => (
            <View
              key={job.id}
              style={{ opacity: actionLoading === job.id ? 0.5 : 1 }}
            >
              <JobCard
                job={job}
                onChangeStatus={handleChangeStatus}
                isDark={isDark}
              />
            </View>
          ))
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
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontFamily: "Quicksand_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Quicksand_500Medium", marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Quicksand_400Regular" },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexDirection: "row",
  },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, fontFamily: "Quicksand_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 14, fontFamily: "Quicksand_700Bold" },
  cardCompany: { fontSize: 12, fontFamily: "Quicksand_400Regular", marginTop: 1 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontFamily: "Quicksand_600SemiBold" },
  divider: { height: 1, marginHorizontal: 14 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Quicksand_400Regular" },
  actionsRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { fontSize: 12, fontFamily: "Quicksand_700Bold" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontFamily: "Quicksand_600SemiBold" },
});
