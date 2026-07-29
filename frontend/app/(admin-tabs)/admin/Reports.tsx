// app/(admin-tabs)/admin/Reports.tsx
import { getReports, updateReportStatus } from "@/lib/adminService";
import type { AdminReport, ReportStatus } from "@/types/admin.types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { PromptModal } from "@/components/common/PromptModal";
import AdminListSkeleton from "@/components/skeletons/AdminListSkeleton";
import GlobalSearchModal from "@/components/common/GlobalSearchModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = ReportStatus | "all";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  spam:          "Spam / Misleading",
  harassment:    "Harassment / Abuse",
  fraud:         "Fraud / Scam",
  inappropriate: "Inappropriate Content",
  suspicious:    "Suspicious Activity",
  other:         "Other",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  user:    "User",
  job:     "Job Listing",
  post:    "Post",
  comment: "Comment",
  company: "Company",
};

const STATUS_META: Record<
  ReportStatus,
  { label: string; badge: string; text: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30",
    text:  "text-amber-700 dark:text-amber-400",
  },
  reviewing: {
    label: "Reviewing",
    badge: "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30",
    text:  "text-blue-700 dark:text-blue-400",
  },
  resolved: {
    label: "Resolved",
    badge: "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30",
    text:  "text-emerald-700 dark:text-emerald-400",
  },
  dismissed: {
    label: "Dismissed",
    badge: "bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a]",
    text:  "text-gray-500 dark:text-gray-400",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({
  report,
  onAction,
}: {
  report: AdminReport;
  onAction: (report: AdminReport) => void;
}) {
  const router = useRouter();
  const meta        = STATUS_META[report.status];
  const targetLabel = TARGET_TYPE_LABELS[report.target_type] ?? report.target_type;
  const reasonLabel = REASON_LABELS[report.reason] ?? report.reason;

  const reporterData = Array.isArray(report.reporter)
    ? report.reporter[0]
    : report.reporter;
  const reporterRole = reporterData?.role ?? "unknown";

  const handleGoToProfile = () => {
    if (report.target_type === "user") {
      router.push({
        pathname: "/(shared)/user/[id]",
        params: { id: report.target_id },
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={report.target_type === "user" ? handleGoToProfile : undefined}
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#1f1f1f] mb-3 p-4"
    >
      {/* ── Top row: reason + status badge ── */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text
            className="text-sm font-quicksandBold text-gray-800 dark:text-gray-100 mb-1"
            numberOfLines={1}
          >
            {reasonLabel}
          </Text>
          <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
            {targetLabel} · Reported by {reporterRole} · {formatDate(report.created_at)}
          </Text>
        </View>

        <View className={`px-2.5 py-0.5 rounded-full ${meta.badge}`}>
          <Text className={`text-[11px] font-quicksandBold ${meta.text}`}>
            {meta.label}
          </Text>
        </View>
      </View>

      {/* ── Details preview ── */}
      {report.details ? (
        <View className="bg-gray-50 dark:bg-[#141414] rounded-xl px-3 py-2.5 mb-3">
          <Text
            className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 leading-5"
            numberOfLines={3}
          >
            {report.details}
          </Text>
        </View>
      ) : null}

      {/* ── Resolution notes ── */}
      {report.resolution_notes ? (
        <View className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/20 rounded-xl px-3 py-2.5 mb-3">
          <Text className="text-[11px] font-quicksandBold text-emerald-600 dark:text-emerald-400 mb-0.5">
            Resolution
          </Text>
          <Text className="text-xs font-quicksandMedium text-emerald-700 dark:text-emerald-300 leading-5">
            {report.resolution_notes}
          </Text>
        </View>
      ) : null}

      {/* ── Action row ── */}
      {(report.status === "pending" || report.status === "reviewing") && (
        <View
          className="flex-row items-center pt-3 border-t border-gray-100 dark:border-[#1f1f1f]"
          style={{ gap: 8 }}
        >
          {report.target_type === "user" && (
            <TouchableOpacity
              onPress={handleGoToProfile}
              activeOpacity={0.8}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              className="flex-1 bg-cyan-700 rounded-xl py-2.5 flex-row items-center justify-center gap-1.5"
            >
              <Ionicons name="shield-checkmark-outline" size={14} color="#fff" />
              <Text className="text-white text-xs font-quicksandBold">
                Moderate User
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => onAction(report)}
            activeOpacity={0.7}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            className="flex-1 border border-gray-200 dark:border-[#2a2a2a] rounded-xl py-2.5 flex-row items-center justify-center gap-1.5"
          >
            <Ionicons name="ticket-outline" size={14} color="#6B7280" />
            <Text className="text-gray-600 dark:text-gray-300 text-xs font-quicksandBold">
              Update Ticket
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminReports() {
  const { t } = useTranslation(["admin", "common"]);
  const [reports, setReports]               = useState<AdminReport[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [filter, setFilter]                 = useState<StatusFilter>("pending");
  const [search, setSearch]                 = useState("");
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const [promptConfig, setPromptConfig] = useState<{
    visible:      boolean;
    reportId:     string | null;
    status:       ReportStatus | null;
    title:        string;
    message:      string;
    submitText:   string;
    submitStyle:  "default" | "destructive";
  }>({
    visible:     false,
    reportId:    null,
    status:      null,
    title:       "",
    message:     "",
    submitText:  "Submit",
    submitStyle: "default",
  });

  const load = useCallback(async () => {
    try {
      const data = await getReports(filter);
      setReports(data);
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ?? "Failed to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleSelectSearch = (query: string, categoryId?: string) => {
    if (categoryId) {
      setFilter(categoryId as StatusFilter);
      setSearch("");
    } else {
      setSearch(query);
    }
  };

  const handleStatusChange = async (
    reportId: string,
    status: ReportStatus,
    notes: string
  ) => {
    try {
      await updateReportStatus(reportId, status, notes || undefined);
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status, resolution_notes: notes || r.resolution_notes }
            : r
        )
      );
    } catch (e: any) {
      Alert.alert(
        t("common:error", { defaultValue: "Error" }),
        e?.message ?? "Failed to update report."
      );
    }
  };

  const showActionSheet = (report: AdminReport) => {
    Alert.alert(
      "Update Report Ticket",
      `Updating this ticket DOES NOT punish the user.\nTo punish the user (Suspend/Ban), click "Moderate User".\n\nTicket Reason: ${REASON_LABELS[report.reason] ?? report.reason}`,
      [
        {
          text: "Mark as Reviewing",
          onPress: () => handleStatusChange(report.id, "reviewing", ""),
        },
        {
          text: "Resolve",
          onPress: () =>
            setPromptConfig({
              visible:     true,
              reportId:    report.id,
              status:      "resolved",
              title:       "Resolution Notes",
              message:     "Describe what action was taken (optional):",
              submitText:  "Resolve",
              submitStyle: "default",
            }),
        },
        {
          text:    "Dismiss",
          style:   "destructive",
          onPress: () =>
            setPromptConfig({
              visible:     true,
              reportId:    report.id,
              status:      "dismissed",
              title:       "Dismiss Reason",
              message:     "Why is this report being dismissed? (optional):",
              submitText:  "Dismiss",
              submitStyle: "destructive",
            }),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const onPromptSubmit = (notes: string) => {
    if (promptConfig.reportId && promptConfig.status) {
      handleStatusChange(promptConfig.reportId, promptConfig.status, notes);
    }
    setPromptConfig((c) => ({ ...c, visible: false }));
  };

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.reason.toLowerCase().includes(q) ||
      r.target_type.toLowerCase().includes(q) ||
      (r.details?.toLowerCase().includes(q) ?? false)
    );
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const CHIPS: { key: StatusFilter; label: string }[] = [
    { key: "pending",   label: t("admin:reports.filters.pending",   { defaultValue: "Pending" }) },
    { key: "reviewing", label: t("admin:reports.filters.reviewing", { defaultValue: "Reviewing" }) },
    { key: "resolved",  label: t("admin:reports.filters.resolved",  { defaultValue: "Resolved" }) },
    { key: "dismissed", label: t("admin:reports.filters.dismissed", { defaultValue: "Dismissed" }) },
    { key: "all",       label: t("admin:reports.filters.all",       { defaultValue: "All" }) },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading && !refreshing) {
    return <AdminListSkeleton count={5} showFilterBar={true} />;
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <PromptModal
        visible={promptConfig.visible}
        title={promptConfig.title}
        message={promptConfig.message}
        submitText={promptConfig.submitText}
        submitStyle={promptConfig.submitStyle}
        onSubmit={onPromptSubmit}
        onCancel={() => setPromptConfig((c) => ({ ...c, visible: false }))}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("admin:reports.title", { defaultValue: "Reports" })}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
            {t("admin:reports.subtitle", {
              pending: pendingCount,
              total:   reports.length,
              defaultValue: `${pendingCount} pending · ${reports.length} total`,
            })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
        >
          <Ionicons name="search-outline" size={18} color="#6B7280" />
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

      {/* ── Filter chips ─────────────────────────────────────────────────── */}
      <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical:   12,
            gap:               8,
          }}
        >
          {CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setFilter(chip.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === chip.key }}
              className={`px-4 py-2 rounded-full border ${
                filter === chip.key
                  ? "bg-cyan-700 border-cyan-700"
                  : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
              }`}
            >
              <Text
                className={`text-sm font-quicksandMedium ${
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

      {/* ── Report list ──────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0E7490"
            colors={["#0E7490"]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop:        16,
          paddingBottom:     140,
          flexGrow:          1,
        }}
      >
        {filtered.length === 0 ? (
          <View className="items-center pt-16">
            <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#141414] items-center justify-center mb-5">
              <Ionicons name="flag-outline" size={36} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 text-center mb-2">
              {t("admin:reports.empty.title", { defaultValue: "No reports found" })}
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center leading-5 px-8">
              {filter === "pending"
                ? t("admin:reports.empty.noPending", {
                    defaultValue: "No pending reports — you're all caught up.",
                  })
                : t("admin:reports.empty.tryFilters", {
                    defaultValue: "Try adjusting your filters.",
                  })}
            </Text>
          </View>
        ) : (
          filtered.map((report) => (
            <ReportCard key={report.id} report={report} onAction={showActionSheet} />
          ))
        )}
      </ScrollView>

      <GlobalSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectSearch={handleSelectSearch}
        initialQuery={search}
        storageKey="@recent_admin_report_searches"
        placeholder={t("admin:reports.searchPlaceholder", {
          defaultValue: "Search reason or details…",
        })}
        searchForLabel={(q) => `Search reports for "${q}"`}
        categoriesLabel={t("admin:reports.filterByStatus", { defaultValue: "Filter by status" })}
        categories={CHIPS.filter((c) => c.key !== "all").map((c) => ({
          id: c.key,
          name: c.label,
        }))}
      />
    </View>
  );
}