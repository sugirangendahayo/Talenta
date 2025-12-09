import data from "@/data/jobs.json";
import { Job } from "@/types/job.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

interface EmployerJobsListProps {
  selectedCategory: string;
  searchQuery: string;
  statusFilter: string;
}

const EmployerJobsList: React.FC<EmployerJobsListProps> = ({
  selectedCategory,
  searchQuery,
  statusFilter,
}) => {
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
  }, [selectedCategory, searchQuery, jobs]);

//   const handleJobPress = (jobId: number | string) => {
//     router.push({
//       pathname: "/employer/job-details/[id]",
//       params: { id: jobId },
//     });
//   };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm border border-gray-200"
    //   onPress={() => handleJobPress(item.id)}
    >
      <View className="flex-1">
        {/* Header: Logo + Job Info + Status */}
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

          {/* Status Badge */}
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-quicksandBold">
              Active
            </Text>
          </View>
        </View>

        {/* Type Badges */}
        <View className="flex flex-row flex-wrap gap-2 mb-3">
          {item.type.slice(0, 2).map((type, index) => (
            <View key={index} className="bg-gray-100 px-3 py-2 rounded-full">
              <Text className="text-gray-700 text-xs font-quicksandMedium">
                {type}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats Row */}
        <View className="flex flex-row items-center gap-4 mb-3 flex-wrap">
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="eye-outline" size={16} color="#0E7490" />
            <Text className="text-xs font-quicksandBold text-gray-700">
              {Math.floor(Math.random() * 50) + 10} applicants
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="chatbubble-outline" size={16} color="#8B5CF6" />
            <Text className="text-xs font-quicksandBold text-gray-700">
              {Math.floor(Math.random() * 20) + 1} messages
            </Text>
          </View>
          <View className="flex flex-row items-center gap-1">
            <Ionicons name="time-outline" size={16} color="#F59E0B" />
            <Text className="text-xs font-quicksandBold text-gray-700">
              {item.posted}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text className="text-gray-500 text-sm font-quicksandMedium mb-3">
          {item.description.substring(0, 100)}...
        </Text>

        {/* Footer: Salary + Actions */}
        <View className="flex flex-row justify-between items-center gap-2">
          <Text className="text-cyan-600 text-sm font-quicksandMedium p-2 bg-gray-100 rounded-full">
            {item.salary}
          </Text>
          <View className="flex flex-row gap-2">
            <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
              <Ionicons name="pause" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
              <Ionicons name="create-outline" size={20} color="#0E7490" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-cyan-700 p-2 rounded-full">
              <MaterialIcons name="arrow-outward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center flex py-20 px-8">
      <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
      <Text className="text-xl font-quicksandBold text-gray-800 mt-4 text-center">
        No jobs found
      </Text>
      <Text className="text-gray-500 font-quicksandMedium text-sm mt-2 text-center">
        Try adjusting your filters or post a new job
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filteredJobs}
        ListHeaderComponent={
          <View className="px-4 py-2 flex flex-row justify-between items-center">
            <Text className="text-xl font-quicksandBold text-gray-800">
              Your Job Posts ({filteredJobs.length})
            </Text>
            <TouchableOpacity className="flex flex-row items-center gap-1">
              <Ionicons name="funnel-outline" size={16} color="#0E7490" />
              <Text className="text-sm font-quicksandBold text-cyan-700">
                Sort
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

export default EmployerJobsList;
