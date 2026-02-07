import ActiveJobsSection from "@/components/employer/ActiveJobsSection";
import AttentionSection from "@/components/employer/AttentionSection";
import DashboardHeader from "@/components/employer/DashboardHeader";
import QuickActions from "@/components/employer/QuickActions";
import RecentContactsSection from "@/components/employer/RecentContactSection";
import StatCards from "@/components/employer/StatsCards";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useDashboard } from "@/hooks/useDashboard";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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

    if (scrollDirection === "down" && currentScrollY > 0) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="mt-4 text-gray-600 font-quicksandMedium">
            {t("messages.loadingDashboard")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-red-600 font-quicksandBold text-lg text-center">
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 100 }}
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
        {/* Header with company logo, greeting, notifications */}
        <DashboardHeader unreadCount={stats.unreadMessages} />

        {/* 4 Stat Cards: Jobs, Applicants, Interviews, Messages */}
        <StatCards stats={stats} />

        {/* Requiring Attention Section - High-priority applicants */}
        {highPriorityApplicants.length > 0 && (
          <AttentionSection applicants={highPriorityApplicants} />
        )}

        {/* Active Jobs Section - List of current job postings */}
        {activeJobs.length > 0 && (
          <ActiveJobsSection jobs={activeJobs} onRefresh={refresh} />
        )}

        {/* Quick Action Buttons - Post Job, Find Candidates, etc. */}
        <QuickActions />

        {/* Recent Contacts - Hired/Shortlisted candidates */}
        {recentContacts.length > 0 && (
          <RecentContactsSection contacts={recentContacts} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
