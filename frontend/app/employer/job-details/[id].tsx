// app/employer/job-details/[id].tsx
import { supabase } from "@/lib/supabase";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

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
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// Single source of truth for status — matches EmployerJobsList exactly so
// a job looks the same whether you're viewing the list or its detail screen.
const STATUS_META: Record<
  string,
  { label: string; accentHex: string; badgeBg: string; badgeText: string }
> = {
  active: {
    label: "Active",
    accentHex: "#059669",
    badgeBg: "bg-emerald-50 dark:bg-emerald-900/20",
    badgeText: "text-emerald-700 dark:text-emerald-400",
  },
  paused: {
    label: "Paused",
    accentHex: "#D97706",
    badgeBg: "bg-amber-50 dark:bg-amber-900/20",
    badgeText: "text-amber-700 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    accentHex: "#DC2626",
    badgeBg: "bg-red-50 dark:bg-red-900/20",
    badgeText: "text-red-700 dark:text-red-400",
  },
  draft: {
    label: "Draft",
    accentHex: "#2563EB",
    badgeBg: "bg-blue-50 dark:bg-blue-900/20",
    badgeText: "text-blue-700 dark:text-blue-400",
  },
  closed: {
    label: "Closed",
    accentHex: "#6B7280",
    badgeBg: "bg-gray-100 dark:bg-[#1e1e1e]",
    badgeText: "text-gray-600 dark:text-gray-400",
  },
};
const DEFAULT_META = STATUS_META.closed;

export default function EmployerJobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation("jobs");
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
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

  // ── Action handlers (logic untouched) ────────────────────────────────────

  const handlePauseJob = async () => {
    if (!job) return;
    Alert.alert(
      "Pause Job",
      "This will temporarily hide the job from jobseekers. You can reactivate it anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pause",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const { error } = await supabase.rpc("pause_job", {
                job_id: job.id,
              });
              if (error) throw error;
              toast.success("Job paused successfully");
              fetchJobDetails();
            } catch (error: any) {
              toast.error(error.message || "Failed to pause job");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReactivateJob = async () => {
    if (!job) return;
    try {
      setActionLoading(true);
      const { error } = await supabase.rpc("reactivate_job", {
        job_id: job.id,
      });
      if (error) throw error;
      toast.success("Job reactivated successfully");
      fetchJobDetails();
    } catch (error: any) {
      toast.error(error.message || "Failed to reactivate job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseJob = async () => {
    if (!job) return;
    Alert.alert(
      "Close Job",
      "Are you sure you want to close this job? This action will permanently hide it from jobseekers.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Job",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const { error } = await supabase.rpc("close_job", {
                job_id: job.id,
              });
              if (error) throw error;
              toast.success("Job closed successfully");
              fetchJobDetails();
            } catch (error: any) {
              toast.error(error.message || "Failed to close job");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRenewJob = async () => {
    if (!job) return;
    Alert.alert(
      "Renew Job",
      "This will extend the job expiry by 30 days and make it active again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Renew",
          style: "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const newExpiryDate = new Date();
              newExpiryDate.setDate(newExpiryDate.getDate() + 30);
              const expiryString = newExpiryDate.toISOString().split("T")[0];
              const { error } = await supabase.rpc("renew_job", {
                job_id: job.id,
                new_expiry_date: expiryString,
              });
              if (error) throw error;
              toast.success("Job renewed for 30 days");
              fetchJobDetails();
            } catch (error: any) {
              toast.error(error.message || "Failed to renew job");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleViewApplicants = () => {
    router.push({
      pathname: "/(employer-tabs)/employers/Applicants",
      params: { jobId: job?.id },
    });
  };

  // ── Formatters ────────────────────────────────────────────────────────────

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) =>
      n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    return `${fmt(min)} - ${fmt(max)}`;
  };

  const formatDate = (dateString: string) => {
    const diffDays = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 86_400_000,
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const ms =
      new Date(expiresAt).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0);
    return Math.ceil(ms / 86_400_000);
  };

  const getCategoryDisplay = (category: string) => {
    const names: Record<string, string> = {
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
      names[category] || category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#080A08]">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-3 text-sm">
          Loading job details…
        </Text>
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#080A08] px-8">
        <View className="w-16 h-16 rounded-2xl bg-red-50 items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 text-center mb-1">
          {error || "Job not found"}
        </Text>
        <Text className="text-sm font-quicksandMedium text-gray-400 text-center mb-6">
          This listing may have been removed or is unavailable.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          className="bg-cyan-700 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-quicksandBold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const meta = STATUS_META[job.status] ?? DEFAULT_META;
  const salary = formatSalary(job.salary_min, job.salary_max);
  const timeAgo = formatDate(job.created_at);
  const jobTypes = job.job_type
    ? job.job_type.split(",").map((s) => s.trim())
    : [];
  const categoryDisplay = getCategoryDisplay(job.category);
  const daysLeft = getDaysUntilExpiry(job.expires_at);

  // ── Reusable section header (icon squircle + title) ───────────────────────
  // Matches the exact pattern used in the jobseeker job-details screen:
  // w-7 h-7 rounded-lg bg-cyan-50, cyan icon, quicksandBold title.
  const SectionHeader = ({
    icon,
    title,
  }: {
    icon: React.ReactNode;
    title: string;
  }) => (
    <View className="flex-row items-center gap-2 mb-3">
      <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
        {icon}
      </View>
      <Text className="font-quicksandBold text-[15px] text-gray-900 dark:text-gray-100">
        {title}
      </Text>
    </View>
  );

  // ── Overview rows (replaces cyan-tinted table) ────────────────────────────
  const overviewRows = [
    { label: "Posted", value: timeAgo },
    {
      label: "Expires",
      value:
        daysLeft > 0
          ? `In ${daysLeft} days`
          : daysLeft === 0
            ? "Today"
            : "Expired",
      valueClass:
        daysLeft < 7
          ? "text-red-600 dark:text-red-400"
          : daysLeft < 30
            ? "text-amber-600 dark:text-amber-400"
            : undefined,
    },
    { label: "Category", value: categoryDisplay },
    { label: "Type", value: jobTypes.join(", ") },
    { label: "Salary", value: salary },
    ...(job.experience_level
      ? [{ label: "Experience", value: job.experience_level }]
      : []),
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── Hero header ────────────────────────────────────────────────── */}
      <View className="pt-16 pb-8 px-6 rounded-b-[40px] bg-cyan-700 dark:bg-cyan-900">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-lg font-quicksandBold text-white">
            Job Details
          </Text>
          {/* Placeholder to balance the back button — future: share/more menu */}
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── Job title block ─────────────────────────────────────────── */}
        <View className="px-4 pt-6 mb-2">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-1">
                {job.title}
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-sharp" size={14} color="#0E7490" />
                <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-sm">
                  {job.location}
                </Text>
              </View>
            </View>

            {/* Status badge — dot + label, same as cards */}
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${meta.badgeBg}`}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: meta.accentHex,
                }}
              />
              <Text className={`text-xs font-quicksandBold ${meta.badgeText}`}>
                {meta.label}
              </Text>
            </View>
          </View>

          {/* Quick info chips */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            <View className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 px-4 py-2.5 rounded-2xl">
              <Text className="text-cyan-700 dark:text-cyan-400 font-quicksandBold text-sm">
                {salary}
              </Text>
            </View>
            {jobTypes.map((type, i) => (
              <View
                key={i}
                className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2a2a2a] px-4 py-2.5 rounded-2xl"
              >
                <Text className="text-gray-600 dark:text-gray-300 font-quicksandMedium text-sm">
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Manage actions ──────────────────────────────────────────────
            One primary CTA (View Applicants) at full width, then status-
            specific secondary actions as plain ghost pills in a row below.
            No colored backgrounds — status reads from the badge above, not
            from repeating it across every button. */}
        <View
          className="mx-4 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl p-4 border border-gray-100 dark:border-[#2a2a2a]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {/* Primary: View Applicants */}
          <TouchableOpacity
            onPress={handleViewApplicants}
            activeOpacity={0.85}
            className="bg-cyan-700 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 mb-3"
          >
            <Ionicons name="people-outline" size={18} color="white" />
            <Text className="text-white font-quicksandBold text-sm">
              View Applicants
            </Text>
          </TouchableOpacity>

          {/* Secondary: status-specific actions as text links in a row */}
          <View className="flex-row items-center flex-wrap gap-x-4 gap-y-2 px-1">
            {job.status === "active" && (
              <TouchableOpacity
                onPress={handlePauseJob}
                disabled={actionLoading}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400">
                  Pause listing
                </Text>
              </TouchableOpacity>
            )}

            {job.status === "paused" && (
              <TouchableOpacity
                onPress={handleReactivateJob}
                disabled={actionLoading}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400">
                  Reactivate
                </Text>
              </TouchableOpacity>
            )}

            {(job.status === "expired" || job.status === "paused") && (
              <TouchableOpacity
                onPress={handleRenewJob}
                disabled={actionLoading}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400">
                  Renew 30 days
                </Text>
              </TouchableOpacity>
            )}

            {job.status === "draft" && (
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400">
                  Edit draft
                </Text>
              </TouchableOpacity>
            )}

            {job.status !== "closed" && (
              <TouchableOpacity
                onPress={handleCloseJob}
                disabled={actionLoading}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text className="text-xs font-quicksandBold text-red-400">
                  Close listing
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Description ─────────────────────────────────────────────── */}
        <View className="mx-4 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl overflow-hidden border border-gray-100 dark:border-[#2a2a2a]">
          <View className="px-4 pt-4 pb-3">
            <SectionHeader
              title="About the role"
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={15}
                  color="#0E7490"
                />
              }
            />
            <Text className="font-quicksandMedium text-[13.5px] text-gray-500 dark:text-gray-400 leading-[22px]">
              {job.description}
            </Text>
          </View>
          <View className="h-[3px] bg-cyan-50 dark:bg-cyan-900/20" />
        </View>

        {/* ── Experience ──────────────────────────────────────────────── */}
        {job.experience_level && (
          <View className="mx-4 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl px-4 py-4 border border-gray-100 dark:border-[#2a2a2a]">
            <SectionHeader
              title="Experience required"
              icon={
                <Ionicons name="briefcase-outline" size={15} color="#0E7490" />
              }
            />
            <Text className="font-quicksandMedium text-[13.5px] text-gray-500 dark:text-gray-400 ml-9">
              {job.experience_level}
            </Text>
          </View>
        )}

        {/* ── Skills ──────────────────────────────────────────────────── */}
        {job.skills_required && job.skills_required.length > 0 && (
          <View className="mx-4 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl px-4 py-4 border border-gray-100 dark:border-[#2a2a2a]">
            <SectionHeader
              title="Skills required"
              icon={<Octicons name="checklist" size={15} color="#0E7490" />}
            />
            <View className="flex-row flex-wrap gap-2">
              {job.skills_required.map((skill, i) => (
                <View
                  key={i}
                  className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] px-3 py-1.5 rounded-full"
                >
                  <Text className="font-quicksandMedium text-xs text-gray-700 dark:text-gray-300">
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Overview table ───────────────────────────────────────────
            Plain white card with gray-100 hairline dividers — same as
            the jobseeker job-details screen. The cyan-tinted table that
            was here before reads as a different design system. */}
        <View className="mx-4 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl px-4 pt-4 pb-1 border border-gray-100 dark:border-[#2a2a2a]">
          <SectionHeader
            title="Overview"
            icon={
              <Ionicons
                name="information-circle-outline"
                size={15}
                color="#0E7490"
              />
            }
          />
          {overviewRows.map((row, i, arr) => (
            <View key={i}>
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-quicksandMedium text-[13px] text-gray-400 dark:text-gray-500">
                  {row.label}
                </Text>
                <Text
                  className={`font-quicksandBold text-[13px] ${
                    row.valueClass ?? "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {row.value}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <View className="h-px bg-gray-100 dark:bg-[#222]" />
              )}
            </View>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
