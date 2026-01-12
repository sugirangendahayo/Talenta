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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetails();
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
      console.error("Error fetching job...:", err);
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
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
                {/* Company Logo Placeholder */}
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

        {/* Spacer for bottom button */}
        <View className="h-24" />
      </ScrollView>

      {/* Apply Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity className="bg-cyan-700 rounded-2xl py-4 flex flex-row justify-center items-center">
          <Text className="text-white font-quicksandBold text-lg mr-2">
            Apply Now
          </Text>
          <MaterialIcons name="arrow-outward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
