import HomeHeader from "@/components/jobseeker/HomeHeader";
import HomeJobs from "@/components/jobseeker/HomeJobs";
import SearchAndSort from "@/components/jobseeker/SearchAndSort";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import jsonData from "@/data/jobs.json";
import { JobsData } from "@/types/job.types";
import { useState, useRef } from "react";
import { View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
}

// Mapping for pretty display names
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

export default function Home() {
  const data = jsonData as JobsData;
  const jobs = data.jobs;
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);

  const uniqueCategories = [...new Set(jobs.map((job) => job.category))].sort();
  const categories: Category[] = [
    { id: "all", name: "All" },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      name: categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <HomeHeader />
        <SearchAndSort
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          categories={categories}
        />
        <HomeJobs
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onScroll={handleScroll}
        />
      </View>
    </SafeAreaView>
  );
}
