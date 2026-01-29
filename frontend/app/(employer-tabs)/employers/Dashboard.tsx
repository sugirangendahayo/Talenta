import {
  ScrollView,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DashboardHeader from "@/components/employer/DashboardHeader";
import StatCards from "@/components/employer/StatsCards";
import AttentionSection from "@/components/employer/AttentionSection";
import ActiveJobsSection from "@/components/employer/ActiveJobsSection";
import QuickActions from "@/components/employer/QuickActions";
import ScheduleSection from "@/components/employer/ScheduleSection";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useState, useRef } from "react";


export default function Dashboard() {
   const { setIsVisible } = useTabBarVisibility();
   const lastScrollY = useRef(0);

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll}
        
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
