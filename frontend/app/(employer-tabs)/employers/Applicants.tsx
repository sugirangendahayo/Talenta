import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Applicants() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "shortlisted", label: "Shortlisted" },
    { id: "rejected", label: "Rejected" },
  ];

  const applicants = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      position: "Frontend Developer",
      status: "pending",
      appliedDate: "2 hours ago",
      experience: "5 years",
      location: "New York, NY",
      matchScore: 95,
      skills: ["React", "TypeScript", "Tailwind"],
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=12",
      position: "Full Stack Engineer",
      status: "shortlisted",
      appliedDate: "1 day ago",
      experience: "7 years",
      location: "San Francisco, CA",
      matchScore: 92,
      skills: ["Node.js", "React", "MongoDB"],
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=5",
      position: "Frontend Developer",
      status: "rejected",
      appliedDate: "3 days ago",
      experience: "3 years",
      location: "Austin, TX",
      matchScore: 78,
      skills: ["Vue.js", "JavaScript", "CSS"],
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?img=14",
      position: "DevOps Engineer",
      status: "pending",
      appliedDate: "1 week ago",
      experience: "6 years",
      location: "Seattle, WA",
      matchScore: 88,
      skills: ["AWS", "Docker", "Kubernetes"],
    },
    {
      id: 5,
      name: "Jessica Williams",
      avatar: "https://i.pravatar.cc/150?img=9",
      position: "Backend Developer",
      status: "shortlisted",
      appliedDate: "2 weeks ago",
      experience: "4 years",
      location: "Boston, MA",
      matchScore: 90,
      skills: ["Python", "Django", "PostgreSQL"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Pending",
        };
      case "shortlisted":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Shortlisted",
        };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-700", label: "Rejected" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: "Unknown" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "hourglass-empty";
      case "shortlisted":
        return "check-circle";
      case "rejected":
        return "cancel";
      default:
        return "help";
    }
  };

  const filteredApplicants =
    activeFilter === "all"
      ? applicants
      : applicants.filter((app) => app.status === activeFilter);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-6">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="font-quicksandBold text-2xl text-gray-800">
              Applicants
            </Text>
            <Text className="text-gray-500 font-quicksandMedium mt-1">
              Manage your job applicants
            </Text>
          </View>
          <TouchableOpacity className="bg-cyan-100 p-3 rounded-2xl">
            <Ionicons name="filter" size={20} color="#0E7490" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex flex-row justify-between">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full border ${
                activeFilter === filter.id
                  ? "bg-cyan-700 border-cyan-700 border"
                  : "bg-white border-gray-300 border"
              }`}
            >
              <Text
                className={`font-quicksandMedium text-sm ${
                  activeFilter === filter.id ? "text-white" : "text-gray-700"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Applicants Count */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-gray-600 font-quicksandMedium">
          Showing {filteredApplicants.length} applicant
          {filteredApplicants.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Applicants List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredApplicants.length > 0 ? (
          <View className="p-4">
            {filteredApplicants.map((applicant) => {
              const status = getStatusColor(applicant.status);
              return (
                <TouchableOpacity
                  key={applicant.id}
                  className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-200"
                >
                  <View className="flex flex-row items-start justify-between mb-4">
                    <View className="flex flex-row items-center flex-1">
                      <View className="w-14 h-14 rounded-full border-2 border-cyan-200 overflow-hidden">
                        <Image
                          source={{ uri: applicant.avatar }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="text-lg font-quicksandBold text-gray-800">
                          {applicant.name}
                        </Text>
                        <View className="flex flex-row items-center mt-1">
                          <Text className="text-gray-600 font-quicksandMedium">
                            {applicant.position}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className={`${status.bg} px-3 py-1 rounded-full`}>
                      <Text
                        className={`${status.text} text-xs font-quicksandBold`}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Match Score */}
                  <View className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-xl mb-3">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="text-gray-700 font-quicksandSemibold text-sm">
                        Match Score
                      </Text>
                      <View className="flex flex-row items-center">
                        <View className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                          <View
                            className="h-full bg-cyan-600 rounded-full"
                            style={{ width: `${applicant.matchScore}%` }}
                          />
                        </View>
                        <Text className="text-cyan-700 font-quicksandBold text-sm">
                          {applicant.matchScore}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Applicant Details Section */}
                  <View className="space-y-3">
                    {/* Location & Experience Row */}
                    <View className="flex flex-row items-center">
                      <View className="flex-1 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-xl mr-2">
                        <View className="bg-cyan-100 p-1.5 rounded-lg">
                          <Ionicons name="location" size={14} color="#0E7490" />
                        </View>
                        <Text
                          className="text-gray-700 font-quicksandSemibold text-xs ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {applicant.location}
                        </Text>
                      </View>

                      <View className="flex-1 flex flex-row items-center bg-purple-50 px-3 py-2 rounded-xl ml-2">
                        <View className="bg-purple-100 p-1.5 rounded-lg">
                          <Ionicons
                            name="briefcase"
                            size={14}
                            color="#7C3AED"
                          />
                        </View>
                        <Text
                          className="text-purple-700 font-quicksandSemibold text-xs ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {applicant.experience}
                        </Text>
                      </View>
                    </View>

                    {/* Applied Date */}
                    <View className="flex flex-row items-center bg-gray-50 px-3 py-2 rounded-xl">
                      <View className="bg-blue-100 p-1.5 rounded-lg">
                        <MaterialIcons
                          name={getStatusIcon(applicant.status)}
                          size={14}
                          color="#2563EB"
                        />
                      </View>
                      <Text className="text-gray-600 font-quicksandMedium text-xs ml-2">
                        Applied {applicant.appliedDate}
                      </Text>
                    </View>

                    {/* Skills */}
                    <View className="flex flex-row flex-wrap gap-2 mt-2">
                      {applicant.skills.map((skill, index) => (
                        <View
                          key={index}
                          className="bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-200"
                        >
                          <Text className="text-cyan-700 font-quicksandSemibold text-xs">
                            {skill}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex flex-row space-x-3 mt-4 gap-2">
                    <TouchableOpacity className="flex-1 bg-gray-100 py-2 rounded-2xl flex flex-row items-center justify-center">
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color="#6B7280"
                      />
                      <Text className="text-gray-700 font-quicksandMedium text-sm ml-2">
                        View Profile
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-cyan-700 py-2 rounded-2xl flex flex-row items-center justify-center">
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color="white"
                      />
                      <Text className="text-white font-quicksandMedium text-sm ml-2">
                        Message
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          // Empty State
          <View className="flex-1 items-center justify-center flex py-20 px-8">
            <Ionicons name="people-outline" size={80} color="#D1D5DB" />
            <Text className="text-2xl font-quicksandBold text-gray-800 mt-6 text-center">
              No applicants found
            </Text>
            <Text className="text-gray-500 font-quicksandMedium text-base mt-2 text-center">
              {activeFilter === "all"
                ? "You haven't received any applications yet."
                : `No ${activeFilter} applicants found.`}
            </Text>
            <TouchableOpacity className="bg-cyan-700 rounded-2xl px-6 py-3 mt-6">
              <Text className="text-white font-quicksandBold text-base">
                Post a Job
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
