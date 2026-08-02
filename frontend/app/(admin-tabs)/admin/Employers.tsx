// app/(admin-tabs)/admin/Employers.tsx
import UserAvatar from "@/components/common/UserAvatar";
import BusinessVerificationBadge from "@/components/employer/BusinessVerificationBadge";
import { useTheme } from "@/contexts/ThemeContext";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";
import {
  bulkBanUsers,
  bulkRejectEmployers,
  bulkSetUnderReview,
  bulkSuspendUsers,
  bulkUnbanUsers,
  bulkUnsuspendUsers,
  bulkVerifyEmployers,
  getEmployers,
  rejectEmployerWithReason,
  verifyEmployer,
} from "@/lib/adminService";
import { AdminEmployer } from "@/types/admin.types";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdminListSkeleton from "@/components/skeletons/AdminListSkeleton";
import GlobalSearchModal from "@/components/common/GlobalSearchModal";
import SelectionToolbar from "@/components/admin/SelectionToolbar";
import BulkActionSheet, { type BulkAction } from "@/components/admin/BulkActionSheet";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { toast } from "sonner-native";

// ─── Status config ────────────────────────────────────────────────────────────────────

type Filter = "all" | "pending_review" | "approved" | "rejected";

const BULK_ACTIONS: BulkAction[] = [
  { id: "verify", label: "Approve verification", icon: "checkmark-done-outline" },
  { id: "reject", label: "Reject verification", icon: "close-circle-outline", style: "destructive", requiresReason: true },
  { id: "suspend", label: "Suspend", icon: "time-outline", requiresReason: true, requiresDuration: true },
  { id: "unsuspend", label: "Unsuspend", icon: "play-circle-outline", requiresReason: true },
  { id: "review", label: "Put under review", icon: "eye-outline", requiresReason: true },
  { id: "ban", label: "Ban", icon: "ban-outline", style: "destructive", requiresReason: true },
  { id: "unban", label: "Unban", icon: "checkmark-circle-outline", requiresReason: true },
];

// ─── Employer Card ────────────────────────────────────────────────────────────

function EmployerCard({
  employer,
  onVerify,
  onReject,
  isDark,
  selected,
  selectionMode,
  onSelect,
  onLongPress,
}: {
  employer: AdminEmployer;
  onVerify: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isDark: boolean;
  selected: boolean;
  selectionMode: boolean;
  onSelect: () => void;
  onLongPress: () => void;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className={`bg-white dark:bg-[#0E0E0E] rounded-2xl border mb-3 flex-row overflow-hidden ${selected ? "border-cyan-600 dark:border-cyan-500" : "border-gray-100 dark:border-[#2a2a2a]"}`}
      onPress={selectionMode ? onSelect : undefined}
      onLongPress={onLongPress}
      delayLongPress={350}
      activeOpacity={0.85}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {selectionMode && (
        <View className="absolute top-3 right-3 z-10">
          <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={24} color={selected ? "#0E7490" : "#9CA3AF"} />
        </View>
      )}
      {/* Content */}
      <View className="flex-1 p-4">
        {/* Header row */}
        <View className="flex-row items-start">
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/(shared)/user/[id]",
              params: { id: employer.id, role: 'employer' }
            })}
            activeOpacity={0.75}
            className="flex-row items-start flex-1"
          >
            <UserAvatar
              imageUrl={employer.profile_image_url}
              name={employer.company_name}
              size={40}
              style={{ marginRight: 10, marginTop: 2 }}
            />
            <View className="flex-1 mr-2">
              <View className="flex-row items-center gap-1">
                <Text
                  className="text-base font-quicksandBold text-gray-800 dark:text-gray-100"
                  numberOfLines={1}
                >
                  {employer.company_name}
                </Text>
                {employer.business_verification_status === "approved" &&
                  employer.premium_plan &&
                  employer.premium_plan !== "free" && (
                    <MaterialIcons name="verified" size={14} color="#0E7490" />
                  )}
              </View>
              <Text
                className="text-sm font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5"
                numberOfLines={1}
              >
                {employer.email}
              </Text>
            </View>
          </TouchableOpacity>
          {/* Status badge */}
          <BusinessVerificationBadge
            status={employer.business_verification_status}
          />
        </View>

        {/* Meta row */}
        {(employer.phone || employer.city || employer.country) && (
          <View className="flex-row flex-wrap mt-3" style={{ gap: 12 }}>
            {employer.phone && (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="call-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {employer.phone}
                </Text>
              </View>
            )}
            {(employer.city || employer.country) && (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {[employer.city, employer.country].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Divider */}
        <View className="h-px bg-gray-100 dark:bg-[#222] my-3" />

        {/* Documents */}
        {employer.business_docs_urls &&
        employer.business_docs_urls.length > 0 ? (
          <View style={{ gap: 8 }}>
            {employer.business_docs_urls.map((url, i) => (
              <TouchableOpacity
                key={i}
                className="flex-row items-center"
                style={{ gap: 6 }}
                onPress={() => Linking.openURL(url)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color="#0E7490"
                />
                <Text
                  className="text-xs font-quicksandBold text-cyan-700 flex-1"
                  numberOfLines={1}
                >
                  Document {i + 1}
                </Text>
                <Ionicons name="open-outline" size={12} color="#0E7490" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="document-outline" size={14} color="#D1D5DB" />
            <Text className="text-xs font-quicksandMedium text-gray-300 dark:text-gray-600">
              No documents uploaded
            </Text>
          </View>
        )}

        {/* Actions — one primary per card */}
        <View className="mt-4">
          {employer.business_verification_status === "pending_review" && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-cyan-700 rounded-2xl py-3 items-center justify-center"
                onPress={() => onVerify(employer.id)}
                activeOpacity={0.85}
              >
                <Text className="text-white font-quicksandBold text-sm">
                  Approve
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl py-3 items-center justify-center"
                onPress={() => {
                  Alert.prompt(
                    "Reject Verification",
                    "Please provide a reason for rejection:",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Reject",
                        style: "destructive",
                        onPress: (reason?: string) => {
                          if (reason) onReject(employer.id, reason);
                        },
                      },
                    ],
                  );
                }}
                activeOpacity={0.85}
              >
                <Text className="text-red-700 dark:text-red-400 font-quicksandBold text-sm">
                  Reject
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminEmployers() {
  const { isDark } = useTheme();
  const { t } = useTranslation(["admin", "common"]);
  const [employers, setEmployers] = useState<AdminEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const select = useMultiSelect();
  const [actionsVisible, setActionsVisible] = useState(false);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();

  const load = useCallback(async () => {
    // Offline: skip the request and keep whatever employers are already
    // loaded (previously loaded content) visible instead of clearing them.
    if (!isOnline) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await getEmployers();
      setEmployers(data);
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ??
          t("employers.loadError", {
            defaultValue: "Failed to load employers",
          }),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOnline]);

  useEffect(() => {
    load();
  }, [load]);

  // Smart auto-refresh: when connectivity returns, silently refresh this
  // screen's data if it's the active tab.
  useRefetchOnReconnect(() => load());

  const onRefresh = () => {
    if (!requireOnline("You're offline. Reconnect to refresh employers.")) return;
    setRefreshing(true);
    load();
  };

  const handleSelectSearch = (query: string, categoryId?: string) => {
    if (categoryId) {
      setFilter(categoryId as Filter);
      setSearch("");
    } else {
      setSearch(query);
    }
  };

  const handleVerify = (id: string) => {
    if (!requireOnline()) return;
    Alert.alert(
      t("employers.verifyTitle", { defaultValue: "Verify Employer" }),
      t("employers.verifyConfirm", {
        defaultValue:
          "Are you sure you want to verify this employer? They will be marked as trusted.",
      }),
      [
        {
          text: t("common:cancel", { defaultValue: "Cancel" }),
          style: "cancel",
        },
        {
          text: t("employers.verifyAction", { defaultValue: "Verify" }),
          onPress: async () => {
            setActionLoading(id);
            try {
              await verifyEmployer(id);
              setEmployers((prev) =>
                prev.map((e) =>
                  e.id === id
                    ? {
                        ...e,
                        is_verified: true,
                        business_verification_status: "approved",
                      }
                    : e,
                ),
              );
            } catch (e: any) {
              Alert.alert(
                t("common:error", { defaultValue: "Error" }),
                e?.message ??
                  t("employers.verifyError", {
                    defaultValue: "Failed to verify employer",
                  }),
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleReject = async (id: string, reason: string) => {
    if (!requireOnline()) return;
    setActionLoading(id);
    try {
      await rejectEmployerWithReason(id, reason);
      setEmployers((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                is_verified: false,
                business_verification_status: "rejected",
                business_rejection_reason: reason,
              }
            : e,
        ),
      );
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ?? "Failed to reject verification",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = employers.filter((e) => {
    const matchesFilter =
      filter === "all" ? true : e.business_verification_status === filter;
    const matchesSearch =
      search.trim() === ""
        ? true
        : e.company_name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const selectableIds = filtered.map((employer) => employer.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(select.isSelected);

  const runBulkAction = async (action: string, reason = "", duration?: number) => {
    if (!requireOnline()) return;
    try {
      const ids = select.selectedList;
      const result = action === "verify" ? await bulkVerifyEmployers(ids)
        : action === "reject" ? await bulkRejectEmployers(ids, reason)
        : action === "suspend" ? await bulkSuspendUsers(ids, reason, duration ?? 24)
        : action === "unsuspend" ? await bulkUnsuspendUsers(ids, reason)
        : action === "review" ? await bulkSetUnderReview(ids, reason)
        : action === "ban" ? await bulkBanUsers(ids, reason)
        : await bulkUnbanUsers(ids, reason);
      const message = `${result.succeeded.length} succeeded, ${result.failed.length} failed`;
      if (result.failed.length) toast.error(message);
      else toast.success(message);
      select.exitSelectionMode();
      await load();
    } catch (error: any) {
      toast.error(error?.message ?? "Bulk action failed");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading && !refreshing) {
    return <AdminListSkeleton count={5} showFilterBar={true} />;
  }

  const CHIPS: { key: Filter; label: string }[] = [
    { key: "all", label: t("filters.all", { defaultValue: "All" }) },
    {
      key: "pending_review",
      label: "Pending",
    },
    {
      key: "approved",
      label: "Approved",
    },
    {
      key: "rejected",
      label: "Rejected",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── Header ── */}
      {select.selectionMode ? (
        <SelectionToolbar count={select.count} allSelected={allSelected} onToggleAll={() => allSelected ? select.deselectAll() : select.selectAll(selectableIds)} onClose={select.exitSelectionMode} />
      ) : (
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("employers.title", { defaultValue: "Employers" })}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
            {employers.length} {t("filters.total", { defaultValue: "total" })} ·{" "}
            {
              employers.filter(
                (e) => e.business_verification_status === "approved",
              ).length
            }{" "}
            {t("employers.verified", { defaultValue: "verified" })}
          </Text>
        </View>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
          onPress={() => setSearchModalVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="search-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
        </TouchableOpacity>
      </View>
      )}

      {/* ── Active search indicator ── */}
      {!select.selectionMode && search.length > 0 && (
        <View className="flex-row items-center px-6 py-2.5 bg-cyan-50 dark:bg-cyan-900/10 border-b border-cyan-100 dark:border-cyan-900/30">
          <Ionicons name="search" size={13} color="#0E7490" />
          <Text
            className="ml-2 flex-1 text-xs font-quicksandBold text-cyan-700 dark:text-cyan-400"
            numberOfLines={1}
          >
            {t("common:searchResultsFor", {
              query: search,
              defaultValue: `Results for "${search}"`,
            })}
          </Text>
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color="#0E7490" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Filter chips ── */}
      <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          {CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              className={`px-4 py-2 rounded-full border ${
                filter === chip.key
                  ? "bg-cyan-700 border-cyan-700"
                  : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
              }`}
              onPress={() => setFilter(chip.key)}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-quicksandBold ${
                  filter === chip.key
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── List ── */}
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
        {filtered.length === 0 ? (
          <View className="items-center pt-16">
            <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#141414] items-center justify-center mb-4">
              <FontAwesome name="handshake-o" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-2">
              {t("employers.emptyTitle", {
                defaultValue: "No employers found",
              })}
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center leading-5 px-8">
              {t("employers.emptySubtitle", {
                defaultValue: "Try adjusting your filters or search.",
              })}
            </Text>
          </View>
        ) : (
          filtered.map((employer) => (
            <View
              key={employer.id}
              style={{ opacity: actionLoading === employer.id ? 0.5 : 1 }}
            >
              <EmployerCard
                employer={employer}
                onVerify={handleVerify}
                onReject={handleReject}
                isDark={isDark}
                selected={select.isSelected(employer.id)}
                selectionMode={select.selectionMode}
                onSelect={() => select.toggle(employer.id)}
                onLongPress={() => select.enterSelectionMode(employer.id)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {select.count > 0 && (
        <TouchableOpacity onPress={() => setActionsVisible(true)} className="absolute bottom-6 right-6 bg-cyan-700 px-5 py-3.5 rounded-full flex-row items-center" style={{ elevation: 5 }}>
          <Ionicons name="flash-outline" size={18} color="#fff" />
          <Text className="ml-2 text-white font-quicksandBold">Actions</Text>
        </TouchableOpacity>
      )}

      <BulkActionSheet visible={actionsVisible} count={select.count} actions={BULK_ACTIONS} onClose={() => setActionsVisible(false)} onAction={runBulkAction} />

      <GlobalSearchModal
        visible={!select.selectionMode && searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectSearch={handleSelectSearch}
        initialQuery={search}
        storageKey="@recent_admin_employer_searches"
        placeholder={t("employers.searchPlaceholder", {
          defaultValue: "Search company or email…",
        })}
        searchForLabel={(q) => `Search employers for "${q}"`}
        categoriesLabel={t("employers.filterByStatus", { defaultValue: "Filter by status" })}
        categories={CHIPS.filter((c) => c.key !== "all").map((c) => ({
          id: c.key,
          name: c.label,
        }))}
      />
    </View>
  );
}
