// app/(employer-tabs)/employers/Jobs.tsx
import EmployerJobFilters from "@/components/employer/EmployerJobFilters";
import EmployerJobsHeader from "@/components/employer/EmployerJobsHeader";
import EmployerJobsList from "@/components/employer/EmployerJobsList";
import PostJobSheet from "@/components/employer/PostJobSheet";
import {
  EmployerJobsSkeleton,
} from "@/components/skeletons/EmployerJobsSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
}

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

export default function Jobs() {
  const { user } = useAuth();
  const { t } = useTranslation("jobs");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) {
      setError(t("errors.loginRequired"));
      setLoading(false);
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
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || t("errors.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  const uniqueCategories = [...new Set(jobs.map((job) => job.category))].sort();
  const categories: Category[] = [
    { id: "all", name: t("categories.all") },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      name: categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? "down" : "up";

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
        <EmployerJobsHeader onPostJob={() => setSheetVisible(true)} />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-600 font-quicksandBold text-lg text-center">
            {error}
          </Text>
          <Text className="mt-2 text-gray-500 dark:text-gray-400 font-quicksandMedium text-center">
            {t("errors.tryAgainOrContact")}
          </Text>
        </View>
        <PostJobSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          onSuccess={fetchJobs}
        />
      </SafeAreaView>
    );
  }

  // ─── Loaded state ───────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <EmployerJobsHeader onPostJob={() => setSheetVisible(true)} />

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
        onRefresh={fetchJobs}
        onScroll={handleScroll}
      />

      {/* Bottom sheet — rendered at root so it overlays the full screen */}
      <PostJobSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onSuccess={fetchJobs}
      />
    </SafeAreaView>
  );
}