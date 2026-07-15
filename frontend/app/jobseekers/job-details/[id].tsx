// app/jobseekers/job-details/[id].tsx
import InfoAlertModal from "@/components/modal/InfoAlertModal";
import { useApplyJob } from "@/hooks/useApplyJob";
import { useJobBookmark } from "@/hooks/useBookmarks";
import { useSkillMatch } from "@/hooks/useSkillMatch";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/common/UserAvatar";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KeyboardWrapper from "@/components/common/KeyboardWrapper";

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
    business_verification_status?: string;
    premium_plan?: string;
  };
}

const CATEGORY_FALLBACK_NAMES: Record<string, string> = {
  it: "IT & Software", design: "Design", business: "Business",
  construction: "Construction", finance: "Finance", healthcare: "Healthcare",
  education: "Education", sales: "Sales & Marketing", hospitality: "Hospitality",
  transport: "Transport", creative: "Creative", agriculture: "Agriculture",
  security: "Security & Law",
};

export default function JobDetailsScreen() {
  const { t } = useTranslation(["jobs", "common"]);
  const [showInfoAlert, setShowInfoAlert]   = useState(false);
  const [infoAlertTitle, setInfoAlertTitle] = useState("");
  const [infoAlertMessage, setInfoAlertMessage] = useState("");
  const { id } = useLocalSearchParams();
  const router  = useRouter();
  const [job, setJob]           = useState<Job | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter]       = useState("");

  const { getMatchForJob, hasSkills } = useSkillMatch();

  // Compute skill match — must be before any early return (Rules of Hooks)
  const skillMatch = useMemo(
    () => (job && hasSkills ? getMatchForJob(job) : null),
    [job, hasSkills, getMatchForJob],
  );

  const {
    applying, checkingRequirements, hasApplied,
    profile, checkRequirements, applyForJob,
  } = useApplyJob();

  const { isBookmarked, toggling, toggle: toggleBookmark } = useJobBookmark(id as string);

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
        .select(`*, employer_profiles(company_name, email, profile_image_url, business_verification_status, premium_plan)`)
        .eq("id", id).eq("status", "active").single();
      if (fetchError) throw fetchError;
      if (!data) { setError(t("jobs:details.notFoundTitle", { defaultValue: "Job not found" })); return; }
      setJob(data);
    } catch (err: any) {
      setError(err.message || t("jobs:details.loadError", { defaultValue: "Failed to load job details" }));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async () => {
    if (!id) return;
    const requirements = await checkRequirements(id as string);
    if (!requirements.hasProfile) {
      setInfoAlertTitle(t("jobs:details.profileNotFoundTitle", { defaultValue: "Profile Not Found" }));
      setInfoAlertMessage(t("jobs:details.profileNotFoundMessage", { defaultValue: "Please create your jobseeker profile first." }));
      setShowInfoAlert(true);
      return;
    }
    if (requirements.missingFields.length > 0) {
      const intro = t("jobs:details.missingFieldsIntro", { defaultValue: "Please complete the following before applying:" });
      const outro = t("jobs:details.missingFieldsOutro", { defaultValue: "Go to your Profile to complete it." });
      setInfoAlertTitle(t("jobs:details.profileIncompleteTitle", { defaultValue: "Profile Incomplete" }));
      setInfoAlertMessage(`${intro}\n\n• ${requirements.missingFields.join("\n• ")}\n\n${outro}`);
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
    return `${fmt(min)} – ${fmt(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return t("jobs:time.justNow");
    if (seconds < 3600) return t("jobs:time.minutesAgo", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("jobs:time.hoursAgo", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("jobs:time.daysAgo", { days: Math.floor(seconds / 86400) });
    return t("jobs:time.weeksAgo", { weeks: Math.floor(seconds / 604800) });
  };

  const getCategoryDisplay = (category: string) => {
    const fallback = CATEGORY_FALLBACK_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1);
    return t(`jobs:categories.${category}`, { defaultValue: fallback });
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#080A08]">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-3 text-sm">
          {t("jobs:details.loading", { defaultValue: "Loading job details…" })}
        </Text>
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#080A08] px-8">
        <View className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={30} color="#9CA3AF" />
        </View>
        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 text-center mb-1">
          {error || t("jobs:details.notFoundTitle", { defaultValue: "Job not found" })}
        </Text>
        <Text className="text-sm font-quicksandMedium text-gray-400 text-center mb-6">
          {t("jobs:details.notFoundSubtitle", { defaultValue: "This listing may have been removed or expired." })}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="bg-cyan-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-quicksandBold text-sm">
            {t("common:buttons.goBack", { defaultValue: "Go Back" })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const companyName = job.employer_profiles?.company_name || "Company";
  const salary      = formatSalary(job.salary_min, job.salary_max);
  const timeAgo     = getTimeAgo(job.created_at);
  const jobTypes    = job.job_type ? job.job_type.split(",").map((s) => s.trim()) : [];
  const categoryDisplay = getCategoryDisplay(job.category);
  const isEmployerVerified =
    job.employer_profiles?.business_verification_status === "approved" &&
    job.employer_profiles?.premium_plan !== "free" &&
    !!job.employer_profiles?.premium_plan;

  const SectionLabel = ({ title }: { title: string }) => (
    <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">

      {/* ── Header — plain white, no cyan band ─────────────────────────── */}
      <View className="pt-14 pb-4 px-4 bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#1f1f1f]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t("common:buttons.goBack", { defaultValue: "Go back" })}
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
          </TouchableOpacity>

          <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("jobs:details.headerTitle", { defaultValue: "Job Details" })}
          </Text>

          {/* Bookmark — neutral icon, no white overlay on cyan */}
          <TouchableOpacity
            onPress={toggleBookmark}
            disabled={toggling}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center"
            accessibilityRole="button"
            accessibilityState={{ selected: isBookmarked }}
            accessibilityLabel={
              isBookmarked
                ? t("jobs:details.unsaveJob", { defaultValue: "Remove from saved jobs" })
                : t("jobs:details.saveJob", { defaultValue: "Save job" })
            }
          >
            {toggling ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color={isBookmarked ? "#0E7490" : "#6B7280"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Company + title block ────────────────────────────────────── */}
        <View className="px-4 pt-5 pb-4">
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/(shared)/user/[id]",
              params: { id: job.employer_id, role: "employer" },
            })}
            activeOpacity={0.75}
            className="flex-row items-center mb-4"
            style={{ gap: 14 }}
          >
            <UserAvatar
              imageUrl={job.employer_profiles?.profile_image_url}
              name={companyName}
              size={56}
            />
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5" style={{ gap: 4 }}>
                <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400">
                  {companyName}
                </Text>
                {isEmployerVerified && (
                  <MaterialIcons name="verified" size={13} color="#0E7490" />
                )}
              </View>
              <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-1">
                {job.title}
              </Text>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                <Text className="text-sm font-quicksandMedium text-gray-400 dark:text-gray-500">
                  {job.location}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Applied / saved chips — small pills, no colored banners */}
          {(hasApplied || isBookmarked) && (
            <View className="flex-row flex-wrap mb-3" style={{ gap: 6 }}>
              {hasApplied && (
                <View className="flex-row items-center bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-[#2a2a2a] rounded-full px-3 py-1" style={{ gap: 4 }}>
                  <Ionicons name="checkmark-circle-outline" size={13} color="#0E7490" />
                  <Text className="font-quicksandBold text-xs text-gray-600 dark:text-gray-300">
                    {t("jobs:details.appliedBadge", { defaultValue: "Applied" })}
                  </Text>
                </View>
              )}
              {isBookmarked && (
                <View className="flex-row items-center bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-[#2a2a2a] rounded-full px-3 py-1" style={{ gap: 4 }}>
                  <Ionicons name="bookmark-outline" size={12} color="#0E7490" />
                  <Text className="font-quicksandBold text-xs text-gray-600 dark:text-gray-300">
                    {t("jobs:details.savedBadge", { defaultValue: "Saved" })}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Chips — all neutral, salary gets cyan text only */}
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            <View className="bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-[#2a2a2a] px-3 py-1.5 rounded-full">
              <Text className="text-cyan-700 dark:text-cyan-400 font-quicksandBold text-xs">
                {salary}
              </Text>
            </View>
            {jobTypes.map((type, i) => (
              <View key={i} className="bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-[#2a2a2a] px-3 py-1.5 rounded-full">
                <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs">
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── About the role ───────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
          <SectionLabel title={t("jobs:details.aboutRole", { defaultValue: "About the role" })} />
          <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 leading-6">
            {job.description}
          </Text>
        </View>

        {/* ── Experience ───────────────────────────────────────────────── */}
        {job.experience_level && (
          <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
            <SectionLabel title={t("jobs:details.experience", { defaultValue: "Experience required" })} />
            <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400">
              {job.experience_level === "No experience required"
                ? "Open to all — no prior experience needed."
                : job.experience_level === "0–1 years"
                  ? "Entry level — internship or short experience qualifies."
                  : job.experience_level}
            </Text>
          </View>
        )}

        {/* ── Skills ───────────────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
          <SectionLabel title={t("jobs:details.skillsRequired", { defaultValue: "Skills required" })} />
          {job.skills_required && job.skills_required.length > 0 ? (
            <View className="flex-row flex-wrap" style={{ gap: 6 }}>
              {job.skills_required.map((skill, i) => (
                <View
                  key={i}
                  className="bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] px-3 py-1.5 rounded-full"
                >
                  <Text className="font-quicksandMedium text-xs text-gray-600 dark:text-gray-300">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400">
              No specific skills required — training will be provided.
            </Text>
          )}
        </View>

        {/* ── Your Match ───────────────────────────────────────────────── */}
        {skillMatch && (
          <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
            <SectionLabel title={t("jobs:details.yourMatch", { defaultValue: "Your match" })} />

            {/* Score row */}
            <View className="flex-row items-center mb-4" style={{ gap: 12 }}>
              {/* Big percentage circle */}
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  borderWidth: 3,
                  borderColor:
                    skillMatch.label === "high"
                      ? "#10B981"
                      : skillMatch.label === "medium"
                        ? "#F59E0B"
                        : skillMatch.label === "low"
                          ? "#EF4444"
                          : "#D1D5DB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Quicksand_700Bold",
                    fontSize: 16,
                    color:
                      skillMatch.label === "high"
                        ? "#10B981"
                        : skillMatch.label === "medium"
                          ? "#F59E0B"
                          : skillMatch.label === "low"
                            ? "#EF4444"
                            : "#9CA3AF",
                  }}
                >
                  {skillMatch.score}%
                </Text>
              </View>

              <View className="flex-1">
                <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-200">
                  {skillMatch.label === "high"
                    ? t("jobs:details.matchLabels.high", { defaultValue: "Strong match" })
                    : skillMatch.label === "medium"
                      ? t("jobs:details.matchLabels.medium", { defaultValue: "Partial match" })
                      : skillMatch.label === "low"
                        ? t("jobs:details.matchLabels.low", { defaultValue: "Low match" })
                        : t("jobs:details.matchLabels.none", { defaultValue: "No match" })}
                </Text>
                <Text className="font-quicksandMedium text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-4">
                  {skillMatch.summary}
                </Text>
              </View>
            </View>

            {/* Matched skills */}
            {skillMatch.matchedSkills.length > 0 && (
              <View className="mb-3">
                <Text className="font-quicksandBold text-[11px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
                  {t("jobs:details.matchedSkills", { defaultValue: "Matched skills" })}
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                  {skillMatch.matchedSkills.map((skill, i) => (
                    <View
                      key={i}
                      className="flex-row items-center bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 px-3 py-1.5 rounded-full"
                      style={{ gap: 4 }}
                    >
                      <Ionicons name="checkmark-circle" size={11} color="#059669" />
                      <Text className="font-quicksandMedium text-xs text-emerald-700 dark:text-emerald-300">
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Missing skills */}
            {skillMatch.missingSkills.length > 0 && (
              <View>
                <Text className="font-quicksandBold text-[11px] text-red-500 dark:text-red-400 uppercase tracking-wide mb-2">
                  {t("jobs:details.missingSkills", { defaultValue: "Skills to develop" })}
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                  {skillMatch.missingSkills.map((skill, i) => (
                    <View
                      key={i}
                      className="flex-row items-center bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 px-3 py-1.5 rounded-full"
                      style={{ gap: 4 }}
                    >
                      <Ionicons name="close-circle" size={11} color="#EF4444" />
                      <Text className="font-quicksandMedium text-xs text-red-600 dark:text-red-300">
                        {skill}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Overview table ───────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl px-4 pt-4 pb-1 border border-gray-100 dark:border-[#1f1f1f]">
          <SectionLabel title={t("jobs:details.overview", { defaultValue: "Overview" })} />

          {[
            { label: t("jobs:details.overviewLabels.posted",   { defaultValue: "Posted" }),   value: timeAgo },
            { label: t("jobs:details.overviewLabels.category", { defaultValue: "Category" }), value: categoryDisplay },
            { label: t("jobs:details.overviewLabels.jobType",  { defaultValue: "Job type" }),  value: jobTypes.join(", ") },
            { label: t("jobs:details.overviewLabels.salary",   { defaultValue: "Salary" }),    value: salary },
            ...(job.experience_level
              ? [{ label: t("jobs:details.overviewLabels.experience", { defaultValue: "Experience" }), value: job.experience_level }]
              : []),
          ].map((row, i, arr) => (
            <View key={i}>
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-quicksandMedium text-sm text-gray-400 dark:text-gray-500">
                  {row.label}
                </Text>
                <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-200">
                  {row.value}
                </Text>
              </View>
              {i < arr.length - 1 && <View className="h-px bg-gray-100 dark:bg-[#1f1f1f]" />}
            </View>
          ))}
        </View>

        {/* ── About the company ────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
          <SectionLabel title={t("jobs:details.aboutCompany", { defaultValue: "About the company" })} />
          <View className="flex-row items-center" style={{ gap: 12 }}>
            {/* Neutral avatar container — no cyan background */}
            <View className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center flex-shrink-0">
              <Text className="font-quicksandBold text-base text-gray-500 dark:text-gray-400">
                {companyName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5" style={{ gap: 4 }}>
                <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-100">
                  {companyName}
                </Text>
                {isEmployerVerified && (
                  <MaterialIcons name="verified" size={13} color="#0E7490" />
                )}
              </View>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                <Text className="font-quicksandMedium text-xs text-gray-400">
                  {job.location}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Apply bar ────────────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#080A08] border-t border-gray-100 dark:border-[#1f1f1f] px-4 py-4">
        {hasApplied ? (
          // Applied state — neutral pill, no green banner
          <View className="flex-row items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl py-4" style={{ gap: 6 }}>
            <Ionicons name="checkmark-circle-outline" size={17} color="#0E7490" />
            <Text className="font-quicksandBold text-sm text-gray-600 dark:text-gray-300">
              {t("jobs:details.applicationSubmitted", { defaultValue: "Application submitted" })}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleApplyClick}
            disabled={checkingRequirements}
            activeOpacity={0.85}
            accessibilityRole="button"
            className="bg-cyan-700 rounded-2xl py-4 flex-row items-center justify-center"
            style={{ gap: 6 }}
          >
            {checkingRequirements ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text className="font-quicksandBold text-sm text-white">
                  {t("jobs:details.applyNow", { defaultValue: "Apply now" })}
                </Text>
                <MaterialIcons name="arrow-outward" size={16} color="white" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Apply modal ──────────────────────────────────────────────────── */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View className="bg-white dark:bg-[#0e0e0e] rounded-t-3xl px-5 pt-4 pb-8 max-h-[85%]">
            {/* Handle */}
            <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-[#2a2a2a] self-center mb-5" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="font-quicksandBold text-xl text-gray-800 dark:text-gray-100">
                {t("jobs:details.applyModalTitle", { defaultValue: "Apply for role" })}
              </Text>
              <TouchableOpacity
                onPress={() => setShowApplyModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center"
              >
                <Ionicons name="close" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <KeyboardWrapper>
              {/* Job summary — neutral icon, no cyan */}
              <View className="flex-row items-center bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-4 mb-4" style={{ gap: 12 }}>
                <View className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center flex-shrink-0">
                  <Text className="font-quicksandBold text-base text-gray-500 dark:text-gray-400">
                    {companyName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-100 leading-tight" numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text className="font-quicksandMedium text-xs text-gray-400 mt-0.5">
                    {companyName} · {salary}
                  </Text>
                </View>
              </View>

              {/* Applying as — neutral, no green banner */}
              {profile && (
                <View className="flex-row items-center bg-gray-50 dark:bg-[#141414] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl px-4 py-3 mb-4" style={{ gap: 8 }}>
                  <Ionicons name="person-outline" size={15} color="#6B7280" />
                  <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 flex-1">
                    {t("jobs:details.applyingAs", { defaultValue: "Applying as" })}{" "}
                    <Text className="font-quicksandBold text-gray-700 dark:text-gray-300">
                      {profile.full_name}
                    </Text>
                    {(profile as any).username ? (
                      <Text className="font-quicksandSemibold text-cyan-600 dark:text-cyan-400">
                        {" "}@{(profile as any).username}
                      </Text>
                    ) : null}
                  </Text>
                </View>
              )}

              {/* Cover letter */}
              <View className="mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-quicksandBold text-sm text-gray-800 dark:text-gray-100">
                    {t("jobs:details.coverLetter", { defaultValue: "Cover letter" })}
                  </Text>
                  <Text className="font-quicksandMedium text-xs text-gray-400">
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
                  className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 font-quicksandMedium text-sm text-gray-800 dark:text-gray-200 min-h-[140px]"
                />
                <Text className="font-quicksandMedium text-[11px] text-gray-300 mt-1.5 text-right">
                  {t("jobs:details.charsCount", { count: coverLetter.length, defaultValue: `${coverLetter.length} chars` })}
                </Text>
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmitApplication}
                disabled={applying}
                activeOpacity={0.85}
                accessibilityRole="button"
                className="bg-cyan-700 rounded-2xl py-4 flex-row items-center justify-center mt-3 mb-3"
                style={{ gap: 6 }}
              >
                {applying ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text className="font-quicksandBold text-sm text-white">
                      {t("jobs:details.submitApplication", { defaultValue: "Submit application" })}
                    </Text>
                    <Ionicons name="send" size={14} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <Text className="text-center font-quicksandMedium text-xs text-gray-400 mb-2">
                {t("jobs:details.sentDirectly", {
                  company: companyName,
                  defaultValue: `Your application will be sent directly to ${companyName}`,
                })}
              </Text>
            </KeyboardWrapper>
          </View>
        </View>
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