// app/(employer)/applicants.tsx - IMPROVED VERSION with Contact Actions
import ApplicantCard from "@/components/employer/ApplicantCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Applicant } from "@/types/job.types";
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
  Linking,
  Alert,
  Platform,
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

// Contact Actions Component for Hired Candidates
const ContactActions = ({ applicant }: { applicant: Applicant }) => {
  const candidateName = `${applicant.jobseeker_profiles.first_name} ${applicant.jobseeker_profiles.last_name}`;
  const phone = applicant.jobseeker_profiles.phone;
  const email = applicant.jobseeker_profiles.email;

  const handleCall = () => {
    if (!phone) {
      Alert.alert(
        "No Phone Number",
        "This candidate hasn't provided a phone number.",
      );
      return;
    }
    const phoneNumber = phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    if (!phone) {
      Alert.alert(
        "No Phone Number",
        "This candidate hasn't provided a phone number.",
      );
      return;
    }
    const phoneNumber = phone.replace(/[^0-9+]/g, "");
    const message = `Hi ${candidateName}, congratulations on being selected for ${applicant.jobs.title}!`;

    const whatsappURL = Platform.select({
      ios: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      default: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
    });

    Linking.canOpenURL(whatsappURL!).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappURL!);
      } else {
        Alert.alert(
          "WhatsApp Not Installed",
          "Please install WhatsApp to use this feature.",
        );
      }
    });
  };

  const handleEmail = () => {
    const subject = `Congratulations - ${applicant.jobs.title}`;
    const body = `Hi ${candidateName},\n\nCongratulations! We're pleased to inform you that you've been selected for the ${applicant.jobs.title} position.\n\nBest regards`;
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  if (applicant.status !== "hired") return null;

  return (
    <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 border border-green-200">
      <View className="flex-row items-center mb-2">
        <View className="w-7 h-7 bg-green-500 rounded-full items-center justify-center mr-2">
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
        <Text className="font-quicksandBold text-sm text-green-800">
          Quick Contact Actions
        </Text>
      </View>

      <View className="flex-row gap-2">
        {phone && (
          <>
            <TouchableOpacity
              className="flex-1 bg-cyan-600 px-3 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5"
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text className="text-xs font-quicksandBold text-white">
                Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-green-600 px-3 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5"
              onPress={handleWhatsApp}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text className="text-xs font-quicksandBold text-white">
                WhatsApp
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          className={`${phone ? "flex-1" : "flex-1"} bg-purple-600 px-3 py-2.5 rounded-lg flex-row items-center justify-center gap-1.5`}
          onPress={handleEmail}
          activeOpacity={0.7}
        >
          <Ionicons name="mail" size={16} color="#fff" />
          <Text className="text-xs font-quicksandBold text-white">Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
      setError(
        err instanceof Error ? err.message : "Failed to load applicants",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (data: Applicant[], filter: FilterStatus) => {
    if (filter === "all") {
      setFilteredApplicants(data);
    } else {
      setFilteredApplicants(data.filter((app) => app.status === filter));
    }
  };

  const handleFilterChange = (filter: FilterStatus) => {
    setSelectedFilter(filter);
    applyFilter(applicants, filter);
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

  const FilterButton = ({
    status,
    label,
    count,
  }: {
    status: FilterStatus;
    label: string;
    count: number;
  }) => {
    const isSelected = selectedFilter === status;

    return (
      <TouchableOpacity
        onPress={() => handleFilterChange(status)}
        className={`px-4 py-2 rounded-full ${
          isSelected ? "bg-cyan-700" : "bg-white border border-gray-200"
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`font-quicksandBold text-sm ${
            isSelected ? "text-white" : "text-gray-600"
          }`}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-20">
      <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="people-outline" size={40} color="#9CA3AF" />
      </View>
      <Text className="font-quicksandBold text-lg text-gray-900 mb-2">
        No {selectedFilter !== "all" ? selectedFilter : ""} Applicants
      </Text>
      <Text className="font-quicksandMedium text-sm text-gray-500 text-center">
        {selectedFilter === "all"
          ? "Applications will appear here when candidates apply."
          : `No ${selectedFilter} applications at the moment.`}
      </Text>
    </View>
  );

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
            activeOpacity={0.7}
          >
            <Text className="font-quicksandBold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Improved Header */}
      <View className="bg-white px-4 pt-3 pb-4 border-b border-gray-100">
        {/* Top Row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 w-9 h-9 items-center justify-center rounded-full bg-gray-100"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="font-quicksandBold text-xl text-gray-900">
                Applicants
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

        {/* Filter Pills */}
        <View className="flex-row gap-2">
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="font-quicksandMedium text-gray-500 mt-4">
            Loading applicants...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredApplicants}
          renderItem={({ item }) => (
            <View>
              {/* Contact Actions for Hired Candidates */}
              <ContactActions applicant={item} />

              {/* Applicant Card */}
              <ApplicantCard
                applicant={item}
                onStatusUpdated={fetchApplicants}
              />
            </View>
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
