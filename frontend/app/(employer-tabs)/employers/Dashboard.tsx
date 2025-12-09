import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "@/components/employer/DashboardHeader";
import StatCards from "@/components/employer/StatsCards";
import AttentionSection from "@/components/employer/AttentionSection";
import ActiveJobsSection from "@/components/employer/ActiveJobsSection";
import QuickActions from "@/components/employer/QuickActions";
import ScheduleSection from "@/components/employer/ScheduleSection";

export default function Dashboard() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header with company logo, greeting, notifications */}
        <DashboardHeader />

        {/* 4 Stat Cards: Jobs, Applicants, Interviews, Messages */}
        <StatCards />

        {/* Requiring Attention Section - High-priority applicants */}
        <AttentionSection />

        {/* Active Jobs Section - List of current job postings */}
        <ActiveJobsSection />

        {/* Quick Action Buttons - Post Job, Find Candidates, etc. */}
        <QuickActions />

        {/* Today's Schedule - Interviews, calls, tasks */}
        <ScheduleSection />
      </ScrollView>
    </SafeAreaView>
  );
}
