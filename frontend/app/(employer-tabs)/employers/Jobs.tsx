import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import EmployerJobsHeader from "@/components/employer/EmployerJobsHeader";
import EmployerJobsList from "@/components/employer/EmployerJobsList";
import EmployerJobFilters from "@/components/employer/EmployerJobFilters";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";


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
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
    const { setIsVisible } = useTabBarVisibility();
    const lastScrollY = useRef(0);

  // Fetch jobs from Supabase
  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) {
      setError("You must be logged in to view jobs!");
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
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  // Compute unique categories dynamically from jobs data
  const uniqueCategories = [...new Set(jobs.map((job) => job.category))].sort();
  const categories: Category[] = [
    { id: "all", name: "All Categories" },
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
  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmployerJobsHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="mt-4 text-gray-600 font-quicksandMedium">
            Loading your jobs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmployerJobsHeader />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-600 font-quicksandBold text-lg text-center">
            {error}
          </Text>
          <Text className="mt-2 text-gray-500 font-quicksandMedium text-center">
            Please try again later or contact support
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <EmployerJobsHeader />
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
    </SafeAreaView>
  );
}
