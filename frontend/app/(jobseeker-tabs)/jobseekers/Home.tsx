// app/(jobseeker-tabs)/jobseekers/Home.tsx
import HeroBanner from "@/components/jobseeker/HeroBanner";
import HomeHeader from "@/components/jobseeker/HomeHeader";
import HomeJobs from "@/components/jobseeker/HomeJobs";
import HomeStats from "@/components/jobseeker/HomeStats";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
}

export default function Home() {
  const { setIsVisible } = useTabBarVisibility();
  const { t } = useTranslation(["categories", "home", "common"]);
  const lastScrollY = useRef(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories: Category[] = [
    { id: "all", name: t("categories:all", { defaultValue: "All" }) },
    { id: "it", name: t("categories:categories.it", { defaultValue: "IT" }) },
    { id: "design", name: t("categories:categories.design", { defaultValue: "Design" }) },
    { id: "business", name: t("categories:categories.business", { defaultValue: "Business" }) },
    { id: "construction", name: t("categories:categories.construction", { defaultValue: "Construction" }) },
    { id: "finance", name: t("categories:categories.finance", { defaultValue: "Finance" }) },
    { id: "healthcare", name: t("categories:categories.healthcare", { defaultValue: "Healthcare" }) },
    { id: "education", name: t("categories:categories.education", { defaultValue: "Education" }) },
    { id: "sales", name: t("categories:categories.sales", { defaultValue: "Sales" }) },
    { id: "hospitality", name: t("categories:categories.hospitality", { defaultValue: "Hospitality" }) },
    { id: "transport", name: t("categories:categories.transport", { defaultValue: "Transport" }) },
    { id: "creative", name: t("categories:categories.creative", { defaultValue: "Creative" }) },
    { id: "agriculture", name: t("categories:categories.agriculture", { defaultValue: "Agriculture" }) },
    { id: "security", name: t("categories:categories.security", { defaultValue: "Security" }) },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollingDown = currentScrollY > lastScrollY.current;
    if (scrollingDown && currentScrollY > 0) {
      setIsVisible(false);
    } else if (!scrollingDown) {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Sticky header — always visible */}
      <HomeHeader />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search bar ─────────────────────────── */}
        {/* <View className="px-6 pb-4 bg-white">
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              placeholder={t("home:search.placeholder", { defaultValue: "Search jobs, companies..." })}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-800 font-quicksandMedium text-sm"
              onChangeText={setSearchQuery}
              value={searchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
            <View className="w-px h-5 bg-gray-200 mx-3" />
            <TouchableOpacity className="flex-row items-center bg-cyan-700 rounded-xl px-3 py-1.5">
              <Ionicons name="options-outline" size={14} color="white" />
              <Text className="text-white font-quicksandBold text-xs ml-1">
                {t("common:buttons.filter", { defaultValue: "Filter" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View> */}

        {/* ── Hero Banner carousel ────────────────── */}
        <View className="py-5">
          <HeroBanner />
        </View>

        {/* ── Stats strip ────────────────────────── */}
        <HomeStats />

        {/* ── Category chips ─────────────────────── */}
      {/*   <View className="mb-5">
          <Text className="text-base font-quicksandBold text-gray-800 px-6 mb-3">
            {t("home:categories.title", { defaultValue: "Browse by Category" })}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`px-4 py-2 rounded-full border ${
                  category.id === selectedCategory
                    ? "bg-cyan-700 border-cyan-600"
                    : "bg-gray-100 border-gray-200"
                }`}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-quicksandMedium text-sm ${
                    category.id === selectedCategory ? "text-white" : "text-gray-700"
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}

        {/* ── Recommended / Latest Jobs ───────────── */}
        <HomeJobs
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />

        {/* Bottom breathing room */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}