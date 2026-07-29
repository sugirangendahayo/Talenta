// app/(admin-tabs)/admin/Jobs.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getAdminJobs, updateJobStatus } from "@/lib/adminService";
import type { AdminJob, JobStatus } from "@/types/admin.types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import AdminListSkeleton from "@/components/skeletons/AdminListSkeleton";
import GlobalSearchModal from "@/components/common/GlobalSearchModal";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  { labelKey: string; colorHex: string; dotHex: string; twBadgeClass: string; twTextClass: string }
> = {
  active: {
    labelKey: "status.active",
    colorHex: "#059669", // Emerald
    dotHex: "#059669",
    twBadgeClass: "bg-emerald-50 dark:bg-emerald-900/20",
    twTextClass: "text-emerald-700 dark:text-emerald-400",
  },
  paused: {
    labelKey: "status.paused",
    colorHex: "#D97706", // Amber
    dotHex: "#D97706",
    twBadgeClass: "bg-amber-50 dark:bg-amber-900/20",
    twTextClass: "text-amber-700 dark:text-amber-400",
  },
  closed: {
    labelKey: "status.closed",
    colorHex: "#6B7280", // Gray
    dotHex: "#6B7280",
    twBadgeClass: "bg-gray-100 dark:bg-[#1e1e1e]",
    twTextClass: "text-gray-600 dark:text-gray-400",
  },
  expired: {
    labelKey: "status.expired",
    colorHex: "#DC2626", // Red
    dotHex: "#DC2626",
    twBadgeClass: "bg-red-50 dark:bg-red-900/20",
    twTextClass: "text-red-700 dark:text-red-400",
  },
  draft: {
    labelKey: "status.draft",
    colorHex: "#2563EB", // Blue
    dotHex: "#2563EB",
    twBadgeClass: "bg-blue-50 dark:bg-blue-900/20",
    twTextClass: "text-blue-700 dark:text-blue-400",
  },
};

const ALL_STATUSES: Array<JobStatus | "all"> = [
  "all",
  "active",
  "paused",
  "closed",
  "expired",
  "draft",
];

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({
  job,
  onChangeStatus,
}: {
  job: AdminJob;
  onChangeStatus: (id: string, status: JobStatus) => void;
}) {
  const { t } = useTranslation("admin");
  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;

  const canActivate = job.status !== "active";
  const canPause = job.status === "active";
  const canClose = job.status !== "closed";

  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] mb-3 flex-row overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >


      {/* Content */}
      <View className="flex-1 p-4">
        {/* Header row */}
        <View className="flex-row items-start">
          <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center mr-3 mt-0.5">
            <Ionicons name="briefcase-outline" size={15} color="#0E7490" />
          </View>
          <View className="flex-1 mr-2">
            <Text
              className="text-base font-quicksandBold text-gray-800 dark:text-gray-100"
              numberOfLines={1}
            >
              {job.title}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Text
                className="text-sm font-quicksandMedium text-gray-400 dark:text-gray-500"
                numberOfLines={1}
              >
                {job.employer_profiles?.company_name ??
                  t("common:unknown", { defaultValue: "Unknown employer" })}
              </Text>
              {job.employer_profiles?.business_verification_status === "approved" &&
                job.employer_profiles?.premium_plan &&
                job.employer_profiles?.premium_plan !== "free" && (
                  <MaterialIcons name="verified" size={13} color="#0E7490" />
                )}
            </View>
          </View>
          {/* Status badge */}
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full ${cfg.twBadgeClass}`}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: cfg.dotHex,
                marginRight: 4,
              }}
            />
            <Text className={`text-xs font-quicksandBold ${cfg.twTextClass}`}>
              {t(cfg.labelKey, {
                defaultValue:
                  job.status.charAt(0).toUpperCase() + job.status.slice(1),
              })}
            </Text>
          </View>
        </View>

        {/* Meta row */}
        <View className="flex-row flex-wrap mt-3" style={{ gap: 12 }}>
          {job.category && (
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="folder-outline" size={12} color="#9CA3AF" />
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                {job.category}
              </Text>
            </View>
          )}
          {job.location && (
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="location-outline" size={12} color="#9CA3AF" />
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                {job.location}
              </Text>
            </View>
          )}
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
              {new Date(job.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 dark:bg-[#222] my-3" />

        {/* Actions */}
        <View className="mt-1">
          {canActivate ? (
            <View>
              <TouchableOpacity
                className="bg-cyan-700 rounded-2xl py-3.5 items-center justify-center mb-3"
                onPress={() => onChangeStatus(job.id, "active")}
                activeOpacity={0.85}
              >
                <Text className="text-white font-quicksandBold text-sm">
                  {t("jobs.activateAction", { defaultValue: "Activate Job" })}
                </Text>
              </TouchableOpacity>
              {canClose && (
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => onChangeStatus(job.id, "closed")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-xs font-quicksandBold text-red-400">
                      {t("jobs.closeAction", { defaultValue: "Close Job" })}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-x-4">
              {canPause && (
                <TouchableOpacity
                  onPress={() => onChangeStatus(job.id, "paused")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400">
                    {t("jobs.pauseAction", { defaultValue: "Pause Job" })}
                  </Text>
                </TouchableOpacity>
              )}
              {canClose && (
                <View className="flex-1 flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => onChangeStatus(job.id, "closed")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-xs font-quicksandBold text-red-400">
                      {t("jobs.closeAction", { defaultValue: "Close Job" })}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminJobs() {
  const { isDark } = useTheme();
  const { t } = useTranslation(["admin", "common"]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getAdminJobs();
      setJobs(data);
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ?? t("jobs.loadError", { defaultValue: "Failed to load jobs" })
      );
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

  const handleSelectSearch = (query: string, categoryId?: string) => {
    if (categoryId) {
      setStatusFilter(categoryId as JobStatus | "all");
      setSearch("");
    } else {
      setSearch(query);
    }
  };

  const handleChangeStatus = (jobId: string, newStatus: JobStatus) => {
    const cfg = STATUS_CONFIG[newStatus];
    const currentJob = jobs.find((j) => j.id === jobId);

    const labelStr = t(cfg.labelKey, {
      defaultValue: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
    });

    Alert.alert(
      t("jobs.changeStatusTitle", {
        defaultValue: "{{status}} Job",
        status: labelStr,
      }),
      t("jobs.changeStatusConfirm", {
        defaultValue: 'Change "{{title}}" status to {{status}}?',
        title: currentJob?.title,
        status: labelStr,
      }),
      [
        {
          text: t("common:cancel", { defaultValue: "Cancel" }),
          style: "cancel",
        },
        {
          text: labelStr,
          style: newStatus === "closed" ? "destructive" : "default",
          onPress: async () => {
            setActionLoading(jobId);
            try {
              await updateJobStatus(jobId, newStatus);
              setJobs((prev) =>
                prev.map((j) =>
                  j.id === jobId ? { ...j, status: newStatus } : j
                )
              );
            } catch (e: any) {
              Alert.alert(
                t("common:error", { defaultValue: "Error" }),
                e?.message ??
                  t("jobs.updateError", { defaultValue: "Failed to update job" })
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
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

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading && !refreshing) {
    return <AdminListSkeleton count={5} showFilterBar={true} />;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── Header ── */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("jobs.title", { defaultValue: "Jobs" })}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
            {jobs.length} {t("filters.total", { defaultValue: "total" })} ·{" "}
            {jobs.filter((j) => j.status === "active").length}{" "}
            {t("status.active", { defaultValue: "active" }).toLowerCase()}
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

      {/* ── Active search indicator ── */}
      {search.length > 0 && (
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
          {ALL_STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              className={`px-4 py-2 rounded-full border ${
                statusFilter === s
                  ? "bg-cyan-700 border-cyan-700"
                  : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
              }`}
              onPress={() => setStatusFilter(s)}
              activeOpacity={0.8}
            >
              <Text
                className={`text-xs font-quicksandBold ${
                  statusFilter === s
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {s === "all"
                  ? t("filters.all", { defaultValue: "All" })
                  : t(STATUS_CONFIG[s as JobStatus].labelKey, {
                      defaultValue:
                        s.charAt(0).toUpperCase() + s.slice(1),
                    })}
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
              <Ionicons name="briefcase-outline" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-2">
              {t("jobs.emptyTitle", { defaultValue: "No jobs found" })}
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center leading-5 px-8">
              {t("jobs.emptySubtitle", {
                defaultValue: "Try adjusting your filters or search.",
              })}
            </Text>
          </View>
        ) : (
          filtered.map((job) => (
            <View
              key={job.id}
              style={{ opacity: actionLoading === job.id ? 0.5 : 1 }}
            >
              <JobCard job={job} onChangeStatus={handleChangeStatus} />
            </View>
          ))
        )}
      </ScrollView>

      <GlobalSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectSearch={handleSelectSearch}
        initialQuery={search}
        storageKey="@recent_admin_job_searches"
        placeholder={t("jobs.searchPlaceholder", {
          defaultValue: "Search job or company…",
        })}
        searchForLabel={(q) => `Search jobs for "${q}"`}
        categoriesLabel={t("jobs.filterByStatus", { defaultValue: "Filter by status" })}
        categories={ALL_STATUSES.filter((s) => s !== "all").map((s) => {
          const status = s as JobStatus;
          return {
            id: status,
            name: t(STATUS_CONFIG[status].labelKey, {
              defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
            }),
          };
        })}
      />
    </View>
  );
}
