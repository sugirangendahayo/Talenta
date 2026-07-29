import BulkActionSheet, { type BulkAction } from "@/components/admin/BulkActionSheet";
import SelectionToolbar from "@/components/admin/SelectionToolbar";
import { useTheme } from "@/contexts/ThemeContext";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import {
  bulkBanUsers,
  bulkSetUnderReview,
  bulkSuspendUsers,
  bulkUnbanUsers,
  bulkUnsuspendUsers,
  getAdminUsers,
} from "@/lib/adminService";
import type { AdminUser, UserRole } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  jobseeker: { label: "Jobseeker", color: "#0EA5E9", bg: "#DBEAFE", icon: "person" },
  employer: { label: "Employer", color: "#6366F1", bg: "#EEF2FF", icon: "business" },
  admin: { label: "Admin", color: "#DC2626", bg: "#FEE2E2", icon: "shield-checkmark" },
};

const BULK_ACTIONS: BulkAction[] = [
  { id: "suspend", label: "Suspend", icon: "time-outline", requiresReason: true, requiresDuration: true },
  { id: "unsuspend", label: "Unsuspend", icon: "play-circle-outline", requiresReason: true },
  { id: "review", label: "Put under review", icon: "eye-outline", requiresReason: true },
  { id: "ban", label: "Ban", icon: "ban-outline", style: "destructive", requiresReason: true },
  { id: "unban", label: "Unban", icon: "checkmark-circle-outline", requiresReason: true },
];

function FilterChip({ label, active, color, onPress, isDark }: { label: string; active: boolean; color?: string; onPress: () => void; isDark: boolean }) {
  const activeColor = color ?? "#6B7280";
  return <TouchableOpacity style={[styles.chip, { backgroundColor: active ? activeColor : isDark ? "#2D2D2D" : "#F3F4F6" }]} onPress={onPress} activeOpacity={0.75}><Text style={[styles.chipText, { color: active ? "#fff" : isDark ? "#9CA3AF" : "#6B7280" }]}>{label}</Text></TouchableOpacity>;
}

function UserRow({ user, isDark, selected, selectionMode, onPress, onLongPress }: { user: AdminUser; isDark: boolean; selected: boolean; selectionMode: boolean; onPress: () => void; onLongPress: () => void }) {
  const cfg = ROLE_CONFIG[user.role];
  const unselectable = user.role === "admin";
  return <TouchableOpacity disabled={unselectable} onPress={onPress} onLongPress={onLongPress} delayLongPress={350} activeOpacity={unselectable ? 1 : 0.7} style={[styles.row, { borderBottomColor: isDark ? "#2D2D2D" : "#F3F4F6", backgroundColor: selected ? (isDark ? "#083344" : "#ECFEFF") : "transparent" }]}>
    {selectionMode && !unselectable ? <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? "#0E7490" : isDark ? "#6B7280" : "#9CA3AF"} /> : <View style={[styles.roleIcon, { backgroundColor: cfg.bg }]}><Ionicons name={cfg.icon} size={16} color={cfg.color} /></View>}
    <View style={{ flex: 1 }}>
      <Text style={[styles.userName, { color: isDark ? "#F9FAFB" : "#111827" }]} numberOfLines={1}>{user.display_name || "Unnamed"}</Text>
      {user.username ? <Text style={[styles.username, { color: isDark ? "#67E8F9" : "#0E7490" }]} numberOfLines={1}>@{user.username}</Text> : null}
      <Text style={[styles.userDate, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</Text>
    </View>
    {unselectable ? <Ionicons name="lock-closed-outline" size={15} color={isDark ? "#6B7280" : "#9CA3AF"} /> : <View style={[styles.badge, { backgroundColor: cfg.bg }]}><Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text></View>}
  </TouchableOpacity>;
}

type RoleFilter = UserRole | "all";

export default function AdminUsers() {
  const { isDark } = useTheme();
  const router = useRouter();
  const select = useMultiSelect();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [actionsVisible, setActionsVisible] = useState(false);
  const bg = isDark ? "#080A08" : "#F3F4F6";

  const load = useCallback(async () => { try { setUsers(await getAdminUsers()); } catch (e: any) { Alert.alert("Error", e?.message ?? "Failed to load users"); } finally { setLoading(false); setRefreshing(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const filtered = users.filter((u) => (roleFilter === "all" || u.role === roleFilter) && (!search.trim() || [u.display_name, u.username, u.email, u.id].some((value) => value?.toLowerCase().includes(search.toLowerCase()))));
  const selectableIds = filtered.filter((u) => u.role !== "admin").map((u) => u.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(select.isSelected);
  const counts = { jobseeker: users.filter((u) => u.role === "jobseeker").length, employer: users.filter((u) => u.role === "employer").length, admin: users.filter((u) => u.role === "admin").length };

  const runBulkAction = async (action: string, reason = "", duration?: number) => {
    try {
      const ids = select.selectedList;
      const result = action === "suspend" ? await bulkSuspendUsers(ids, reason, duration ?? 24)
        : action === "unsuspend" ? await bulkUnsuspendUsers(ids, reason)
        : action === "review" ? await bulkSetUnderReview(ids, reason)
        : action === "ban" ? await bulkBanUsers(ids, reason)
        : await bulkUnbanUsers(ids, reason);
      const message = `${result.succeeded.length} succeeded, ${result.failed.length} failed`;
      if (result.failed.length) toast.error(message);
      else toast.success(message);
      select.exitSelectionMode();
      await load();
    } catch (e: any) { toast.error(e?.message ?? "Bulk action failed"); }
  };

  if (loading) return <SafeAreaView style={[styles.centered, { backgroundColor: bg }]} edges={["top"]}><ActivityIndicator size="large" color="#0E7490" /></SafeAreaView>;
  return <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top"]}>
    {select.selectionMode ? <SelectionToolbar count={select.count} allSelected={allSelected} onToggleAll={() => allSelected ? select.deselectAll() : select.selectAll(selectableIds)} onClose={select.exitSelectionMode} /> : <View style={styles.header}><TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={22} color={isDark ? "#F9FAFB" : "#111827"} /></TouchableOpacity><View style={{ flex: 1 }}><Text style={[styles.title, { color: isDark ? "#F9FAFB" : "#111827" }]}>Users</Text><Text style={[styles.subtitle, { color: isDark ? "#9CA3AF" : "#6B7280" }]}>{users.length} total · {counts.jobseeker} seekers · {counts.employer} employers · {counts.admin} admin</Text></View></View>}
    {!select.selectionMode && <View style={[styles.searchBar, { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" }]}><Ionicons name="search-outline" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} /><TextInput style={[styles.searchInput, { color: isDark ? "#F9FAFB" : "#111827" }]} placeholder="Search by name, username, or email…" placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"} value={search} onChangeText={setSearch} />{search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={16} color={isDark ? "#6B7280" : "#9CA3AF"} /></TouchableOpacity>}</View>}
    <View style={styles.chips}>{([ ["all", `All (${users.length})`, "#6B7280"], ["jobseeker", `Seekers (${counts.jobseeker})`, "#0EA5E9"], ["employer", `Employers (${counts.employer})`, "#6366F1"], ["admin", `Admin (${counts.admin})`, "#DC2626"] ] as [RoleFilter, string, string][]).map(([key, label, color]) => <FilterChip key={key} label={label} active={roleFilter === key} color={color} onPress={() => setRoleFilter(key)} isDark={isDark} />)}</View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#0E7490" />}>
      {filtered.length === 0 ? <View style={styles.emptyState}><Ionicons name="people-outline" size={48} color={isDark ? "#374151" : "#D1D5DB"} /><Text style={[styles.emptyTitle, { color: isDark ? "#6B7280" : "#9CA3AF" }]}>No users found</Text></View> : <View style={[styles.listCard, { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" }]}>{filtered.map((user) => <UserRow key={user.id} user={user} isDark={isDark} selected={select.isSelected(user.id)} selectionMode={select.selectionMode} onLongPress={() => { if (user.role !== "admin") select.enterSelectionMode(user.id); }} onPress={() => { if (select.selectionMode && user.role !== "admin") select.toggle(user.id); }} />)}</View>}
      <View style={{ height: 96 }} />
    </ScrollView>
    {select.count > 0 && <TouchableOpacity onPress={() => setActionsVisible(true)} className="absolute bottom-6 right-6 bg-cyan-700 px-5 py-3.5 rounded-full flex-row items-center" style={{ elevation: 5 }}><Ionicons name="flash-outline" size={18} color="#fff" /><Text className="ml-2 text-white font-quicksandBold">Actions</Text></TouchableOpacity>}
    <BulkActionSheet visible={actionsVisible} count={select.count} actions={BULK_ACTIONS} onClose={() => setActionsVisible(false)} onAction={runBulkAction} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1 }, centered: { flex: 1, justifyContent: "center", alignItems: "center" }, header: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 }, backBtn: { padding: 4, marginTop: 2 }, title: { fontSize: 26, fontFamily: "Quicksand_700Bold" }, subtitle: { fontSize: 12, fontFamily: "Quicksand_500Medium", marginTop: 2 }, searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginVertical: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, elevation: 1 }, searchInput: { flex: 1, fontSize: 14, fontFamily: "Quicksand_400Regular" }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginBottom: 8 }, chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }, chipText: { fontSize: 12, fontFamily: "Quicksand_600SemiBold" }, list: { paddingHorizontal: 16, paddingTop: 4 }, listCard: { borderRadius: 16, overflow: "hidden", elevation: 2 }, row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12, borderBottomWidth: 1 }, roleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }, userName: { fontSize: 14, fontFamily: "Quicksand_700Bold" }, username: { fontSize: 11, fontFamily: "Quicksand_600SemiBold", marginTop: 1 }, userDate: { fontSize: 11, fontFamily: "Quicksand_400Regular", marginTop: 2 }, badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }, badgeText: { fontSize: 11, fontFamily: "Quicksand_600SemiBold" }, emptyState: { alignItems: "center", paddingTop: 60, gap: 12 }, emptyTitle: { fontSize: 16, fontFamily: "Quicksand_600SemiBold" } });
