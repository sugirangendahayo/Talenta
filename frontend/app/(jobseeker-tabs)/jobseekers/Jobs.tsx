// app/(jobseeker-tabs)/jobseekers/Jobs.tsx
import JobsHeader from "@/components/jobseeker/JobsHeader";
import JobsList from "@/components/jobseeker/JobsList";
import SearchAndSort from "@/components/jobseeker/SearchAndSort";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useState, useRef } from "react";
import { View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
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
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);

  const categories: Category[] = [
    { id: "all", name: "All" },
    ...Object.entries(categoryNames).map(([id, name]) => ({ id, name })),
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
        <JobsHeader />
        <SearchAndSort
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          categories={categories}
        />
        <JobsList
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onScroll={handleScroll}
        />
      </View>
    </SafeAreaView>
  );
}
