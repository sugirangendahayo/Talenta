// app/(employer)/applicants.tsx - Complete Example
import ApplicantCard from "@/components/employer/ApplicantCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Applicant {
  id: string;
  job_id: string;
  jobseeker_id: string;
  status: "pending" | "shortlisted" | "hired" | "rejected";
  created_at: string;
  cover_letter?: string;
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
}

type FilterStatus = "all" | "pending" | "shortlisted" | "hired" | "rejected";

export default function ApplicantsScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const jobId = params.jobId as string | undefined;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("all");
  const [jobTitle, setJobTitle] = useState<string>("");

  // Fetch applicants
  const fetchApplicants = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("job_applications")
        .select(
          `
          *,
          jobseeker_profiles!inner(
            first_name,
            last_name,
            email,
            phone,
            experience_level,
            skills,
            cv_document_url
          ),
          jobs!inner(
            title,
            employer_id
          )
        `,
        )
        .eq("jobs.employer_id", user.id)
        .order("created_at", { ascending: false });

      // Filter by specific job if jobId provided
      if (jobId) {
        query = query.eq("job_id", jobId);

        // Get job title
        const { data: job } = await supabase
          .from("jobs")
          .select("title")
          .eq("id", jobId)
          .single();

        if (job) setJobTitle(job.title);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setApplicants(data || []);
      applyFilter(data || [], selectedFilter);
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load applicants",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filter
  const applyFilter = (data: Applicant[], filter: FilterStatus) => {
    if (filter === "all") {
      setFilteredApplicants(data);
    } else {
      setFilteredApplicants(data.filter((app) => app.status === filter));
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: FilterStatus) => {
    setSelectedFilter(filter);
    applyFilter(applicants, filter);
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchApplicants();
  }, [user, jobId]);

  // Get counts for each status
  const getCounts = () => ({
    all: applicants.length,
    pending: applicants.filter((a) => a.status === "pending").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    hired: applicants.filter((a) => a.status === "hired").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  });

  const counts = getCounts();

  // Filter button component
  const FilterButton = ({
    status,
    label,
    count,
  }: {
    status: FilterStatus;
    label: string;
    count: number;
  }) => (
    <TouchableOpacity
      onPress={() => handleFilterChange(status)}
      className={`px-4 py-2 rounded-full bg-cyan-700 border-cyan-700 border border ${
        selectedFilter === status
          ? "bg-cyan-700 border-cyan-700 border"
          : "bg-white border-gray-300 border"
      }`}
    >
      <Text
        className={`font-quicksandBold text-sm ${
          selectedFilter === status ? "text-white" : "text-gray-700"
        }`}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyState = () => (
    <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center flex mb-6">
      <View
        className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center flex mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="font-quicksandBold text-xl text-gray-900 mb-2">
        No {selectedFilter !== "all" ? selectedFilter : ""} Applicants
      </Text>
      <Text className="font-quicksandMedium text-sm text-gray-500 text-center">
        {selectedFilter === "all"
          ? "Applications will appear here when candidates apply to your jobs."
          : `No ${selectedFilter} applications at the moment.`}
      </Text>
    </View>
  );

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="font-quicksandBold text-xl text-gray-900 mt-4 mb-2">
            Something Went Wrong
          </Text>
          <Text className="font-quicksandMedium text-sm text-gray-500 text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchApplicants}
            className="px-6 py-3 bg-cyan-700 rounded-xl"
          >
            <Text className="font-quicksandBold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-quicksandBold text-2xl text-gray-900">
              Applicants
            </Text>
            {jobTitle && (
              <Text className="font-quicksandMedium text-sm text-gray-500">
                {jobTitle}
              </Text>
            )}
          </View>
          <View className="bg-cyan-100 px-3 py-1 rounded-full">
            <Text className="font-quicksandBold text-cyan-700">
              {filteredApplicants.length}
            </Text>
          </View>
        </View>
        {/* Filters */}
        <View className="flex flex-row gap-2 flex-wrap">
          <FilterButton status="all" label="All" count={counts.all} />
          <FilterButton
            status="pending"
            label="Pending"
            count={counts.pending}
          />
          <FilterButton
            status="shortlisted"
            label="Shortlisted"
            count={counts.shortlisted}
          />
          <FilterButton status="hired" label="Hired" count={counts.hired} />
          <FilterButton
            status="rejected"
            label="Rejected"
            count={counts.rejected}
          />
        </View>
      </View>

      {/* Applicants List */}
      {isLoading && applicants.length === 0 ? (
        <View className="flex-1 items-center justify-center flex">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="font-quicksandMedium text-gray-500 mt-4">
            Loading applicants...
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
            paddingTop: 16,
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
