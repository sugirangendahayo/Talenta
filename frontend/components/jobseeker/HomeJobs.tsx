import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useJobs } from "@/app/hooks/useJobs";

interface HomeJobsProps {
  selectedCategory: string;
  searchQuery: string;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const HomeJobs: React.FC<HomeJobsProps> = ({
  selectedCategory,
  searchQuery,
  onScroll,
}) => {
  const router = useRouter();
  const {
    jobs,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    newJobsCount,
    loadMore,
    refresh,
    loadNewJobs,
  } = useJobs({
    category: selectedCategory,
    searchQuery: searchQuery,
    pageSize: 10,
  });
  
  

  const handleJobPress = (jobId: string) => {
    router.push({
      pathname: "/jobseekers/job-details/[id]",
      params: { id: jobId },
    });
  };

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const renderJobItem = ({ item }: { item: any }) => {
    const companyName = item.employer_profiles?.company_name || "Company";
    const salary = formatSalary(item.salary_min, item.salary_max);
    const timeAgo = getTimeAgo(item.created_at);
    const jobTypes = item.job_type.split(",").map((t: string) => t.trim());

    return (
      <TouchableOpacity
        className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm border border-gray-200"
        onPress={() => handleJobPress(item.id)}
      >
        <View className="flex-1">
          <View className="flex flex-row items-start justify-between mb-3">
            <View className="flex flex-row items-center flex-1 mr-3">
              <View
                className="w-16 h-16 rounded-full border border-gray-200 bg-white overflow-hidden p-2 items-center justify-center flex"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                }}
              >
                {/* Placeholder logo - you can fetch actual logos later */}
                <Text className="text-2xl font-quicksandBold text-cyan-600">
                  {companyName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1 ml-3">
                <View className="flex flex-row items-center gap-1">
                  <Text className="text-gray-600 font-quicksandMedium text-sm">
                    {companyName}
                  </Text>
                  <MaterialIcons name="verified" size={14} color="#0E7490" />
                </View>

                <Text className="text-lg font-quicksandBold text-gray-800">
                  {item.title}
                </Text>
                <View className="flex flex-row items-center justify-start gap-1">
                  <Ionicons name="location-sharp" size={13} color="#0E7490" />
                  <Text className="text-gray-600 font-quicksandMedium text-sm">
                    {item.location}
                  </Text>
                </View>
              </View>
            </View>
            <View className="pt-1">
              <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="bookmark-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex flex-row flex-wrap gap-2 mb-3">
            {jobTypes.slice(0, 2).map((type: string, index: number) => (
              <View key={index} className="bg-gray-100 px-3 py-2 rounded-full">
                <Text className="text-gray-700 text-xs font-quicksandMedium">
                  {type}
                </Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-500 text-sm font-quicksandMedium mb-3">
            {item.description.substring(0, 100)}...{"  "}
            <Text className="text-cyan-600 text-xs font-quicksandMedium">
              {timeAgo}
            </Text>
          </Text>

          <View className="flex flex-row justify-between items-center">
            <Text className="text-cyan-600 text-sm font-quicksandMedium p-2 bg-gray-100 rounded-full">
              {salary}
            </Text>
            <TouchableOpacity className="bg-cyan-700 p-2 rounded-full">
              <MaterialIcons name="arrow-outward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* New Jobs Banner (Twitter-style) */}
      {newJobsCount > 0 && (
        <TouchableOpacity
          className="mx-4 mb-3 bg-cyan-600 p-3 rounded-2xl flex flex-row items-center justify-center"
          onPress={loadNewJobs}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={16} color="white" />
          <Text className="text-white font-quicksandBold text-sm ml-2">
            {newJobsCount} new {newJobsCount === 1 ? "job" : "jobs"} available
          </Text>
        </TouchableOpacity>
      )}

      <Text className="text-2xl font-quicksandBold text-gray-800 px-4 pb-2">
        Recommended for you!
      </Text>
    </>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#0E7490" />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View className="flex-1 items-center justify-center flex py-20 px-8">
        <Ionicons name="search-outline" size={64} color="#D1D5DB" />
        <Text className="text-xl font-quicksandBold text-gray-800 mt-4 text-center">
          No jobs found
        </Text>
        <Text className="text-gray-500 font-quicksandMedium text-sm mt-2 text-center">
          {error ? error : "Try adjusting your filters or search terms"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-600 font-quicksandMedium mt-4">
          Loading jobs...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={jobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#0E7490"]}
            tintColor="#0E7490"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default HomeJobs;
