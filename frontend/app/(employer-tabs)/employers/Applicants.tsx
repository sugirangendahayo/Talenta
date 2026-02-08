// app/(employer)/applicants.tsx - IMPROVED VERSION with Beautiful Filters
import ApplicantCard from "@/components/employer/ApplicantCard";
import ApplicantFilters from "@/components/employer/ApplicantFilters";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Applicant } from "@/types/job.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    experience_level?: string;
    skills?: string[];
    cv_document_url?: string;
  };
  jobs: {
    title: string;
    employer_id: string;
  };
};

export default function ApplicantsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation("applicants");
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

  const transformApplications = (rawApps: RawApplication[]): Applicant[] => {
    return rawApps
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
  };

  const fetchApplicants = async () => {
    if (!user) {
      console.log("No user found");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("job_applications")
        .select(
          `
          id,
          job_id,
          jobseeker_id,
          status,
          cover_letter,
          created_at,
          updated_at,
          jobseeker_profiles!job_applications_jobseeker_id_fkey (
            first_name,
            last_name,
            email,
            phone,
            experience_level,
            skills,
            cv_document_url
          ),
          jobs!job_applications_job_id_fkey (
            title,
            employer_id
          )
        `,
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

      if (fetchError) {
        throw fetchError;
      }

      const transformedData = transformApplications(
        (data || []) as unknown as RawApplication[],
      );

      setApplicants(transformedData);
      applyFilter(transformedData, selectedFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.loadFailed"));
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

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((app) => app.status === filter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((app) => {
        const fullName =
          `${app.jobseeker_profiles.first_name} ${app.jobseeker_profiles.last_name}`.toLowerCase();
        const email = app.jobseeker_profiles.email.toLowerCase();
        const phone = app.jobseeker_profiles.phone?.toLowerCase() || "";

        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
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

  useEffect(() => {
    fetchApplicants();
  }, [user, jobId]);

  const getCounts = () => ({
    all: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    hired: applicants.filter((a) => a.status === "hired").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  });

  const counts = getCounts();

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center flex px-6 py-20">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center flex mb-4">
        <Ionicons name="people-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="font-quicksandBold text-lg text-gray-900 mb-2">
        {selectedFilter !== "all" ? t(`status.${selectedFilter}`) : ""}{" "}
        {t("empty.title")}
      </Text>
      <Text className="font-quicksandMedium text-sm text-gray-500 text-center">
        {selectedFilter === "all"
          ? t("empty.allApplications")
          : t("empty.noStatusApplications", {
              status: t(`status.${selectedFilter}`),
            })}
      </Text>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="font-quicksandBold text-xl text-gray-900 mt-4 mb-2">
            {t("errors.title")}
          </Text>
          <Text className="font-quicksandMedium text-sm text-gray-500 text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchApplicants}
            className="px-6 py-3 bg-cyan-700 rounded-xl"
            activeOpacity={0.7}
          >
            <Text className="font-quicksandBold text-white">
              {t("buttons.tryAgain")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Job Title */}
      <View className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 w-9 h-9 items-center justify-center flex rounded-full bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="font-quicksandBold text-xl text-gray-900">
                {t("header.title")}
              </Text>
              {jobTitle && (
                <Text className="font-quicksandMedium text-xs text-gray-500 mt-0.5">
                  {jobTitle}
                </Text>
              )}
            </View>
          </View>

          <View className="bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-100">
            <Text className="font-quicksandBold text-sm text-cyan-700">
              {filteredApplicants.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Component */}
      <ApplicantFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedFilter}
        onStatusChange={handleFilterChange}
        counts={counts}
      />

      {/* Applicants List */}
      {isLoading && applicants.length === 0 ? (
        <View className="flex-1 items-center justify-center flex">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="font-quicksandMedium text-gray-500 mt-4">
            {t("states.loading", {ns: "applicants"})}
          </Text>
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
