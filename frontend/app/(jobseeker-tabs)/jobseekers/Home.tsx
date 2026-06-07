// app/(jobseeker-tabs)/jobseekers/Home.tsx
import HeroBanner from "@/components/jobseeker/HeroBanner";
import HomeHeader from "@/components/jobseeker/HomeHeader";
import HomeJobs from "@/components/jobseeker/HomeJobs";
import HomeStats from "@/components/jobseeker/HomeStats";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");

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
      {/* Sticky header — search lives here now */}
      <HomeHeader onSearchChange={setSearchQuery} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero Banner (crossfade) ─────────────── */}
        <View className="pt-2 pb-4">
          <HeroBanner />
        </View>

        {/* ── Stats strip ────────────────────────── */}
        <HomeStats />

        {/* ── Recommended / Latest Jobs ───────────── */}
        <HomeJobs selectedCategory="all" searchQuery={searchQuery} />

        {/* Bottom breathing room */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
