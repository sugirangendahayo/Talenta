// components/JobsList.tsx
import data from "@/data/jobs.json"; // Import JSON here too (or pass as prop if you want to centralize)
import { Job } from "@/types/job.types"; // Assuming this exists
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
interface JobsListProps {
  selectedCategory: string;
  searchQuery: string;
}
const JobsList: React.FC<JobsListProps> = ({ selectedCategory, searchQuery }) => {
  const router = useRouter();
  const jobs: Job[] = data.jobs;
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const categoryMatch =
        selectedCategory === "all" || job.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase().trim();
      const searchMatch =
        searchLower === "" ||
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower);
      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery, jobs]); // Added jobs to deps if it changes
  const handleJobPress = (jobId: string) => {
    router.push({
      pathname: "/jobseekers/job-details/[id]",
      params: { id: jobId },
    });
  };
  const renderJobItem = ({ item }: { item: Job }) => (
    <>
      <TouchableOpacity
        className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm border border-gray-200"
        onPress={() => handleJobPress(item.id.toString())}
      >
        <View className="flex-1">
          <View className="flex flex-row items-start justify-between mb-3">
            <View className="flex flex-row items-center flex-1 mr-3">
              <View
                className="w-16 h-16 rounded-full border border-gray-200 bg-white overflow-hidden p-2"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                }}
              >
                <Image
                  source={{ uri: item.logo }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1 ml-3">
                <View className="flex flex-row items-center gap-1">
                  <Text className="text-gray-600 font-quicksandMedium text-sm">
                    {item.company}
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
            {item.type
              .slice(0, 2)
              .map(
                (
                  type:
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactElement<
                        unknown,
                        string | React.JSXElementConstructor<any>
                      >
                    | Iterable<React.ReactNode>
                    | React.ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactPortal
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined,
                  index: React.Key | null | undefined
                ) => (
                  <View
                    key={index}
                    className="bg-gray-100 px-3 py-2 rounded-full"
                  >
                    <Text className="text-gray-700 text-xs font-quicksandMedium">
                      {type}
                    </Text>
                  </View>
                )
              )}
          </View>
          <Text className="text-gray-500 text-sm font-quicksandMedium mb-3">
            {item.description.substring(0, 100)}...{" "}
            <Text className="text-cyan-600 text-xs font-quicksandMedium">
              {item.posted}
            </Text>
          </Text>
          <View className="flex flex-row justify-between items-center">
            <Text className="text-cyan-600 text-sm font-quicksandMedium p-2 bg-gray-100 rounded-full">
              {item.salary}
            </Text>
            <TouchableOpacity className="bg-cyan-700 px-4 py-2 rounded-full">
              <Text className="text-white font-quicksandBold text-sm">
                Apply Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center flex py-20 px-8">
      <Ionicons name="search-outline" size={64} color="#D1D5DB" />
      <Text className="text-xl font-quicksandBold text-gray-800 mt-4 text-center">
        No jobs found
      </Text>
      <Text className="text-gray-500 font-quicksandMedium text-sm mt-2 text-center">
        Try adjusting your filters or search terms
      </Text>
    </View>
  );
  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredJobs}
        ListHeaderComponent={
          <Text className="text-2xl font-quicksandBold text-gray-800 p-4 ">
            All Available Jobs
          </Text>
        }
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id.toString()} // Handles numeric IDs
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};
export default JobsList;
