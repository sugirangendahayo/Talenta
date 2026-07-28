// app/(admin-tabs)/admin/Jobseekers.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { getJobseekers } from "@/lib/adminService";
import type { AdminJobseeker } from "@/types/admin.types";
import UserAvatar from "@/components/common/UserAvatar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AdminListSkeleton from "@/components/skeletons/AdminListSkeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocFilter = "all" | "has_docs" | "no_docs";

// ─── Jobseeker Card ───────────────────────────────────────────────────────────

function JobseekerCard({ jobseeker }: { jobseeker: AdminJobseeker }) {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const hasDocs = !!(jobseeker.id_document_url || jobseeker.cv_document_url);
  const accentHex = hasDocs ? "#2563EB" : "#6B7280"; // Blue for has docs, Gray for no docs

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
    </View>
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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const toggleSearch = () => {
    if (searchExpanded) {
      setSearch("");
      setSearchExpanded(false);
    } else {
      setSearchExpanded(true);
      setTimeout(() => searchRef.current?.focus(), 50);
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
          onPress={toggleSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={searchExpanded ? "close" : "search-outline"}
            size={18}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      {/* ── Filter / Search bar ── */}
      <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]">
        {searchExpanded ? (
          <View className="px-6 py-3">
            <View className="flex-row items-center bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl px-4 py-2.5">
              <Ionicons name="search-outline" size={16} color="#9CA3AF" />
              <TextInput
                ref={searchRef}
                className="flex-1 text-sm font-quicksandMedium text-gray-800 dark:text-gray-100 ml-2"
                placeholder={t("jobseekers.searchPlaceholder", {
                  defaultValue: "Search name or email…",
                })}
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
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
        )}
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
            <JobseekerCard key={js.id} jobseeker={js} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
