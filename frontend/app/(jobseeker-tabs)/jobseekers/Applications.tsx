import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Applications() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "reviewed", label: "Reviewed" },
    { id: "rejected", label: "Rejected" },
  ];

  const applications = [
    {
      id: 1,
      company: "Google",
      position: "Frontend Developer",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png",
      status: "pending",
      date: "2 hours ago",
      location: "Remote",
      salary: "$120,000 - $180,000",
    },
    {
      id: 2,
      company: "Microsoft",
      position: "Full Stack Engineer",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Microsoft-Logo.png",
      status: "reviewed",
      date: "1 day ago",
      location: "Redmond, WA",
      salary: "$130,000 - $190,000",
    },
    {
      id: 3,
      company: "Apple",
      position: "iOS Developer",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
      status: "rejected",
      date: "3 days ago",
      location: "Cupertino, CA",
      salary: "$140,000 - $200,000",
    },
    {
      id: 4,
      company: "Netflix",
      position: "DevOps Engineer",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png",
      status: "pending",
      date: "1 week ago",
      location: "Los Gatos, CA",
      salary: "$130,000 - $190,000",
    },
    {
      id: 5,
      company: "Amazon",
      position: "Backend Developer",
      logo: "https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png",
      status: "reviewed",
      date: "2 weeks ago",
      location: "Seattle, WA",
      salary: "$125,000 - $175,000",
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
      case "reviewed":
        return { bg: "bg-blue-100", text: "text-blue-700", label: "Reviewed" };
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
      case "reviewed":
        return "visibility";
      case "rejected":
        return "cancel";
      default:
        return "help";
    }
  };

  const filteredApplications =
    activeFilter === "all"
      ? applications
      : applications.filter((app) => app.status === activeFilter);

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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-6">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-quicksandBold text-gray-800">
              Applications
            </Text>
            <Text className="text-gray-500 font-quicksandMedium mt-1">
              Track your job applications
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

      {/* Applications Count */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-gray-600 font-quicksandMedium">
          Showing {filteredApplications.length} application
          {filteredApplications.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Applications List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {filteredApplications.length > 0 ? (
          <View className="p-4">
            {filteredApplications.map((application) => {
              const status = getStatusColor(application.status);
              return (
                <TouchableOpacity
                  key={application.id}
                  className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-200"
                >
                  <View className="flex flex-row items-start justify-between mb-4">
                    <View className="flex flex-row items-center flex-1">
                      <View className="w-14 h-14 rounded-2xl border border-gray-200 bg-white overflow-hidden p-2">
                        <Image
                          source={{ uri: application.logo }}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="text-lg font-quicksandBold text-gray-800">
                          {application.position}
                        </Text>
                        <View className="flex flex-row items-center mt-1">
                          <Text className="text-gray-600 font-quicksandMedium">
                            {application.company}
                          </Text>
                          <MaterialIcons
                            name="verified"
                            size={14}
                            color="#0E7490"
                            className="ml-1"
                          />
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

                  {/* Job Details Section */}
                  <View className="space-y-3">
                    {/* Location & Salary Row */}
                    <View className="flex flex-row items-center">
                      <View className="flex-1 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-xl mr-2">
                        <View className="bg-cyan-100 p-1.5 rounded-lg">
                          <Ionicons name="location" size={14} color="#0E7490" />
                        </View>
                        <Text
                          className="text-gray-700 font-quicksandSemibold text-xs ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {application.location}
                        </Text>
                      </View>

                      <View className="flex-1 flex flex-row items-center bg-green-50 px-3 py-2 rounded-xl ml-2">
                        <View className="bg-green-100 p-1.5 rounded-lg">
                          <Ionicons name="cash" size={14} color="#059669" />
                        </View>
                        <Text
                          className="text-green-700 font-quicksandSemibold text-xs ml-2 flex-1"
                          numberOfLines={1}
                        >
                          {application.salary}
                        </Text>
                      </View>
                    </View>

                    {/* Date Posted */}
                    <View className="flex flex-row items-center bg-gray-50 px-3 py-2 rounded-xl mt-2">
                      <View className="bg-purple-100 p-1.5 rounded-lg">
                        <MaterialIcons
                          name={getStatusIcon(application.status)}
                          size={14}
                          color="#7C3AED"
                        />
                      </View>
                      <Text className="text-gray-600 font-quicksandMedium text-xs ml-2">
                        Applied {application.date}
                      </Text>
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
                        View Details
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
            <Ionicons name="document-outline" size={80} color="#D1D5DB" />
            <Text className="text-2xl font-quicksandBold text-gray-800 mt-6 text-center">
              No applications found
            </Text>
            <Text className="text-gray-500 font-quicksandMedium text-base mt-2 text-center">
              {activeFilter === "all"
                ? "You haven't applied to any jobs yet."
                : `No ${activeFilter} applications found.`}
            </Text>
            <TouchableOpacity className="bg-cyan-700 rounded-2xl px-6 py-3 mt-6">
              <Text className="text-white font-quicksandBold text-base">
                Browse Jobs
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
