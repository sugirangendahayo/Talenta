// app/(jobseeker-tabs)/jobseekers/Jobs.tsx
import JobsHeader from "@/components/jobseeker/JobsHeader";
import JobsList from "@/components/jobseeker/JobsList";
import SearchAndSort from "@/components/jobseeker/SearchAndSort";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useState, useRef } from "react";
import { View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
}

export default function Jobs() {
  const { t } = useTranslation("categories");
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);

  const categories: Category[] = [
    { id: "all", name: t("all") },
    { id: "it", name: t("categories.it") },
    { id: "design", name: t("categories.design") },
    { id: "business", name: t("categories.business") },
    { id: "construction", name: t("categories.construction") },
    { id: "finance", name: t("categories.finance") },
    { id: "healthcare", name: t("categories.healthcare") },
    { id: "education", name: t("categories.education") },
    { id: "sales", name: t("categories.sales") },
    { id: "hospitality", name: t("categories.hospitality") },
    { id: "transport", name: t("categories.transport") },
    { id: "creative", name: t("categories.creative") },
    { id: "agriculture", name: t("categories.agriculture") },
    { id: "security", name: t("categories.security") },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ jobType: string; experienceLevel: string }>({
    jobType: "all",
    experienceLevel: "all",
  });

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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <View className="flex-1">
        <JobsHeader />
        <SearchAndSort
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <JobsList
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          filters={filters}
          onScroll={handleScroll}
        />
      </View>
    </SafeAreaView>
  );
}
