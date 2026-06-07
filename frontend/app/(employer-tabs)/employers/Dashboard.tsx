import ActiveJobsSection from "@/components/employer/ActiveJobsSection";
import AttentionSection from "@/components/employer/AttentionSection";
import DashboardHeader from "@/components/employer/DashboardHeader";
import RecentContactsSection from "@/components/employer/RecentContactSection";
import StatCards from "@/components/employer/StatsCards";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useDashboard } from "@/hooks/UseDashboard";
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

    if (scrollDirection === "down" && currentScrollY > 50) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <DashboardHeader />
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="mt-3 text-sm text-gray-400 font-quicksandMedium">
            {t("messages.loadingDashboard")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
        <DashboardHeader unreadCount={stats.unreadMessages} />

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
      </ScrollView>
    </SafeAreaView>
  );
}