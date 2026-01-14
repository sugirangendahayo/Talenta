import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from "react-native";
import { useApplyJob } from "@/app/hooks/useApplyJob";

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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  // Use the apply job hook
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
    if (id) {
      checkRequirements(id as string);
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("jobs")
        .select(
          `
          *,
          employer_profiles(
            company_name,
            email
          )
        `
        )
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Job not found");
        return;
      }

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

    // Check requirements before showing modal
    const requirements = await checkRequirements(id as string);

    if (!requirements.hasProfile) {
      alert("Profile Not Found\n\nPlease create your jobseeker profile first.");
      return;
    }

    if (requirements.missingFields.length > 0) {
      alert(
        `Profile Incomplete\n\nPlease complete the following before applying:\n\n• ${requirements.missingFields.join("\n• ")}\n\nGo to your Profile to complete it.`
      );
      return;
    }

    // All requirements met, show apply modal
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!id) return;

    const success = await applyForJob({
      jobId: id as string,
      coverLetter,
    });

    if (success) {
      setShowApplyModal(false);
      setCoverLetter("");
    }
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
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
      it: "IT & Software",
      design: "Design",
      business: "Business",
      construction: "Construction",
      finance: "Finance",
      healthcare: "Healthcare",
      education: "Education",
      sales: "Sales & Marketing",
      hospitality: "Hospitality",
      transport: "Transport",
      creative: "Creative",
      agriculture: "Agriculture",
      security: "Security & Law",
    };
    return (
      categoryNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-600 font-quicksandMedium mt-4">
          Loading job details...
        </Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-quicksandBold text-gray-800 mt-4 text-center">
          {error || "Job not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-cyan-700 px-6 py-3 rounded-2xl"
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
      {/* Header */}
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
        {/* Job Header */}
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

          {/* Quick Info */}
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

        {/* Job Description */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            Job Description
          </Text>
          <Text className="text-gray-600 font-quicksandMedium text-base leading-6">
            {job.description}
          </Text>
        </View>

        {/* Experience Level */}
        {job.experience_level && (
          <View className="p-4 m-3 bg-white rounded-2xl">
            <View className="flex flex-row items-center gap-2 mb-3">
              <View className="p-3 bg-gray-200 rounded-full">
                <Ionicons name="briefcase" size={22} color="black" />
              </View>
              <Text className="text-xl font-quicksandBold text-gray-800">
                Experience Required
              </Text>
            </View>
            <Text className="text-gray-600 font-quicksandMedium text-base">
              {job.experience_level}
            </Text>
          </View>
        )}

        {/* Skills Required */}
        {job.skills_required && job.skills_required.length > 0 && (
          <View className="p-4 m-3 bg-white rounded-2xl">
            <View className="flex flex-row items-center gap-2 mb-3">
              <View className="p-3 bg-gray-200 rounded-full">
                <Octicons name="checklist" size={22} color="black" />
              </View>
              <Text className="text-xl font-quicksandBold text-gray-800">
                Required Skills
              </Text>
            </View>
            <View className="flex flex-row flex-wrap gap-2">
              {job.skills_required.map((skill, index) => (
                <View
                  key={index}
                  className="bg-cyan-50 px-3 py-2 rounded-full border border-cyan-200"
                >
                  <Text className="text-cyan-700 font-quicksandSemibold text-sm">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Job Info */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            Job Information
          </Text>
          <View className="bg-cyan-50 rounded-2xl p-4 space-y-3">
            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">Posted</Text>
              <Text className="text-gray-800 font-quicksandBold">
                {timeAgo}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />
            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">
                Category
              </Text>
              <Text className="text-gray-800 font-quicksandBold">
                {categoryDisplay}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />
            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">Type</Text>
              <Text className="text-gray-800 font-quicksandBold">
                {jobTypes.join(", ")}
              </Text>
            </View>
            <View className="h-px bg-cyan-200" />
            <View className="flex flex-row justify-between py-2">
              <Text className="text-gray-600 font-quicksandMedium">Salary</Text>
              <Text className="text-gray-800 font-quicksandBold">{salary}</Text>
            </View>
          </View>
        </View>

        {/* Company Info */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            About Company
          </Text>
          <View className="flex flex-row items-center gap-3 mb-3">
            <View className="w-12 h-12 rounded-full bg-cyan-100 items-center justify-center flex">
              <Text className="text-xl font-quicksandBold text-cyan-600">
                {companyName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-quicksandBold text-gray-800">
                {companyName}
              </Text>
              <View className="flex flex-row items-center gap-1 mt-1">
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text className="text-gray-600 font-quicksandMedium text-sm">
                  {job.location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Apply Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        {hasApplied ? (
          <View className="bg-green-100 rounded-2xl py-4 flex flex-row justify-center items-center">
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text className="text-green-700 font-quicksandBold text-lg ml-2">
              Already Applied
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleApplyClick}
            disabled={checkingRequirements}
            className="bg-cyan-700 rounded-2xl py-4 flex flex-row justify-center items-center"
          >
            {checkingRequirements ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-quicksandBold text-lg mr-2">
                  Apply Now
                </Text>
                <MaterialIcons name="arrow-outward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Application Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                Apply for this job
              </Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Ionicons name="close-circle" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Job Summary */}
              <View className="bg-cyan-50 p-4 rounded-2xl mb-4">
                <Text className="text-lg font-quicksandBold text-gray-800 mb-1">
                  {job.title}
                </Text>
                <Text className="text-gray-600 font-quicksandMedium">
                  {companyName}
                </Text>
                <Text className="text-cyan-700 font-quicksandSemibold mt-2">
                  {salary}
                </Text>
              </View>

              {/* Profile Status */}
              {profile && (
                <View className="bg-green-50 p-4 rounded-2xl mb-4 border border-green-200">
                  <View className="flex flex-row items-center gap-2 mb-2">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#059669"
                    />
                    <Text className="text-green-800 font-quicksandBold">
                      Profile Complete
                    </Text>
                  </View>
                  <Text className="text-green-700 font-quicksandMedium text-sm">
                    {profile.first_name} {profile.last_name}
                  </Text>
                  <Text className="text-green-700 font-quicksandMedium text-sm">
                    {profile.email}
                  </Text>
                </View>
              )}

              {/* Cover Letter */}
              <View className="mb-6">
                <View className="flex flex-row justify-between items-center mb-2">
                  <Text className="text-base font-quicksandSemibold text-gray-800">
                    Cover Letter
                  </Text>
                  <Text className="text-gray-500 font-quicksandMedium text-sm">
                    Optional
                  </Text>
                </View>
                <TextInput
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="bg-gray-50 rounded-2xl p-4 font-quicksandMedium text-gray-800 min-h-[150px]"
                  style={{ fontSize: 15 }}
                />
                <Text className="text-gray-500 font-quicksandMedium text-sm mt-2">
                  {coverLetter.length} characters
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitApplication}
                disabled={applying}
                className="bg-cyan-700 rounded-2xl py-4 flex flex-row justify-center items-center mb-4"
              >
                {applying ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-quicksandBold text-lg mr-2">
                      Submit Application
                    </Text>
                    <Ionicons name="send" size={18} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <Text className="text-center text-gray-500 font-quicksandMedium text-sm">
                Your application will be sent to {companyName}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
