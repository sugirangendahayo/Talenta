// app/(employer-tabs)/employers/Dashboard.tsx
import ActiveJobsSection from "@/components/employer/ActiveJobsSection";
import AttentionSection from "@/components/employer/AttentionSection";
import DashboardHeader from "@/components/employer/DashboardHeader";
import RecentContactsSection from "@/components/employer/RecentContactSection";
import StatCards from "@/components/employer/StatsCards";
import {
  DashboardHeaderSkeleton,
  DashboardSkeleton,
} from "@/components/skeletons/DashboardSkeleton";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useDashboard } from "@/hooks/UseDashboard";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const { setIsVisible } = useTabBarVisibility();
  const { t } = useTranslation("dashboard");
  const lastScrollY = useRef(0);

  const {
    stats,
    highPriorityApplicants,
    activeJobs,
    recentContacts,
    loading,
    refreshing,
    error,
    refresh,
  } = useDashboard();

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
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]" edges={["top"]}>
        {/* Header always visible — keeps the screen grounded */}
        <DashboardHeaderSkeleton />
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <DashboardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#D1D5DB" />
          <Text className="mt-3 text-sm text-gray-400 font-quicksandMedium text-center">
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Loaded state ───────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#0E7490"]}
            tintColor="#0E7490"
          />
        }
      >
        <DashboardHeader />

        {/* Keyed on which sections are present. On Android, RefreshControl +
            a ScrollView whose child count/shape changes mid-refresh can leave
            a stale native layout behind — a newly-appearing section (e.g. the
            first active job right after posting) ends up rendered on top of
            the stats cards instead of below them, and it stays broken until
            the app is fully restarted. Changing this key when the visible
            section "shape" changes forces React to tear down and rebuild this
            whole block with a fresh native view tree instead of trying to
            patch the existing (corrupted) one in place. */}
        <View
          key={`${highPriorityApplicants.length > 0}-${activeJobs.length > 0}-${recentContacts.length > 0}`}
          collapsable={false}
        >
          <StatCards stats={stats} />

          {highPriorityApplicants.length > 0 && (
            <AttentionSection applicants={highPriorityApplicants} />
          )}

          {activeJobs.length > 0 && (
            <ActiveJobsSection jobs={activeJobs} onRefresh={refresh} />
          )}

          {recentContacts.length > 0 && (
            <RecentContactsSection contacts={recentContacts} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
