// app/(employer-tabs)/employers/Jobs.tsx
import EmployerJobFilters from "@/components/employer/EmployerJobFilters";
import EmployerJobsHeader from "@/components/employer/EmployerJobsHeader";
import EmployerJobsList from "@/components/employer/EmployerJobsList";
import PostJobSheet from "@/components/employer/PostJobSheet";
import { EmployerJobsSkeleton } from "@/components/skeletons/EmployerJobsSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";
import { EmployerProfile } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface Category {
  id: string;
  name: string;
}

// Hoisted outside the component so it isn't rebuilt per render.
// Mirrors the same map in job-details/[id].tsx — worth centralising
// in a shared constants file once both employer and jobseeker screens
// are stable.
const CATEGORY_NAMES: Record<string, string> = {
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

export default function Jobs() {
  const { user, profile } = useAuth();
  const { t } = useTranslation("jobs");
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const hasLoadedOnceRef = useRef(false);

  const employerProfile = profile as EmployerProfile | null;

  // ── Gate: profile must be complete AND business verification approved ──────
  const handlePostJobPress = () => {
    if (!employerProfile?.profile_completed) {
      Alert.alert(
        "Profile Incomplete",
        "You need to complete your company profile before posting a job.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Complete Profile",
            onPress: () => router.push("/employer/complete-profile"),
          },
        ]
      );
      return;
    }

    const verificationStatus = employerProfile?.business_verification_status;
    if (verificationStatus !== "approved") {
      const isPending = verificationStatus === "pending_review";
      Alert.alert(
        isPending ? "Verification Pending" : "Business Verification Required",
        isPending
          ? "Your documents are currently under review. You'll be able to post jobs once your business is verified."
          : "You need to submit and get your business registration approved before posting jobs.",
        [
          { text: "Later", style: "cancel" },
          {
            text: isPending ? "View Status" : "Submit Docs",
            onPress: () => router.push("/employer/business-verification"),
          },
        ]
      );
      return;
    }

    setEditingJob(null);
    setSheetVisible(true);
  };

  const handleEditDraft = (job: any) => {
    setEditingJob(job);
    setSheetVisible(true);
  };

  const handleSheetClose = () => {
    setSheetVisible(false);
    setEditingJob(null);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) {
      setError(t("errors.loginRequired"));
      setLoading(false);
      return;
    }

    // Offline: don't attempt a request that would just fail/hang. Keep
    // whatever jobs are already loaded visible instead of clearing them.
    if (!isOnline) {
      setLoading(false);
      if (!hasLoadedOnceRef.current) {
        setError(t("errors.offline", { defaultValue: "You're offline. Connect to the internet to load your jobs." }));
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      setJobs(data || []);
      hasLoadedOnceRef.current = true;
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || t("errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Smart auto-refresh: when connectivity returns, silently refresh this
  // screen's data if it's active.
  useRefetchOnReconnect(() => fetchJobs());

  // Manual pull-to-refresh — shows a toast if attempted while offline.
  const handleRefresh = () => {
    if (!requireOnline("You're offline. Reconnect to refresh your jobs.")) return;
    fetchJobs();
  };

  const uniqueCategories = [...new Set(jobs.map((job) => job.category))].sort();
  const categories: Category[] = [
    { id: "all", name: t("categories.all") },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      name:
        CATEGORY_NAMES[cat] ||
        cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? "down" : "up";
    if (scrollDirection === "down" && currentScrollY > 50) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  // ─── Skeleton loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]" edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <EmployerJobsSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
        <EmployerJobsHeader onPostJob={handlePostJobPress} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-600 font-quicksandBold text-lg text-center">
            {error}
          </Text>
          <Text className="mt-2 text-gray-500 font-quicksandMedium text-center">
            {t("errors.tryAgainOrContact")}
          </Text>
        </View>
        <PostJobSheet
          visible={sheetVisible}
          onClose={handleSheetClose}
          onSuccess={fetchJobs}
          editingJob={editingJob}
        />
      </SafeAreaView>
    );
  }

  // ─── Loaded state ──────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <EmployerJobsHeader onPostJob={handlePostJobPress} />

      <EmployerJobFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <EmployerJobsList
        jobs={jobs}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        statusFilter={selectedStatus}
        onRefresh={handleRefresh}
        onScroll={handleScroll}
        onEditDraft={handleEditDraft}
      />

      <PostJobSheet
        visible={sheetVisible}
        onClose={handleSheetClose}
        onSuccess={fetchJobs}
        editingJob={editingJob}
      />
    </SafeAreaView>
  );
}