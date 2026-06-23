// app/(jobseeker-tabs)/jobseekers/Applications.tsx
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationCardSkeleton } from "@/components/skeletons/ApplicationCardSkeleton";
import { SkeletonList } from "@/components/skeletons/SkeletonBase";
import ApplicationsHeader from "@/components/jobseeker/applications/ApplicationsHeader";
import StatusFilterBar from "@/components/jobseeker/applications/StatusFilterBar";
import ApplicationCard from "@/components/jobseeker/applications/ApplicationCard";
import ApplicationsEmptyState from "@/components/jobseeker/applications/ApplicationsEmptyState";
import type { ApplicationFilterId, JobApplication } from "@/types/appication";

export default function Applications() {
  const router = useRouter();
  const { t } = useTranslation("jobs");
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);

  const [activeFilter, setActiveFilter] = useState<ApplicationFilterId>("all");

  const { applications, loading, refreshing, refresh, withdrawApplication } = useApplications({
    status: activeFilter,
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const isScrollingDown = currentScrollY > lastScrollY.current;

      if (isScrollingDown && currentScrollY > 50) {
        setIsVisible(false);
      } else if (!isScrollingDown) {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    },
    [setIsVisible]
  );

  const handleViewJob = useCallback(
    (jobId: string) => {
      router.push({ pathname: "/jobseekers/job-details/[id]", params: { id: jobId } });
    },
    [router]
  );

  const handleWithdraw = useCallback(
    (applicationId: string, jobTitle: string) => {
      Alert.alert(
        t("applications.withdraw.title"),
        t("applications.withdraw.message", { jobTitle }),
        [
          { text: t("buttons.cancel"), style: "cancel" },
          {
            text: t("applications.withdraw.confirmBtn"),
            style: "destructive",
            onPress: async () => {
              const success = await withdrawApplication(applicationId);
              Alert.alert(
                success
                  ? t("applications.withdraw.successTitle")
                  : t("applications.withdraw.errorTitle"),
                success
                  ? t("applications.withdraw.successMessage")
                  : t("applications.withdraw.errorMessage")
              );
            },
          },
        ]
      );
    },
    [t, withdrawApplication]
  );

  const renderItem = useCallback(
    ({ item }: { item: JobApplication }) => (
      <ApplicationCard application={item} onPress={handleViewJob} onWithdraw={handleWithdraw} />
    ),
    [handleViewJob, handleWithdraw]
  );

  const keyExtractor = useCallback((item: JobApplication) => item.id, []);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <ApplicationsHeader onRefresh={refresh} isRefreshing={refreshing} />
      <StatusFilterBar activeFilter={activeFilter} onChange={setActiveFilter} />

      {loading ? (
        <View className="flex-1 px-4 pt-4">
          <SkeletonList count={4} renderItem={() => <ApplicationCardSkeleton />} staggerMs={70} />
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
          ListHeaderComponent={
            applications.length > 0 ? (
              <Text className="text-gray-400 font-quicksandMedium text-xs mb-3 ml-1">
                {t("applications.list.showing", { count: applications.length })}
              </Text>
            ) : null
          }
          ListEmptyComponent={<ApplicationsEmptyState filter={activeFilter} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={["#0E7490"]}
              tintColor="#0E7490"
            />
          }
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
        />
      )}
    </View>
  );
}