// app/(admin-tabs)/admin/Employers.tsx
import UserAvatar from "@/components/common/UserAvatar";
import BusinessVerificationBadge from "@/components/employer/BusinessVerificationBadge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getEmployers,
  rejectEmployerWithReason,
  verifyEmployer,
} from "@/lib/adminService";
import { AdminEmployer } from "@/types/admin.types";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type Filter = "all" | "pending_review" | "approved" | "rejected";

// ─── Employer Card ────────────────────────────────────────────────────────────

function EmployerCard({
  employer,
  onVerify,
  onReject,
  isDark,
}: {
  employer: AdminEmployer;
  onVerify: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isDark: boolean;
}) {
  const { t } = useTranslation("admin");
  const router = useRouter();

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
                        onPress: (reason) => {
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
    </View>
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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchRef = useRef<TextInput>(null);

  const load = useCallback(async () => {
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

  const handleVerify = (id: string) => {
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

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
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
                placeholder={t("employers.searchPlaceholder", {
                  defaultValue: "Search company or email…",
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
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
