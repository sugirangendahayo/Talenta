// app/jobseekers/job-details/[id].tsx
import InfoAlertModal from "@/components/modal/InfoAlertModal";
import { useApplyJob } from "@/hooks/useApplyJob";
import { useJobBookmark } from "@/hooks/useBookmarks";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/common/UserAvatar";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
    profile_image_url?: string | null;
  };
}

// Static fallback copy used as the i18next `defaultValue` until `jobs:categories.*`
// keys exist in the translation files — keeps behavior identical to before,
// just translatable. Hoisted out of the component so it isn't rebuilt per render.
const CATEGORY_FALLBACK_NAMES: Record<string, string> = {
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

export default function JobDetailsScreen() {
  const { t } = useTranslation(["jobs", "common"]);
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

  // ─── Bookmark state for this job ─────────────────────────────────────────
  const {
    isBookmarked,
    toggling,
    toggle: toggleBookmark,
  } = useJobBookmark(id as string);

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
        .select(`*, employer_profiles(company_name, email, profile_image_url)`)
        .eq("id", id)
        .eq("status", "active")
        .single();
      if (fetchError) throw fetchError;
      if (!data) {
        setError(t("jobs:details.notFoundTitle", { defaultValue: "Job not found" }));
        return;
      }
      setJob(data);
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(
        err.message || t("jobs:details.loadError", { defaultValue: "Failed to load job details" })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (!id) return;
    const requirements = await checkRequirements(id as string);
    if (!requirements.hasProfile) {
      setInfoAlertTitle(
        t("jobs:details.profileNotFoundTitle", { defaultValue: "Profile Not Found" })
      );
      setInfoAlertMessage(
        t("jobs:details.profileNotFoundMessage", {
          defaultValue: "Please create your jobseeker profile first.",
        })
      );
      setShowInfoAlert(true);
      return;
    }
    if (requirements.missingFields.length > 0) {
      const intro = t("jobs:details.missingFieldsIntro", {
        defaultValue: "Please complete the following before applying:",
      });
      const outro = t("jobs:details.missingFieldsOutro", {
        defaultValue: "Go to your Profile to complete it.",
      });
      setInfoAlertTitle(
        t("jobs:details.profileIncompleteTitle", { defaultValue: "Profile Incomplete" })
      );
      setInfoAlertMessage(
        `${intro}\n\n• ${requirements.missingFields.join("\n• ")}\n\n${outro}`
      );
      setShowInfoAlert(true);
      return;
    }
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!id) return;
    const success = await applyForJob({ jobId: id as string, coverLetter });
    if (success) {
      setShowApplyModal(false);
      setCoverLetter("");
    }
  };

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) =>
      n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  // Same keys Applications/Home/JobsList already use — this screen previously
  // hardcoded its own English-only copy of this exact logic.
  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return t("jobs:time.justNow");
    if (seconds < 3600) return t("jobs:time.minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("jobs:time.hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("jobs:time.daysAgo", { days: Math.floor(seconds / 86400) });
    return t("jobs:time.weeksAgo", { weeks: Math.floor(seconds / 604800) });
  };

  const getCategoryDisplay = (category: string) => {
    const fallback =
      CATEGORY_FALLBACK_NAMES[category] ||
      category.charAt(0).toUpperCase() + category.slice(1);
    return t(`jobs:categories.${category}`, { defaultValue: fallback });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-[#141414]">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-3 text-sm">
          {t("jobs:details.loading", { defaultValue: "Loading job details..." })}
        </Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-[#141414] px-8">
        <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 text-center mb-1">
          {error || t("jobs:details.notFoundTitle", { defaultValue: "Job not found" })}
        </Text>
        <Text className="text-sm font-quicksandMedium text-gray-400 text-center mb-6">
          {t("jobs:details.notFoundSubtitle", {
            defaultValue: "This listing may have been removed or expired.",
          })}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="bg-cyan-700 dark:bg-cyan-800 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-quicksandBold">
            {t("common:buttons.goBack", { defaultValue: "Go Back" })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const companyName = job.employer_profiles?.company_name || "Company";
  const salary = formatSalary(job.salary_min, job.salary_max);
  const timeAgo = getTimeAgo(job.created_at);
  const jobTypes = job.job_type
    ? job.job_type.split(",").map((t) => t.trim())
    : [];
  const categoryDisplay = getCategoryDisplay(job.category);
  const isEmployerVerified =
    job.employer_profiles?.business_verification_status === "approved" &&
    job.employer_profiles?.premium_plan !== "free" &&
    !!job.employer_profiles?.premium_plan;

  return (
    <View className="flex-1 bg-gray-100 dark:bg-[#141414]">
      {/* ── TOP HERO ── */}
      <View className="pt-16 pb-8 px-6 rounded-b-[40px] bg-cyan-700 dark:bg-cyan-800">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t("common:buttons.goBack", { defaultValue: "Go back" })}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-lg font-quicksandBold text-white">
            {t("jobs:details.headerTitle", { defaultValue: "Job Details" })}
          </Text>

          {/* ── Bookmark button ── translucent-white overlay states (matches
              the bg-black/40 modal backdrop technique already used further
              down this same file) instead of an inline style block. Icon
              stays white in both states — the cyan-700 hero already can't
              host the app's usual solid-cyan bookmark fill, so state reads
              through background intensity + outline→filled icon swap rather
              than introducing a one-off gold accent used nowhere else. */}
          <TouchableOpacity
            onPress={toggleBookmark}
            disabled={toggling}
            className="p-2"
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityState={{ selected: isBookmarked }}
            accessibilityLabel={
              isBookmarked
                ? t("jobs:details.unsaveJob", { defaultValue: "Remove from saved jobs" })
                : t("jobs:details.saveJob", { defaultValue: "Save job" })
            }
          >
            {toggling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View
                className={`rounded-[10px] p-1.5 ${isBookmarked ? "bg-white dark:bg-[#080A08]/25" : "bg-white dark:bg-[#080A08]/10"}`}
              >
                <Ionicons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color="#fff"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── JOB HEADER ── */}
        <View className="px-4 pt-6">
          <View className="flex flex-row items-start justify-between mb-4">
            <View className="flex flex-row items-center flex-1 mr-3">
              <UserAvatar
                imageUrl={job.employer_profiles?.profile_image_url}
                name={companyName}
                size={70}
                style={{ marginRight: 16 }}
              />
              <View className="flex-1">
                <View className="flex flex-row items-center gap-2 mb-1">
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-base">
                    {companyName}
                  </Text>
                  {isEmployerVerified && (
                    <MaterialIcons name="verified" size={16} color="#0E7490" />
                  )}
                </View>
                <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200 mb-1">
                  {job.title}
                </Text>
                <View className="flex flex-row items-center gap-1">
                  <Ionicons name="location-sharp" size={16} color="#0E7490" />
                  <Text className="text-gray-600 dark:text-gray-400 font-quicksandMedium text-base">
                    {job.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Applied + bookmarked status — compact chips instead of two
              stacked full-width banners when both happen to be true */}
          {(hasApplied || isBookmarked) && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {hasApplied && (
                <View className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text className="font-quicksandBold text-xs text-emerald-700">
                    {t("jobs:details.appliedBadge", { defaultValue: "Already applied" })}
                  </Text>
                </View>
              )}
              {isBookmarked && (
                <View className="flex-row items-center gap-1.5 bg-cyan-50 border border-cyan-100 rounded-full px-3 py-1.5">
                  <Ionicons name="bookmark" size={13} color="#0E7490" />
                  <Text className="font-quicksandMedium text-xs text-cyan-700">
                    {t("jobs:details.savedBadge", { defaultValue: "Saved" })}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Quick Info */}
          <View className="flex flex-row flex-wrap gap-3 mb-6">
            <View className="bg-cyan-100 px-4 py-3 rounded-2xl">
              <Text className="text-cyan-700 font-quicksandBold text-sm">
                {salary}
              </Text>
            </View>
            {jobTypes.map((type, index) => (
              <View key={index} className="bg-white dark:bg-[#080A08] px-4 py-3 rounded-2xl">
                <Text className="text-gray-700 dark:text-gray-300 font-quicksandMedium text-sm">
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="mx-4 mb-3 bg-white dark:bg-[#080A08] rounded-2xl overflow-hidden">
          <View className="px-4 pt-4 pb-2">
            <Text className="font-quicksandBold text-[15px] text-gray-900 dark:text-gray-100 mb-3">
              {t("jobs:details.aboutRole", { defaultValue: "About the role" })}
            </Text>
            <Text className="font-quicksandMedium text-[13.5px] text-gray-500 dark:text-gray-400 leading-[22px]">
              {job.description}
            </Text>
          </View>
          <View className="h-[3px] bg-cyan-50 mt-4" />
        </View>

        {/* Experience */}
        {job.experience_level && (
          <View className="mx-4 mb-3 bg-white dark:bg-[#080A08] rounded-2xl px-4 py-4">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-7 h-7 rounded-lg bg-cyan-50 items-center justify-center">
                <Ionicons name="briefcase-outline" size={15} color="#0E7490" />
              </View>
              <Text className="font-quicksandBold text-[15px] text-gray-900 dark:text-gray-100">
                {t("jobs:details.experience", { defaultValue: "Experience" })}
              </Text>
            </View>
            <Text className="font-quicksandMedium text-[13.5px] text-gray-500 dark:text-gray-400 ml-9">
              {job.experience_level}
            </Text>
          </View>
        )}

        {/* Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <View className="mx-4 mb-3 bg-white dark:bg-[#080A08] rounded-2xl px-4 py-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 rounded-lg bg-cyan-50 items-center justify-center">
                <Octicons name="checklist" size={15} color="#0E7490" />
              </View>
              <Text className="font-quicksandBold text-[15px] text-gray-900 dark:text-gray-100">
                {t("jobs:details.skillsRequired", { defaultValue: "Skills required" })}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {job.skills_required.map((skill, index) => (
                <View
                  key={index}
                  className="bg-gray-50 dark:bg-[#080A08] border border-gray-200 dark:border-[#2a2a2a] px-3 py-1.5 rounded-full"
                >
                  <Text className="font-quicksandSemiBold text-[12px] text-gray-700 dark:text-gray-300">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Overview */}
        <View className="mx-4 mb-3 bg-white dark:bg-[#080A08] rounded-2xl px-4 pt-4 pb-1">
          <Text className="font-quicksandBold text-[15px] text-gray-900 dark:text-gray-100 mb-1">
            {t("jobs:details.overview", { defaultValue: "Overview" })}
          </Text>
          {[
            { label: t("jobs:details.overviewLabels.posted", { defaultValue: "Posted" }), value: timeAgo },
            {
              label: t("jobs:details.overviewLabels.category", { defaultValue: "Category" }),
              value: categoryDisplay,
            },
            {
              label: t("jobs:details.overviewLabels.jobType", { defaultValue: "Job type" }),
              value: jobTypes.join(", "),
            },
            { label: t("jobs:details.overviewLabels.salary", { defaultValue: "Salary" }), value: salary },
            ...(job.experience_level
              ? [
                  {
                    label: t("jobs:details.overviewLabels.experience", { defaultValue: "Experience" }),
                    value: job.experience_level,
                  },
                ]
              : []),
          ].map((row, i, arr) => (
            <View key={i}>
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-quicksandMedium text-[13px] text-gray-400">
                  {row.label}
                </Text>
                <Text className="font-quicksandBold text-[13px] text-gray-800 dark:text-gray-200">
                  {row.value}
                </Text>
              </View>
              {i < arr.length - 1 && <View className="h-px bg-gray-100 dark:bg-[#141414]" />}
            </View>
          ))}
        </View>

        {/* Company */}
        <View className="mx-4 mb-3 bg-white dark:bg-[#080A08] rounded-2xl px-4 py-4">
          <Text className="font-quicksandBold text-[15px] text-gray-900 dark:text-gray-100 mb-3">
            {t("jobs:details.aboutCompany", { defaultValue: "About the company" })}
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 items-center justify-center">
              <Text className="font-quicksandBold text-lg text-cyan-600 dark:text-cyan-400">
                {companyName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-0.5">
                <Text className="font-quicksandBold text-[14px] text-gray-900 dark:text-gray-100">
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
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#080A08] border-t border-gray-100 dark:border-[#222] px-4 py-4">
        {hasApplied ? (
          <View className="flex-row items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-2xl py-4">
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text className="font-quicksandBold text-[15px] text-green-700">
              {t("jobs:details.applicationSubmitted", { defaultValue: "Application submitted" })}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleApplyClick}
            disabled={checkingRequirements}
            activeOpacity={0.85}
            accessibilityRole="button"
            className="bg-cyan-700 dark:bg-cyan-800 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            {checkingRequirements ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text className="font-quicksandBold text-[15px] text-white">
                  {t("jobs:details.applyNow", { defaultValue: "Apply now" })}
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
        {/* KeyboardAvoidingView was missing — the cover letter field is
            multiline and meant for real typing, so without this the keyboard
            could sit on top of it on iOS instead of the sheet making room. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/40"
        >
          <View className="bg-white dark:bg-[#080A08] rounded-t-3xl px-5 pt-4 pb-8 max-h-[85%]">
            <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-[#1e1e1e] self-center mb-5" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-quicksandBold text-[20px] text-gray-900 dark:text-gray-100">
                {t("jobs:details.applyModalTitle", { defaultValue: "Apply for role" })}
              </Text>
              <TouchableOpacity
                onPress={() => setShowApplyModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={t("common:buttons.close", { defaultValue: "Close" })}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
              >
                <Ionicons name="close" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Job summary */}
              <View className="flex-row items-center gap-3 bg-gray-50 dark:bg-[#080A08] border border-gray-100 dark:border-[#222] rounded-2xl p-4 mb-4">
                <View className="w-10 h-10 rounded-xl bg-cyan-50 items-center justify-center">
                  <Text className="font-quicksandBold text-[15px] text-cyan-700">
                    {companyName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksandBold text-[14px] text-gray-900 dark:text-gray-100 leading-tight">
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
                    {t("jobs:details.applyingAs", { defaultValue: "Applying as" })}{" "}
                    <Text className="font-quicksandBold">
                      {profile.first_name} {profile.last_name}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Cover letter */}
              <View className="mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-quicksandSemiBold text-[14px] text-gray-900 dark:text-gray-100">
                    {t("jobs:details.coverLetter", { defaultValue: "Cover letter" })}
                  </Text>
                  <Text className="font-quicksandMedium text-[12px] text-gray-400">
                    {t("jobs:details.optional", { defaultValue: "Optional" })}
                  </Text>
                </View>
                <TextInput
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder={t("jobs:details.coverLetterPlaceholder", {
                    defaultValue: "Why are you a great fit for this role?",
                  })}
                  placeholderTextColor="#D1D5DB"
                  multiline
                  textAlignVertical="top"
                  className="bg-gray-50 dark:bg-[#080A08] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 font-quicksandMedium text-gray-800 dark:text-gray-200 min-h-[140px] text-[14px]"
                />
                <Text className="font-quicksandMedium text-[11px] text-gray-300 mt-1.5 text-right">
                  {t("jobs:details.charsCount", {
                    count: coverLetter.length,
                    defaultValue: `${coverLetter.length} chars`,
                  })}
                </Text>
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmitApplication}
                disabled={applying}
                activeOpacity={0.85}
                accessibilityRole="button"
                className="bg-cyan-700 dark:bg-cyan-800 rounded-2xl py-4 flex-row items-center justify-center gap-2 mt-3 mb-3"
              >
                {applying ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text className="font-quicksandBold text-[15px] text-white">
                      {t("jobs:details.submitApplication", { defaultValue: "Submit application" })}
                    </Text>
                    <Ionicons name="send" size={15} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <Text className="text-center font-quicksandMedium text-[12px] text-gray-300 mb-2">
                {t("jobs:details.sentDirectly", {
                  company: companyName,
                  defaultValue: `Your application will be sent directly to ${companyName}`,
                })}
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <InfoAlertModal
        visible={showInfoAlert}
        title={infoAlertTitle}
        message={infoAlertMessage}
        buttonText={t("common:buttons.goToProfile", { defaultValue: "Go to profile" })}
        onClose={() => {
          setShowInfoAlert(false);
          router.push("/(jobseeker-tabs)/jobseekers/Profile");
        }}
      />
    </View>
  );
}