import InfoAlertModal from "@/components/modal/InfoAlertModal";
import { useApplyJob } from "@/hooks/useApplyJob";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  category: string;
  experience_level: string;
  skills_required: string[];
  status: string;
  created_at: string;
  employer_profiles?: {
    company_name: string;
    email: string;
  };
}

export default function JobDetailsScreen() {
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [infoAlertTitle, setInfoAlertTitle] = useState("");
  const [infoAlertMessage, setInfoAlertMessage] = useState("");
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const {
    applying,
    checkingRequirements,
    hasApplied,
    profile,
    checkRequirements,
    applyForJob,
  } = useApplyJob();

  useEffect(() => {
    fetchJobDetails();
    if (id) checkRequirements(id as string);
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("jobs")
        .select(`*, employer_profiles(company_name, email)`)
        .eq("id", id)
        .eq("status", "active")
        .single();
      if (fetchError) throw fetchError;
      if (!data) { setError("Job not found"); return; }
      setJob(data);
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (!id) return;
    const requirements = await checkRequirements(id as string);
    if (!requirements.hasProfile) {
      setInfoAlertTitle("Profile Not Found");
      setInfoAlertMessage("Please create your jobseeker profile first.");
      setShowInfoAlert(true);
      return;
    }
    if (requirements.missingFields.length > 0) {
      setInfoAlertTitle("Profile Incomplete");
      setInfoAlertMessage(
        `Please complete the following before applying:\n\n• ${requirements.missingFields.join("\n• ")}\n\nGo to your Profile to complete it.`
      );
      setShowInfoAlert(true);
      return;
    }
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!id) return;
    const success = await applyForJob({ jobId: id as string, coverLetter });
    if (success) { setShowApplyModal(false); setCoverLetter(""); }
  };

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 604800)} weeks ago`;
  };

  const getCategoryDisplay = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      it: "IT & Software", design: "Design", business: "Business",
      construction: "Construction", finance: "Finance", healthcare: "Healthcare",
      education: "Education", sales: "Sales & Marketing", hospitality: "Hospitality",
      transport: "Transport", creative: "Creative", agriculture: "Agriculture",
      security: "Security & Law",
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-500 font-quicksandMedium mt-3 text-sm">
          Loading job details...
        </Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-8">
        <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-base font-quicksandBold text-gray-800 text-center mb-1">
          {error || "Job not found"}
        </Text>
        <Text className="text-sm font-quicksandMedium text-gray-400 text-center mb-6">
          This listing may have been removed or expired.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-cyan-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-quicksandBold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const companyName = job.employer_profiles?.company_name || "Company";
  const salary = formatSalary(job.salary_min, job.salary_max);
  const timeAgo = getTimeAgo(job.created_at);
  const jobTypes = job.job_type.split(",").map((t) => t.trim());
  const categoryDisplay = getCategoryDisplay(job.category);

  return (
    <View className="flex-1 bg-gray-100">
      {/* ── TOP HERO — untouched ── */}
      <View className="pt-16 pb-8 px-6 rounded-b-[40px] bg-cyan-700">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-lg font-quicksandBold text-white">
            Job Details
          </Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── JOB HEADER — untouched ── */}
        <View className="px-4 pt-6">
          <View className="flex flex-row items-start justify-between mb-4">
            <View className="flex flex-row items-center flex-1 mr-3">
              <View className="w-20 h-20 rounded-full border border-gray-200 bg-white items-center justify-center flex">
                <Text className="text-3xl font-quicksandBold text-cyan-600">
                  {companyName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 ml-4">
                <View className="flex flex-row items-center gap-2 mb-1">
                  <Text className="text-gray-600 font-quicksandMedium text-base">
                    {companyName}
                  </Text>
                  <MaterialIcons name="verified" size={16} color="#0E7490" />
                </View>
                <Text className="text-2xl font-quicksandBold text-gray-800 mb-1">
                  {job.title}
                </Text>
                <View className="flex flex-row items-center gap-1">
                  <Ionicons name="location-sharp" size={16} color="#0E7490" />
                  <Text className="text-gray-600 font-quicksandMedium text-base">
                    {job.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Info — untouched */}
          <View className="flex flex-row flex-wrap gap-3 mb-6">
            <View className="bg-cyan-100 px-4 py-3 rounded-2xl">
              <Text className="text-cyan-700 font-quicksandBold text-sm">
                {salary}
              </Text>
            </View>
            {jobTypes.map((type, index) => (
              <View key={index} className="bg-white px-4 py-3 rounded-2xl">
                <Text className="text-gray-700 font-quicksandMedium text-sm">
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── BELOW THE FOLD — reworked ── */}

        {/* Description */}
        <View className="mx-4 mb-3 bg-white rounded-2xl overflow-hidden">
          <View className="px-4 pt-4 pb-2">
            <Text className="font-quicksandBold text-[15px] text-gray-900 mb-3">
              About the role
            </Text>
            <Text className="font-quicksandMedium text-[13.5px] text-gray-500 leading-[22px]">
              {job.description}
            </Text>
          </View>
          {/* bottom accent strip */}
          <View className="h-[3px] bg-cyan-50 mt-4" />
        </View>

        {/* Experience + Skills side-by-side context strip */}
        {job.experience_level && (
          <View className="mx-4 mb-3 bg-white rounded-2xl px-4 py-4">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-7 h-7 rounded-lg bg-cyan-50 items-center justify-center">
                <Ionicons name="briefcase-outline" size={15} color="#0E7490" />
              </View>
              <Text className="font-quicksandBold text-[15px] text-gray-900">
                Experience
              </Text>
            </View>
            <Text className="font-quicksandMedium text-[13.5px] text-gray-500 ml-9">
              {job.experience_level}
            </Text>
          </View>
        )}

        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <View className="mx-4 mb-3 bg-white rounded-2xl px-4 py-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 rounded-lg bg-cyan-50 items-center justify-center">
                <Octicons name="checklist" size={15} color="#0E7490" />
              </View>
              <Text className="font-quicksandBold text-[15px] text-gray-900">
                Skills required
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {job.skills_required.map((skill, index) => (
                <View
                  key={index}
                  className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full"
                >
                  <Text className="font-quicksandSemiBold text-[12px] text-gray-700">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Overview — clean key/value rows */}
        <View className="mx-4 mb-3 bg-white rounded-2xl px-4 pt-4 pb-1">
          <Text className="font-quicksandBold text-[15px] text-gray-900 mb-1">
            Overview
          </Text>
          {[
            { label: "Posted", value: timeAgo },
            { label: "Category", value: categoryDisplay },
            { label: "Job type", value: jobTypes.join(", ") },
            { label: "Salary", value: salary },
            ...(job.experience_level
              ? [{ label: "Experience", value: job.experience_level }]
              : []),
          ].map((row, i, arr) => (
            <View key={i}>
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-quicksandMedium text-[13px] text-gray-400">
                  {row.label}
                </Text>
                <Text className="font-quicksandBold text-[13px] text-gray-800">
                  {row.value}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <View className="h-px bg-gray-100" />
              )}
            </View>
          ))}
        </View>

        {/* Company */}
        <View className="mx-4 mb-3 bg-white rounded-2xl px-4 py-4">
          <Text className="font-quicksandBold text-[15px] text-gray-900 mb-3">
            About the company
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 items-center justify-center">
              <Text className="font-quicksandBold text-lg text-cyan-600">
                {companyName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-0.5">
                <Text className="font-quicksandBold text-[14px] text-gray-900">
                  {companyName}
                </Text>
                <MaterialIcons name="verified" size={14} color="#0E7490" />
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                <Text className="font-quicksandMedium text-[12px] text-gray-400">
                  {job.location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-28" />
      </ScrollView>

      {/* ── APPLY BAR ── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        {hasApplied ? (
          <View className="flex-row items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-2xl py-4">
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text className="font-quicksandBold text-[15px] text-green-700">
              Application submitted
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleApplyClick}
            disabled={checkingRequirements}
            activeOpacity={0.85}
            className="bg-gray-900 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            {checkingRequirements ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text className="font-quicksandBold text-[15px] text-white">
                  Apply now
                </Text>
                <MaterialIcons name="arrow-outward" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── APPLY MODAL ── */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl px-5 pt-4 pb-8 max-h-[85%]">
            {/* Drag handle */}
            <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-5" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-quicksandBold text-[20px] text-gray-900">
                Apply for role
              </Text>
              <TouchableOpacity
                onPress={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Job summary */}
              <View className="flex-row items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                <View className="w-10 h-10 rounded-xl bg-cyan-50 items-center justify-center">
                  <Text className="font-quicksandBold text-[15px] text-cyan-700">
                    {companyName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksandBold text-[14px] text-gray-900 leading-tight">
                    {job.title}
                  </Text>
                  <Text className="font-quicksandMedium text-[12px] text-gray-400">
                    {companyName} · {salary}
                  </Text>
                </View>
              </View>

              {/* Profile status */}
              {profile && (
                <View className="flex-row items-center gap-2 bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-4">
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text className="font-quicksandMedium text-[13px] text-green-700 flex-1">
                    Applying as{" "}
                    <Text className="font-quicksandBold">
                      {profile.first_name} {profile.last_name}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Cover letter */}
              <View className="mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-quicksandSemiBold text-[14px] text-gray-900">
                    Cover letter
                  </Text>
                  <Text className="font-quicksandMedium text-[12px] text-gray-400">
                    Optional
                  </Text>
                </View>
                <TextInput
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder="Why are you a great fit for this role?"
                  placeholderTextColor="#D1D5DB"
                  multiline
                  textAlignVertical="top"
                  className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-quicksandMedium text-gray-800 min-h-[140px] text-[14px]"
                />
                <Text className="font-quicksandMedium text-[11px] text-gray-300 mt-1.5 text-right">
                  {coverLetter.length} chars
                </Text>
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmitApplication}
                disabled={applying}
                activeOpacity={0.85}
                className="bg-gray-900 rounded-2xl py-4 flex-row items-center justify-center gap-2 mt-3 mb-3"
              >
                {applying ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text className="font-quicksandBold text-[15px] text-white">
                      Submit application
                    </Text>
                    <Ionicons name="send" size={15} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <Text className="text-center font-quicksandMedium text-[12px] text-gray-300 mb-2">
                Your application will be sent directly to {companyName}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <InfoAlertModal
        visible={showInfoAlert}
        title={infoAlertTitle}
        message={infoAlertMessage}
        buttonText="Go to profile"
        onClose={() => {
          setShowInfoAlert(false);
          router.push("/(jobseeker-tabs)/jobseekers/Profile");
        }}
      />
    </View>
  );
}