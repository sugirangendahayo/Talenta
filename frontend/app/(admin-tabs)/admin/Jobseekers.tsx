// app/(admin-tabs)/admin/Jobseekers.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getJobseekers } from "@/lib/adminService";
import type { AdminJobseeker } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type DocFilter = "all" | "has_docs" | "no_docs";

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        active
          ? { backgroundColor: "#0EA5E9" }
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

// ─── Document link ────────────────────────────────────────────────────────────

function DocLink({
  label,
  url,
  isDark,
}: {
  label: string;
  url?: string;
  isDark: boolean;
}) {
  if (!url) {
    return (
      <View style={styles.docRow}>
        <Ionicons
          name="document-outline"
          size={14}
          color={isDark ? "#4B5563" : "#D1D5DB"}
        />
        <Text style={[styles.docMissing, { color: isDark ? "#4B5563" : "#D1D5DB" }]}>
          {label}: not uploaded
        </Text>
      </View>
    );
  }
  return (
    <TouchableOpacity
      style={styles.docRow}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.7}
    >
      <Ionicons name="document-text-outline" size={14} color="#0EA5E9" />
      <Text style={styles.docLink}>{label}</Text>
      <Ionicons name="open-outline" size={12} color="#0EA5E9" />
    </TouchableOpacity>
  );
}

// ─── Jobseeker card ───────────────────────────────────────────────────────────

function JobseekerCard({
  jobseeker,
  isDark,
}: {
  jobseeker: AdminJobseeker;
  isDark: boolean;
}) {
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const divider = isDark ? "#2D2D2D" : "#F3F4F6";

  const hasDocs = !!(jobseeker.id_document_url || jobseeker.cv_document_url);

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatarCircle, { backgroundColor: "#0EA5E920" }]}>
          <Ionicons name="person" size={20} color="#0EA5E9" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, { color: textPrimary }]} numberOfLines={1}>
            {jobseeker.first_name} {jobseeker.last_name}
          </Text>
          <Text style={[styles.cardEmail, { color: textSecondary }]} numberOfLines={1}>
            {jobseeker.email}
          </Text>
        </View>
        <View
          style={[
            styles.docsBadge,
            { backgroundColor: hasDocs ? "#DBEAFE" : "#F3F4F6" },
          ]}
        >
          <Ionicons
            name={hasDocs ? "documents" : "documents-outline"}
            size={12}
            color={hasDocs ? "#2563EB" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.docsBadgeText,
              { color: hasDocs ? "#2563EB" : "#9CA3AF" },
            ]}
          >
            {hasDocs ? "Has Docs" : "No Docs"}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <View style={styles.detailsRow}>
        {jobseeker.phone && (
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={13} color={textSecondary} />
            <Text style={[styles.detailText, { color: textSecondary }]}>
              {jobseeker.phone}
            </Text>
          </View>
        )}
        {(jobseeker.city || jobseeker.country) && (
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={13} color={textSecondary} />
            <Text style={[styles.detailText, { color: textSecondary }]}>
              {[jobseeker.city, jobseeker.country].filter(Boolean).join(", ")}
            </Text>
          </View>
        )}
        {jobseeker.experience_level && (
          <View style={styles.detailItem}>
            <Ionicons name="star-outline" size={13} color={textSecondary} />
            <Text style={[styles.detailText, { color: textSecondary }]}>
              {jobseeker.experience_level}
            </Text>
          </View>
        )}
        {jobseeker.education_level && (
          <View style={styles.detailItem}>
            <Ionicons name="school-outline" size={13} color={textSecondary} />
            <Text style={[styles.detailText, { color: textSecondary }]}>
              {jobseeker.education_level}
            </Text>
          </View>
        )}
      </View>

      {/* Documents */}
      <View style={styles.docsSection}>
        <DocLink label="ID Document" url={jobseeker.id_document_url} isDark={isDark} />
        <DocLink label="CV / Resume" url={jobseeker.cv_document_url} isDark={isDark} />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminJobseekers() {
  const { isDark } = useTheme();
  const [jobseekers, setJobseekers] = useState<AdminJobseeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<DocFilter>("all");
  const [search, setSearch] = useState("");

  const bg = isDark ? "#080A08" : "#F3F4F6";

  const load = useCallback(async () => {
    try {
      const data = await getJobseekers();
      setJobseekers(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load jobseekers");
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

  const filtered = jobseekers.filter((js) => {
    const hasDocs = !!(js.id_document_url || js.cv_document_url);
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "has_docs"
          ? hasDocs
          : !hasDocs;
    const matchesSearch =
      search.trim() === ""
        ? true
        : `${js.first_name} ${js.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          js.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const withDocs = jobseekers.filter(
    (js) => js.id_document_url || js.cv_document_url,
  ).length;

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: bg }]}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
          Jobseekers
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
          {jobseekers.length} total · {withDocs} with documents
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
          placeholder="Search name or email…"
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
      <View style={styles.chips}>
        <FilterChip
          label="All"
          active={filter === "all"}
          onPress={() => setFilter("all")}
          isDark={isDark}
        />
        <FilterChip
          label="Has Docs"
          active={filter === "has_docs"}
          onPress={() => setFilter("has_docs")}
          isDark={isDark}
        />
        <FilterChip
          label="No Docs"
          active={filter === "no_docs"}
          onPress={() => setFilter("no_docs")}
          isDark={isDark}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0EA5E9"
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={48}
              color={isDark ? "#374151" : "#D1D5DB"}
            />
            <Text
              style={[styles.emptyTitle, { color: isDark ? "#6B7280" : "#9CA3AF" }]}
            >
              No jobseekers found
            </Text>
          </View>
        ) : (
          filtered.map((js) => (
            <JobseekerCard key={js.id} jobseeker={js} isDark={isDark} />
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
  chips: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
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
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontFamily: "Quicksand_700Bold" },
  cardEmail: { fontSize: 12, fontFamily: "Quicksand_400Regular", marginTop: 1 },
  docsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  docsBadgeText: { fontSize: 11, fontFamily: "Quicksand_600SemiBold" },
  divider: { height: 1, marginHorizontal: 14 },
  detailsRow: { flexDirection: "row", flexWrap: "wrap", padding: 14, gap: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 12, fontFamily: "Quicksand_400Regular" },
  docsSection: { paddingHorizontal: 14, paddingBottom: 14, gap: 6 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  docLink: {
    fontSize: 12,
    fontFamily: "Quicksand_600SemiBold",
    color: "#0EA5E9",
    flex: 1,
  },
  docMissing: { fontSize: 12, fontFamily: "Quicksand_400Regular" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontFamily: "Quicksand_600SemiBold" },
});
