// app/admin/Users.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getAdminUsers } from "@/lib/adminService";
import type { AdminUser, UserRole } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; color: string; bg: string; icon: string }
> = {
  jobseeker: { label: "Jobseeker", color: "#0EA5E9", bg: "#DBEAFE", icon: "person" },
  employer:  { label: "Employer",  color: "#6366F1", bg: "#EEF2FF", icon: "business" },
  admin:     { label: "Admin",     color: "#DC2626", bg: "#FEE2E2", icon: "shield-checkmark" },
};

// ─── Filter chip ──────────────────────────────────────────────────────────────

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
  const activeColor = color ?? "#6B7280";
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

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user, isDark }: { user: AdminUser; isDark: boolean }) {
  const cfg = ROLE_CONFIG[user.role];
  const textPrimary = isDark ? "#F9FAFB" : "#111827";
  const textSecondary = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <View style={[styles.row, { borderBottomColor: isDark ? "#2D2D2D" : "#F3F4F6" }]}>
      <View style={[styles.roleIcon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.userId, { color: textPrimary }]} numberOfLines={1}>
          {user.id}
        </Text>
        <Text style={[styles.userDate, { color: textSecondary }]}>
          Joined{" "}
          {new Date(user.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
        <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type RoleFilter = UserRole | "all";

export default function AdminUsers() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  const bg = isDark ? "#080A08" : "#F3F4F6";
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";

  const load = useCallback(async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load users");
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

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    const matchesSearch =
      search.trim() === ""
        ? true
        : u.id.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const counts = {
    jobseeker: users.filter((u) => u.role === "jobseeker").length,
    employer: users.filter((u) => u.role === "employer").length,
    admin: users.filter((u) => u.role === "admin").length,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons
            name="chevron-back"
            size={22}
            color={isDark ? "#F9FAFB" : "#111827"}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>
            Users
          </Text>
          <Text
            style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}
          >
            {users.length} total · {counts.jobseeker} seekers · {counts.employer}{" "}
            employers · {counts.admin} admin
          </Text>
        </View>
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
          placeholder="Search by user ID…"
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
          label={`All (${users.length})`}
          active={roleFilter === "all"}
          color="#6B7280"
          onPress={() => setRoleFilter("all")}
          isDark={isDark}
        />
        <FilterChip
          label={`Seekers (${counts.jobseeker})`}
          active={roleFilter === "jobseeker"}
          color="#0EA5E9"
          onPress={() => setRoleFilter("jobseeker")}
          isDark={isDark}
        />
        <FilterChip
          label={`Employers (${counts.employer})`}
          active={roleFilter === "employer"}
          color="#6366F1"
          onPress={() => setRoleFilter("employer")}
          isDark={isDark}
        />
        <FilterChip
          label={`Admin (${counts.admin})`}
          active={roleFilter === "admin"}
          color="#DC2626"
          onPress={() => setRoleFilter("admin")}
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
            tintColor="#6366F1"
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
              style={[
                styles.emptyTitle,
                { color: isDark ? "#6B7280" : "#9CA3AF" },
              ]}
            >
              No users found
            </Text>
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: cardBg }]}>
            {filtered.map((user) => (
              <UserRow key={user.id} user={user} isDark={isDark} />
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  backBtn: {
    padding: 4,
    marginTop: 2,
  },
  title: { fontSize: 26, fontFamily: "Quicksand_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Quicksand_500Medium", marginTop: 2 },
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12, fontFamily: "Quicksand_600SemiBold" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  listCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  userId: {
    fontSize: 12,
    fontFamily: "Quicksand_600SemiBold",
    letterSpacing: 0.3,
  },
  userDate: { fontSize: 11, fontFamily: "Quicksand_400Regular", marginTop: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontFamily: "Quicksand_600SemiBold" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontFamily: "Quicksand_600SemiBold" },
});
