// app/(employer)/applicants.tsx
import ApplicantCard from "@/components/employer/ApplicantCard";
import ApplicantFilters from "@/components/employer/ApplicantFilters";
import { ApplicationCardSkeleton } from "@/components/skeletons/ApplicationCardSkeleton";
import { SkeletonList } from "@/components/skeletons/SkeletonBase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Applicant } from "@/types/job.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type FilterStatus = "all" | "pending" | "shortlisted" | "hired" | "rejected";

type RawApplication = {
  id: string;
  job_id: string;
  jobseeker_id: string;
  status: "pending" | "shortlisted" | "hired" | "rejected";
  cover_letter?: string;
  created_at: string;
  updated_at: string;
  jobseeker_profiles: {
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    experience_level?: string;
    skills?: string[];
    cv_document_url?: string;
    profile_image_url?: string | null;
  };
  jobs: {
    title: string;
    employer_id: string;
  };
};

export default function ApplicantsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation("applicants");
  const { isDark } = useTheme();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string | undefined;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("all");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data helpers (untouched) ─────────────────────────────────────────────
  const transformApplications = (rawApps: RawApplication[]): Applicant[] =>
    rawApps
      .filter((app) => app.jobseeker_profiles && app.jobs)
      .map((app) => ({
        id: app.id,
        job_id: app.job_id,
        jobseeker_id: app.jobseeker_id,
        status: app.status,
        cover_letter: app.cover_letter,
        created_at: app.created_at,
        jobseeker_profiles: app.jobseeker_profiles,
        jobs: app.jobs,
      }));

  const fetchApplicants = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("job_applications")
        .select(
          `id, job_id, jobseeker_id, status, cover_letter, created_at, updated_at,
          jobseeker_profiles!job_applications_jobseeker_id_fkey (
            full_name, username, email, phone, experience_level, skills, cv_document_url, profile_image_url
          ),
          jobs!job_applications_job_id_fkey (title, employer_id)`,
        )
        .eq("jobs.employer_id", user.id)
        .order("created_at", { ascending: false });

      if (jobId) {
        query = query.eq("job_id", jobId);
        const { data: job } = await supabase
          .from("jobs")
          .select("title")
          .eq("id", jobId)
          .single();
        if (job) setJobTitle(job.title);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const transformed = transformApplications(
        (data || []) as unknown as RawApplication[],
      );
      setApplicants(transformed);
      applyFilter(transformed, selectedFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.loadFailed", { defaultValue: "Failed to load applicants." }));
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (
    data: Applicant[],
    filter: FilterStatus,
    search: string = searchQuery,
  ) => {
    let filtered = data;
    if (filter !== "all") {
      filtered = filtered.filter((a) => a.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((a) => {
        const name  = (a.jobseeker_profiles.full_name || "").toLowerCase();
        const handle = (a.jobseeker_profiles.username || "").toLowerCase();
        const email = a.jobseeker_profiles.email.toLowerCase();
        const phone = a.jobseeker_profiles.phone?.toLowerCase() ?? "";
        return name.includes(q) || handle.includes(q) || email.includes(q) || phone.includes(q);
      });
    }
    setFilteredApplicants(filtered);
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setSelectedFilter(filter);
    applyFilter(applicants, filter, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilter(applicants, selectedFilter, query);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  };

  const getCounts = () => ({
    all:         applicants.length,
    pending:     applicants.filter((a) => a.status === "pending").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    hired:       applicants.filter((a) => a.status === "hired").length,
    rejected:    applicants.filter((a) => a.status === "rejected").length,
  });

  useEffect(() => { fetchApplicants(); }, [user, jobId]);

  // ── Empty state ──────────────────────────────────────────────────────────
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#141414] items-center justify-center mb-4">
        <Ionicons name="people-outline" size={36} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-2 text-center">
        {selectedFilter !== "all"
          ? `${t(`status.${selectedFilter}`, { defaultValue: selectedFilter })} `
          : ""}
        {t("empty.title", { defaultValue: "No applicants" })}
      </Text>
      <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center">
        {selectedFilter === "all"
          ? t("empty.allApplications", { defaultValue: "No one has applied yet." })
          : t("empty.noStatusApplications", {
              status: t(`status.${selectedFilter}`),
              defaultValue: "No applicants with this status.",
            })}
      </Text>
    </View>
  );

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mb-4">
            <Ionicons name="alert-circle-outline" size={36} color="#EF4444" />
          </View>
          <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-2">
            {t("errors.title", { defaultValue: "Something went wrong" })}
          </Text>
          <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchApplicants}
            activeOpacity={0.75}
            className="px-6 py-3 bg-cyan-700 rounded-2xl"
          >
            <Text className="font-quicksandBold text-white">
              {t("buttons.tryAgain", { defaultValue: "Try again" })}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">

      {/* ── Header ── */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-5 pb-5 flex-row items-start justify-between border-b border-gray-100 dark:border-[#222]">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#141414] mr-3"
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#f3f4f6" : "#111827"}
            />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
              {t("header.title", { defaultValue: "Applicants" })}
            </Text>
            {jobTitle ? (
              <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 mt-0.5">
                {jobTitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Neutral count — not a CTA */}
        <View className="bg-gray-100 dark:bg-[#141414] px-3 py-1.5 rounded-full self-center">
          <Text className="font-quicksandBold text-sm text-gray-600 dark:text-gray-300">
            {filteredApplicants.length}
          </Text>
        </View>
      </View>

      {/* ── Filters ── */}
      <ApplicantFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedFilter}
        onStatusChange={handleFilterChange}
        counts={getCounts()}
      />

      {/* ── List ── */}
      {isLoading && applicants.length === 0 ? (
        <View className="flex-1 px-4 pt-3">
          <SkeletonList
            count={5}
            staggerMs={60}
            renderItem={() => <ApplicationCardSkeleton />}
          />
        </View>
      ) : (
        <FlatList
          data={filteredApplicants}
          renderItem={({ item }) => (
            <ApplicantCard applicant={item} onStatusUpdated={fetchApplicants} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0E7490"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}