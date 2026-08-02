// app/(admin-tabs)/admin/Jobseekers.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";
import { bulkBanUsers, bulkSetUnderReview, bulkSuspendUsers, bulkUnbanUsers, bulkUnsuspendUsers, getJobseekers } from "@/lib/adminService";
import type { AdminJobseeker } from "@/types/admin.types";
import UserAvatar from "@/components/common/UserAvatar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type DocFilter = "all" | "has_docs" | "no_docs";

const BULK_ACTIONS: BulkAction[] = [
  { id: "suspend", label: "Suspend", icon: "time-outline", requiresReason: true, requiresDuration: true },
  { id: "unsuspend", label: "Unsuspend", icon: "play-circle-outline", requiresReason: true },
  { id: "review", label: "Put under review", icon: "eye-outline", requiresReason: true },
  { id: "ban", label: "Ban", icon: "ban-outline", style: "destructive", requiresReason: true },
  { id: "unban", label: "Unban", icon: "checkmark-circle-outline", requiresReason: true },
];

// ─── Jobseeker Card ───────────────────────────────────────────────────────────

function JobseekerCard({ jobseeker, selected, selectionMode, onSelect, onLongPress }: { jobseeker: AdminJobseeker; selected: boolean; selectionMode: boolean; onSelect: () => void; onLongPress: () => void }) {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const hasDocs = !!(jobseeker.id_document_url || jobseeker.cv_document_url);
  const accentHex = hasDocs ? "#2563EB" : "#6B7280"; // Blue for has docs, Gray for no docs

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
              params: { id: jobseeker.id, role: 'jobseeker' }
            })}
            activeOpacity={0.75}
            className="flex-row items-start flex-1"
          >
            <UserAvatar
              imageUrl={jobseeker.profile_image_url}
              name={jobseeker.full_name || "JS"}
              size={40}
              style={{ marginRight: 10, marginTop: 2 }}
            />
            <View className="flex-1 mr-2">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Text
                  className="text-base font-quicksandBold text-gray-800 dark:text-gray-100"
                  numberOfLines={1}
                >
                  {jobseeker.full_name || "Unknown"}
                </Text>
                {jobseeker.premium_plan === "professional" && (
                  <MaterialIcons name="verified" size={14} color="#0E7490" />
                )}
              </View>
              {jobseeker.username ? (
                <Text
                  className="text-xs font-quicksandSemibold text-cyan-600 dark:text-cyan-400"
                  numberOfLines={1}
                >
                  @{jobseeker.username}
                </Text>
              ) : null}
              <Text
                className="text-sm font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5"
                numberOfLines={1}
              >
                {jobseeker.email}
              </Text>
            </View>
          </TouchableOpacity>
          {/* Status badge */}
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full ${
              hasDocs
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "bg-gray-100 dark:bg-[#1e1e1e]"
            }`}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: accentHex,
                marginRight: 4,
              }}
            />
            <Text
              className={`text-xs font-quicksandBold ${
                hasDocs
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {hasDocs
                ? t("jobseekers.hasDocs", { defaultValue: "Has Docs" })
                : t("jobseekers.noDocs", { defaultValue: "No Docs" })}
            </Text>
          </View>
        </View>

        {/* Meta row */}
        {(jobseeker.phone ||
          jobseeker.city ||
          jobseeker.country ||
          jobseeker.experience_level ||
          jobseeker.education_level) && (
          <View className="flex-row flex-wrap mt-3" style={{ gap: 12 }}>
            {jobseeker.phone && (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="call-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {jobseeker.phone}
                </Text>
              </View>
            )}
            {(jobseeker.city || jobseeker.country) && (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {[jobseeker.city, jobseeker.country]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            )}
            {jobseeker.experience_level && (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="star-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {jobseeker.experience_level}
                </Text>
              </View>
            )}
            {jobseeker.education_level && (
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="school-outline" size={12} color="#9CA3AF" />
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {jobseeker.education_level}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Divider */}
        <View className="h-px bg-gray-100 dark:bg-[#222] my-3" />

        {/* Documents */}
        <View style={{ gap: 8 }}>
          {jobseeker.id_document_url ? (
            <TouchableOpacity
              className="flex-row items-center"
              style={{ gap: 6 }}
              onPress={() => Linking.openURL(jobseeker.id_document_url!)}
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
                {t("jobseekers.idDocument", { defaultValue: "ID Document" })}
              </Text>
              <Ionicons name="open-outline" size={12} color="#0E7490" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Ionicons name="document-outline" size={14} color="#D1D5DB" />
              <Text className="text-xs font-quicksandMedium text-gray-300 dark:text-gray-600">
                {t("jobseekers.idDocumentMissing", {
                  defaultValue: "ID Document: not uploaded",
                })}
              </Text>
            </View>
          )}

          {jobseeker.cv_document_url ? (
            <TouchableOpacity
              className="flex-row items-center"
              style={{ gap: 6 }}
              onPress={() => Linking.openURL(jobseeker.cv_document_url!)}
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
                {t("jobseekers.cvDocument", { defaultValue: "CV / Resume" })}
              </Text>
              <Ionicons name="open-outline" size={12} color="#0E7490" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <Ionicons name="document-outline" size={14} color="#D1D5DB" />
              <Text className="text-xs font-quicksandMedium text-gray-300 dark:text-gray-600">
                {t("jobseekers.cvDocumentMissing", {
                  defaultValue: "CV / Resume: not uploaded",
                })}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminJobseekers() {
  const { isDark } = useTheme();
  const { t } = useTranslation(["admin", "common"]);
  const [jobseekers, setJobseekers] = useState<AdminJobseeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<DocFilter>("all");
  const [search, setSearch] = useState("");
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const select = useMultiSelect();
  const [actionsVisible, setActionsVisible] = useState(false);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();

  const load = useCallback(async () => {
    // Offline: skip the request and keep whatever jobseekers are already
    // loaded (previously loaded content) visible instead of clearing them.
    if (!isOnline) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await getJobseekers();
      setJobseekers(data);
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ??
          t("jobseekers.loadError", {
            defaultValue: "Failed to load jobseekers",
          })
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
    if (!requireOnline("You're offline. Reconnect to refresh jobseekers.")) return;
    setRefreshing(true);
    load();
  };

  const handleSelectSearch = (query: string, categoryId?: string) => {
    if (categoryId) {
      setFilter(categoryId as DocFilter);
      setSearch("");
    } else {
      setSearch(query);
    }
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
        : (js.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (js.username || "").toLowerCase().includes(search.toLowerCase()) ||
          (js.email || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const withDocs = jobseekers.filter(
    (js) => js.id_document_url || js.cv_document_url
  ).length;
  const selectableIds = filtered.map((jobseeker) => jobseeker.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every(select.isSelected);

  const runBulkAction = async (action: string, reason = "", duration?: number) => {
    if (!requireOnline()) return;
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
    } catch (error: any) {
      toast.error(error?.message ?? "Bulk action failed");
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading && !refreshing) {
    return <AdminListSkeleton count={5} showFilterBar={true} />;
  }

  const CHIPS: { key: DocFilter; label: string }[] = [
    { key: "all", label: t("filters.all", { defaultValue: "All" }) },
    {
      key: "has_docs",
      label: t("jobseekers.hasDocs", { defaultValue: "Has Docs" }),
    },
    {
      key: "no_docs",
      label: t("jobseekers.noDocs", { defaultValue: "No Docs" }),
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
            {t("jobseekers.title", { defaultValue: "Jobseekers" })}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
            {jobseekers.length}{" "}
            {t("filters.total", { defaultValue: "total" })} · {withDocs}{" "}
            {t("jobseekers.withDocs", { defaultValue: "with documents" })}
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
              <Ionicons name="people-outline" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-2">
              {t("jobseekers.emptyTitle", {
                defaultValue: "No jobseekers found",
              })}
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center leading-5 px-8">
              {t("jobseekers.emptySubtitle", {
                defaultValue: "Try adjusting your filters or search.",
              })}
            </Text>
          </View>
        ) : (
          filtered.map((js) => (
            <JobseekerCard key={js.id} jobseeker={js} selected={select.isSelected(js.id)} selectionMode={select.selectionMode} onSelect={() => select.toggle(js.id)} onLongPress={() => select.enterSelectionMode(js.id)} />
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
        storageKey="@recent_admin_jobseeker_searches"
        placeholder={t("jobseekers.searchPlaceholder", {
          defaultValue: "Search name or email…",
        })}
        searchForLabel={(q) => `Search jobseekers for "${q}"`}
        categoriesLabel={t("jobseekers.filterByDocs", { defaultValue: "Filter by documents" })}
        categories={CHIPS.filter((c) => c.key !== "all").map((c) => ({
          id: c.key,
          name: c.label,
        }))}
      />
    </View>
  );
}
