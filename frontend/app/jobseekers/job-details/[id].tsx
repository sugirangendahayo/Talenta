import jobsData from "@/data/jobs.json";
import { Job } from "@/types/job.types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Find the job by ID
  const jobId = typeof id === "string" ? parseInt(id, 10) : Number(id);
  const job = (jobsData.jobs as Job[]).find((job) => job.id === jobId);

//   console.log("Looking for job ID:", jobId, "Found:", job); // Debug log

  if (!job) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg font-quicksandBold">Job not found</Text>
        <Text className="text-gray-500 mt-2">ID: {id}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="pt-16 pb-8 px-6 rounded-b-[40px] bg-cyan-700">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-lg font-quicksandBold text-white">
            Job Details
          </Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View className="px-4 pt-6">
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-20 h-20 rounded-full border border-gray-200 bg-white overflow-hidden p-3">
                <Image
                  source={{ uri: job.logo }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-gray-600 font-quicksandMedium text-base">
                    {job.company}
                  </Text>
                  <MaterialIcons name="verified" size={16} color="#0E7490" />
                </View>
                <Text className="text-2xl font-quicksandBold text-gray-800 mb-1">
                  {job.title}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-sharp" size={16} color="#0E7490" />
                  <Text className="text-gray-600 font-quicksandMedium text-base">
                    {job.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Info */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="bg-cyan-100 px-4 py-3 rounded-2xl">
              <Text className="text-cyan-700 font-quicksandBold text-sm">
                {job.salary}
              </Text>
            </View>
            {job.type.map((type, index) => (
              <View key={index} className="bg-white px-4 py-3 rounded-2xl">
                <Text className="text-gray-700 font-quicksandMedium text-sm">
                  {type}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Job Description */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            Job Description
          </Text>
          <Text className="text-gray-600 font-quicksandMedium text-base leading-6">
            {job.description}
          </Text>
        </View>

        {/* Requirements */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="p-3 bg-gray-200 rounded-full">
              <Octicons name="checklist" size={22} color="black" />
            </Text>
            <Text className="text-xl font-quicksandBold text-gray-800">
              Requirements
            </Text>
          </View>
          <View className="flex-col space-y-2 gap-3">
            {job.requirements.map((requirement, index) => (
              <View key={index} className="flex-row items-start gap-3">
                <Octicons name="verified" size={16} color="black" />
                <Text className="text-gray-600 font-quicksandMedium text-base flex-1">
                  {requirement}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Job Info */}
        <View className="p-4 m-3 bg-white rounded-2xl">
          <Text className="text-xl font-quicksandBold text-gray-800 mb-3">
            Job Information
          </Text>
          <View className="bg-cyan-50 rounded-2xl p-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-quicksandMedium">Posted</Text>
              <Text className="text-gray-800 font-quicksandBold">
                {job.posted}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-quicksandMedium">
                Category
              </Text>
              <Text className="text-gray-800 font-quicksandBold capitalize">
                {job.category}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 font-quicksandMedium">Type</Text>
              <Text className="text-gray-800 font-quicksandBold">
                {job.type.join(", ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View className="h-24" />
      </ScrollView>

      {/* Apply Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity className="bg-cyan-700 rounded-2xl py-4 flex-row justify-center items-center">
          <Text className="text-white font-quicksandBold text-lg mr-2">
            Apply Now
          </Text>
          <MaterialIcons name="arrow-outward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
