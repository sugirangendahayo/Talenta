// app/(jobseeker-tabs)/jobseekers/Home.tsx
import HomeHeader from "@/components/jobseeker/HomeHeader";
import HomeJobs from "@/components/jobseeker/HomeJobs";
import SearchAndSort from "@/components/jobseeker/SearchAndSort";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const { setIsVisible } = useTabBarVisibility();
  const { t } = useTranslation("categories");
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? "down" : "up";

    if (scrollDirection === "down" && currentScrollY > 0) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 ">
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
