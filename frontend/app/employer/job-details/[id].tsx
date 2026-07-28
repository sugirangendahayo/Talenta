// app/employer/job-details/[id].tsx
import JobDetailsSkeleton from "@/components/skeletons/JobDetailsSkeleton";
import { supabase } from "@/lib/supabase";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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

const STATUS_META: Record<
  string,
  { label: string; badge: string; text: string }
> = {
  active: {
    label: "Active",
    badge: "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30",
    text:  "text-emerald-700 dark:text-emerald-400",
  },
  paused: {
    label: "Paused",
    badge: "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30",
    text:  "text-amber-700 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    badge: "bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30",
    text:  "text-red-600 dark:text-red-400",
  },
  draft: {
    label: "Draft",
    badge: "bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30",
    text:  "text-blue-700 dark:text-blue-400",
  },
  closed: {
    label: "Closed",
    badge: "bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a]",
    text:  "text-gray-500 dark:text-gray-400",
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

  useEffect(() => { fetchJobDetails(); }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("jobs").select("*").eq("id", id).single();
      if (fetchError) throw fetchError;
      if (!data) { setError("Job not found"); return; }
      setJob(data);
    } catch (err: any) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // ── Action handlers (logic untouched) ────────────────────────────────────

  const handlePauseJob = async () => {
    if (!job) return;
    Alert.alert("Pause Job", "This will temporarily hide the job from jobseekers. You can reactivate it anytime.", [
      { text: "Cancel", style: "cancel" },
      { text: "Pause", style: "default", onPress: async () => {
        try {
          setActionLoading(true);
          const { error } = await supabase.rpc("pause_job", { job_id: job.id });
          if (error) throw error;
          toast.success("Job paused successfully");
          fetchJobDetails();
        } catch (error: any) {
          toast.error(error.message || "Failed to pause job");
        } finally { setActionLoading(false); }
      }},
    ]);
  };

  const handleReactivateJob = async () => {
    if (!job) return;
    try {
      setActionLoading(true);
      const { error } = await supabase.rpc("reactivate_job", { job_id: job.id });
      if (error) throw error;
      toast.success("Job reactivated successfully");
      fetchJobDetails();
    } catch (error: any) {
      toast.error(error.message || "Failed to reactivate job");
    } finally { setActionLoading(false); }
  };

  const handleCloseJob = async () => {
    if (!job) return;
    Alert.alert("Close Job", "Are you sure you want to close this job? This action will permanently hide it from jobseekers.", [
      { text: "Cancel", style: "cancel" },
      { text: "Close Job", style: "destructive", onPress: async () => {
        try {
          setActionLoading(true);
          const { error } = await supabase.rpc("close_job", { job_id: job.id });
          if (error) throw error;
          toast.success("Job closed successfully");
          fetchJobDetails();
        } catch (error: any) {
          toast.error(error.message || "Failed to close job");
        } finally { setActionLoading(false); }
      }},
    ]);
  };

  const handleRenewJob = async () => {
    if (!job) return;
    Alert.alert("Renew Job", "This will extend the job expiry by 30 days and make it active again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Renew", style: "default", onPress: async () => {
        try {
          setActionLoading(true);
          const newExpiryDate = new Date();
          newExpiryDate.setDate(newExpiryDate.getDate() + 30);
          const expiryString = newExpiryDate.toISOString().split("T")[0];
          const { error } = await supabase.rpc("renew_job", { job_id: job.id, new_expiry_date: expiryString });
          if (error) throw error;
          toast.success("Job renewed for 30 days");
          fetchJobDetails();
        } catch (error: any) {
          toast.error(error.message || "Failed to renew job");
        } finally { setActionLoading(false); }
      }},
    ]);
  };

  const handleViewApplicants = () => {
    router.push({ pathname: "/(employer-tabs)/employers/Applicants", params: { jobId: job?.id } });
  };

  // ── Formatters ────────────────────────────────────────────────────────────

  const formatSalary = (min: number, max: number) => {
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
    return `${fmt(min)} – ${fmt(max)}`;
  };

  const formatDate = (dateString: string) => {
    const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const ms = new Date(expiresAt).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
    return Math.ceil(ms / 86_400_000);
  };

  const getCategoryDisplay = (category: string) => {
    const names: Record<string, string> = {
      it: "IT & Software", design: "Design", business: "Business",
      construction: "Construction", finance: "Finance", healthcare: "Healthcare",
      education: "Education", sales: "Sales & Marketing", hospitality: "Hospitality",
      transport: "Transport", creative: "Creative", agriculture: "Agriculture",
      security: "Security & Law",
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !job) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-[#080A08] px-8">
        <View className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mb-4">
          <Ionicons name="alert-circle-outline" size={30} color="#9CA3AF" />
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
          <Text className="text-white font-quicksandBold text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const meta            = STATUS_META[job.status] ?? DEFAULT_META;
  const salary          = formatSalary(job.salary_min, job.salary_max);
  const timeAgo         = formatDate(job.created_at);
  const jobTypes        = job.job_type ? job.job_type.split(",").map((s) => s.trim()) : [];
  const categoryDisplay = getCategoryDisplay(job.category);
  const daysLeft        = getDaysUntilExpiry(job.expires_at);

  const overviewRows = [
    { label: "Posted",   value: timeAgo },
    {
      label: "Expires",
      value: daysLeft > 0 ? `In ${daysLeft} days` : daysLeft === 0 ? "Today" : "Expired",
      warn: daysLeft < 7,
    },
    { label: "Category",   value: categoryDisplay },
    { label: "Type",       value: jobTypes.join(", ") },
    { label: "Salary",     value: salary },
    ...(job.experience_level ? [{ label: "Experience", value: job.experience_level }] : []),
  ];

  // ── Section label (plain, no icon squircle) ───────────────────────────────

  const SectionLabel = ({ title }: { title: string }) => (
    <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── Header — plain white, no cyan band ─────────────────────── */}
      <View className="pt-14 pb-4 px-4 bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#1f1f1f]">
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center flex-shrink-0"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 flex-1" numberOfLines={1}>
            Job Details
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Title block ─────────────────────────────────────────────── */}
        <View className="px-4 pt-5 pb-4">
          <View className="flex-row items-start justify-between mb-2" style={{ gap: 10 }}>
            <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100 flex-1">
              {job.title}
            </Text>
            <View className={`px-2.5 py-1 rounded-full flex-shrink-0 ${meta.badge}`}>
              <Text className={`text-[11px] font-quicksandBold ${meta.text}`}>
                {meta.label}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4" style={{ gap: 4 }}>
            <Ionicons name="location-outline" size={13} color="#9CA3AF" />
            <Text className="text-sm font-quicksandMedium text-gray-400 dark:text-gray-500">
              {job.location}
            </Text>
          </View>

          {/* Chips */}
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

        {/* ── Actions card ─────────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
          <TouchableOpacity
            onPress={handleViewApplicants}
            activeOpacity={0.85}
            className="bg-cyan-700 rounded-xl py-3.5 flex-row items-center justify-center mb-3"
            style={{ gap: 6 }}
          >
            <Ionicons name="people-outline" size={16} color="white" />
            <Text className="text-white font-quicksandBold text-sm">
              View Applicants
            </Text>
          </TouchableOpacity>

          {/* Secondary actions — text links, no colored containers */}
          <View className="flex-row flex-wrap" style={{ gap: 16 }}>
            {job.status === "active" && (
              <TouchableOpacity
                onPress={handlePauseJob}
                disabled={actionLoading}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500">
                  Pause listing
                </Text>
              </TouchableOpacity>
            )}
            {job.status === "paused" && (
              <TouchableOpacity
                onPress={handleReactivateJob}
                disabled={actionLoading}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500">
                  Reactivate
                </Text>
              </TouchableOpacity>
            )}
            {(job.status === "expired" || job.status === "paused") && (
              <TouchableOpacity
                onPress={handleRenewJob}
                disabled={actionLoading}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500">
                  Renew 30 days
                </Text>
              </TouchableOpacity>
            )}
            {job.status === "draft" && (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500">
                  Edit draft
                </Text>
              </TouchableOpacity>
            )}
            {job.status !== "closed" && (
              <TouchableOpacity
                onPress={handleCloseJob}
                disabled={actionLoading}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-quicksandBold text-red-400">
                  Close listing
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── About the role ───────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
          <SectionLabel title="About the role" />
          <Text className="font-quicksandMedium text-sm text-gray-500 dark:text-gray-400 leading-6">
            {job.description}
          </Text>
        </View>

        {/* ── Experience ───────────────────────────────────────────────── */}
        {job.experience_level && (
          <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]">
            <SectionLabel title="Experience required" />
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
          <SectionLabel title="Skills required" />
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

        {/* ── Overview table ───────────────────────────────────────────── */}
        <View className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl px-4 pt-4 pb-1 border border-gray-100 dark:border-[#1f1f1f]">
          <SectionLabel title="Overview" />
          {overviewRows.map((row, i, arr) => (
            <View key={i}>
              <View className="flex-row items-center justify-between py-3">
                <Text className="font-quicksandMedium text-sm text-gray-400 dark:text-gray-500">
                  {row.label}
                </Text>
                <Text className={`font-quicksandBold text-sm ${
                  "warn" in row && row.warn
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-800 dark:text-gray-200"
                }`}>
                  {row.value}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <View className="h-px bg-gray-100 dark:bg-[#1f1f1f]" />
              )}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}