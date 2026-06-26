// app/(admin-tabs)/admin/Employers.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getEmployers, verifyEmployer, unverifyEmployer } from "@/lib/adminService";
import type { AdminEmployer } from "@/types/admin.types";
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

// ─── Filter chip ──────────────────────────────────────────────────────────────

type Filter = "all" | "verified" | "unverified";

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
          ? { backgroundColor: "#6366F1" }
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
      <Ionicons name="document-text-outline" size={14} color="#6366F1" />
      <Text style={styles.docLink}>{label}</Text>
      <Ionicons name="open-outline" size={12} color="#6366F1" />
    </TouchableOpacity>
  );
}

// ─── Employer card ────────────────────────────────────────────────────────────

function EmployerCard({
  employer,
  onVerify,
  onUnverify,
  isDark,
}: {
  employer: AdminEmployer;
  onVerify: (id: string) => void;
  onUnverify: (id: string) => void;
  isDark: boolean;
}) {
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";
  const divider = isDark ? "#2D2D2D" : "#F3F4F6";

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatarCircle, { backgroundColor: "#6366F120" }]}>
          <Ionicons name="business" size={20} color="#6366F1" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, { color: textPrimary }]} numberOfLines={1}>
            {employer.company_name}
          </Text>
          <Text style={[styles.cardEmail, { color: textSecondary }]} numberOfLines={1}>
            {employer.email}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: employer.is_verified ? "#D1FAE5" : "#FEE2E2",
            },
          ]}
        >
          <Ionicons
            name={employer.is_verified ? "checkmark-circle" : "close-circle"}
            size={12}
            color={employer.is_verified ? "#059669" : "#DC2626"}
          />
          <Text
            style={[
              styles.badgeText,
              { color: employer.is_verified ? "#059669" : "#DC2626" },
            ]}
          >
            {employer.is_verified ? "Verified" : "Unverified"}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <View style={styles.detailsRow}>
        {employer.phone && (
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={13} color={textSecondary} />
            <Text style={[styles.detailText, { color: textSecondary }]}>
              {employer.phone}
            </Text>
          </View>
        )}
        {(employer.city || employer.country) && (
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={13} color={textSecondary} />
            <Text style={[styles.detailText, { color: textSecondary }]}>
              {[employer.city, employer.country].filter(Boolean).join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Documents */}
      <View style={styles.docsSection}>
        <DocLink
          label="Business License"
          url={employer.business_license_url}
          isDark={isDark}
        />
        <DocLink
          label="Verification Doc"
          url={employer.verification_document_url}
          isDark={isDark}
        />
      </View>

      {/* Actions */}
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <View style={styles.actionsRow}>
        {employer.is_verified ? (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={() => onUnverify(employer.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
            <Text style={styles.actionBtnDangerText}>Unverify</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSuccess]}
            onPress={() => onVerify(employer.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color="#059669" />
            <Text style={styles.actionBtnSuccessText}>Verify Employer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminEmployers() {
  const { isDark } = useTheme();
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const bg = isDark ? "#080A08" : "#F3F4F6";

  const load = useCallback(async () => {
    try {
      const data = await getEmployers();
      setEmployers(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load employers");
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

  const handleVerify = (id: string) => {
    Alert.alert(
      "Verify Employer",
      "Are you sure you want to verify this employer? They will be marked as trusted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          style: "default",
          onPress: async () => {
            setActionLoading(id);
            try {
              await verifyEmployer(id);
              setEmployers((prev) =>
                prev.map((e) =>
                  e.id === id ? { ...e, is_verified: true } : e,
                ),
              );
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Failed to verify employer");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleUnverify = (id: string) => {
    Alert.alert(
      "Remove Verification",
      "Are you sure you want to unverify this employer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unverify",
          style: "destructive",
          onPress: async () => {
            setActionLoading(id);
            try {
              await unverifyEmployer(id);
              setEmployers((prev) =>
                prev.map((e) =>
                  e.id === id ? { ...e, is_verified: false } : e,
                ),
              );
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Failed to unverify employer");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const filtered = employers.filter((e) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "verified"
          ? e.is_verified
          : !e.is_verified;
    const matchesSearch =
      search.trim() === ""
        ? true
        : e.company_name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
          Employers
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>
          {employers.length} total · {employers.filter((e) => e.is_verified).length} verified
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
          placeholder="Search company or email…"
          placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.chips}>
        <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} isDark={isDark} />
        <FilterChip label="Verified" active={filter === "verified"} onPress={() => setFilter("verified")} isDark={isDark} />
        <FilterChip label="Unverified" active={filter === "unverified"} onPress={() => setFilter("unverified")} isDark={isDark} />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} />
            <Text style={[styles.emptyTitle, { color: isDark ? "#6B7280" : "#9CA3AF" }]}>
              No employers found
            </Text>
          </View>
        ) : (
          filtered.map((employer) => (
            <View key={employer.id} style={{ opacity: actionLoading === employer.id ? 0.5 : 1 }}>
              <EmployerCard
                employer={employer}
                onVerify={handleVerify}
                onUnverify={handleUnverify}
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
  detailsRow: { flexDirection: "row", flexWrap: "wrap", padding: 14, gap: 12 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText: { fontSize: 12, fontFamily: "Quicksand_400Regular" },
  docsSection: { paddingHorizontal: 14, paddingBottom: 12, gap: 6 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  docLink: { fontSize: 12, fontFamily: "Quicksand_600SemiBold", color: "#6366F1", flex: 1 },
  docMissing: { fontSize: 12, fontFamily: "Quicksand_400Regular" },
  actionsRow: { flexDirection: "row", padding: 12, gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
  },
  actionBtnSuccess: { backgroundColor: "#D1FAE5" },
  actionBtnSuccessText: { color: "#059669", fontFamily: "Quicksand_700Bold", fontSize: 13 },
  actionBtnDanger: { backgroundColor: "#FEE2E2" },
  actionBtnDangerText: { color: "#DC2626", fontFamily: "Quicksand_700Bold", fontSize: 13 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontFamily: "Quicksand_600SemiBold" },
});
