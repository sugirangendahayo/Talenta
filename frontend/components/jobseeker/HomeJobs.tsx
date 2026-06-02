// components/jobseeker/HomeJobs.tsx
import { useJobs } from "@/hooks/useJobs";
import { supabase } from "@/lib/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

interface HomeJobsProps {
  selectedCategory: string;
  searchQuery: string;
}

interface UserProfile {
  skills?: string[];
  experience_level?: string;
}

const PREVIEW_COUNT = 4;

const HomeJobs: React.FC<HomeJobsProps> = ({ selectedCategory, searchQuery }) => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { t } = useTranslation(["home", "jobs"]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("jobseeker_profiles")
            .select("skills, experience_level")
            .eq("id", user.id)
            .single();
          if (profile) {
            setUserProfile({
              skills: profile.skills || [],
              experience_level: profile.experience_level || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const { jobs, loading, newJobsCount, loadNewJobs } = useJobs({
    category: selectedCategory,
    searchQuery,
    pageSize: PREVIEW_COUNT,
    recommended: true,
    userProfile: userProfile || undefined,
  });

  const handleJobPress = (jobId: string) => {
    router.push({ pathname: "/jobseekers/job-details/[id]", params: { id: jobId } });
  };

  const handleViewAll = () => {
    router.push("../../app/(jobseeker-tabs)/jobseekers/Jobs.tsx" as any);
  };

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
    return `${fmt(min)} - ${fmt(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return t("jobs:time.justNow");
    if (seconds < 3600) return t("jobs:time.minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("jobs:time.hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("jobs:time.daysAgo", { days: Math.floor(seconds / 86400) });
    return t("jobs:time.weeksAgo", { weeks: Math.floor(seconds / 604800) });
  };

  const isRecommending =
    userProfile && !searchQuery && selectedCategory === "all" &&
    userProfile.skills && userProfile.skills.length > 0;

  if (loading || profileLoading) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  return (
    <View className="mb-6">
      {/* Section header */}
      <View className="flex-row items-center justify-between px-6 mb-4">
        <View>
          <Text className="text-xl font-quicksandBold text-gray-800">
            {isRecommending
              ? t("home:recommended.title", { defaultValue: "Recommended" })
              : t("home:featuredJobs.title", { defaultValue: "Latest Jobs" })}
          </Text>
          {isRecommending && (
            <Text className="text-xs font-quicksandMedium text-gray-400 mt-0.5">
              {t("home:recommended.basedOnSkills", { defaultValue: "Based on your skills" })}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleViewAll}
          className="flex-row items-center gap-1"
        >
          <Text className="text-cyan-700 font-quicksandBold text-sm">
            {t("home:featuredJobs.viewAll", { defaultValue: "View All" })}
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#0E7490" />
        </TouchableOpacity>
      </View>

      {/* New Jobs Banner */}
      {newJobsCount > 0 && (
        <TouchableOpacity
          className="mx-6 mb-3 bg-cyan-600 p-3 rounded-2xl flex-row items-center justify-center"
          onPress={loadNewJobs}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={16} color="white" />
          <Text className="text-white font-quicksandBold text-sm ml-2">
            {t("home:stats.newAvailable", { count: newJobsCount, defaultValue: `${newJobsCount} new jobs` })}
          </Text>
        </TouchableOpacity>
      )}

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <View className="items-center py-12 px-8">
          <Ionicons name="search-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 font-quicksandMedium text-sm mt-3 text-center">
            {t("home:search.noResults", { defaultValue: "No jobs found. Try a different search." })}
          </Text>
        </View>
      ) : (
        <View className="gap-3 px-6">
          {jobs.slice(0, PREVIEW_COUNT).map((item: any) => {
            const companyName = item.employer_profiles?.company_name || "Company";
            const salary = formatSalary(item.salary_min, item.salary_max);
            const timeAgo = getTimeAgo(item.created_at);
            const jobTypes = item.job_type.split(",").map((t: string) => t.trim());

            return (
              <TouchableOpacity
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                onPress={() => handleJobPress(item.id)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1 mr-3">
                    {/* Company initial avatar */}
                    <View
                      className="w-12 h-12 rounded-2xl border border-gray-100 bg-cyan-50 items-center justify-center"
                    >
                      <Text className="text-lg font-quicksandBold text-cyan-600">
                        {companyName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center gap-1">
                        <Text className="text-gray-500 font-quicksandMedium text-xs">
                          {companyName}
                        </Text>
                        <MaterialIcons name="verified" size={12} color="#0E7490" />
                      </View>
                      <Text className="text-base font-quicksandBold text-gray-800 mt-0.5">
                        {item.title}
                      </Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Ionicons name="location-sharp" size={11} color="#0E7490" />
                        <Text className="text-gray-500 font-quicksandMedium text-xs">
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Tags row */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {jobTypes.slice(0, 2).map((type: string, index: number) => (
                    <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                      <Text className="text-gray-600 text-xs font-quicksandMedium">{type}</Text>
                    </View>
                  ))}
                  <View className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    <Text className="text-gray-400 text-xs font-quicksandMedium">{timeAgo}</Text>
                  </View>
                </View>

                {/* Footer */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <Text className="text-cyan-700 text-sm font-quicksandBold">
                    {salary}
                  </Text>
                  <View className="bg-cyan-700 px-4 py-1.5 rounded-full">
                    <Text className="text-white text-xs font-quicksandBold">
                      {t("home:featuredJobs.apply", { defaultValue: "Apply" })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* View All button at bottom */}
      {jobs.length > 0 && (
        <TouchableOpacity
          onPress={handleViewAll}
          className="mx-6 mt-4 border border-cyan-200 bg-cyan-50 rounded-2xl p-4 flex-row items-center justify-center gap-2"
          activeOpacity={0.8}
        >
          <Text className="text-cyan-700 font-quicksandBold text-sm">
            {t("home:featuredJobs.viewAllJobs", { defaultValue: "View All Jobs" })}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#0E7490" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeJobs;