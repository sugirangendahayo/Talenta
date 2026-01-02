import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Category {
  id: string;
  name: string;
}

interface EmployerJobFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  categories: Category[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const EmployerJobFilters: React.FC<EmployerJobFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  onSearchChange,
  searchQuery,
  categories,
  selectedStatus,
  onStatusChange,
}) => {
  const statuses = [
    { id: "all", name: "All", color: "#6B7280" },
    { id: "active", name: "Active", color: "#10B981" },
    { id: "paused", name: "Paused", color: "#F59E0B" },
    { id: "closed", name: "Closed", color: "#EF4444" },
  ];

  return (
    <View className="pb-3 bg-white">
      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search your jobs..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-800 font-quicksandMedium text-base"
            onChangeText={onSearchChange}
            value={searchQuery}
          />
          <View className="h-6 w-px bg-gray-300 mx-2" />
          <TouchableOpacity className="flex flex-row items-center bg-cyan-700 rounded-xl px-3 py-2 shadow-sm">
            <Ionicons name="options-outline" size={16} color="white" />
            <Text className="text-white font-quicksandBold text-sm ml-1">
              Filter
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filters */}
      <View className="px-4 mb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <View className="flex flex-row gap-2">
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.id}
                className={`flex flex-row items-center px-4 py-2 rounded-full border ${
                  status.id === selectedStatus
                    ? "bg-cyan-700 border-cyan-600 border"
                    : "bg-white border-gray-200 border"
                }`}
                onPress={() => onStatusChange(status.id)}
              >
                {status.id !== "all" && (
                  <View
                    className="w-2 h-2 rounded-full mr-2"
                    style={{
                      backgroundColor:
                        status.id === selectedStatus ? "white" : status.color,
                    }}
                  />
                )}
                <Text
                  className={`font-quicksandBold text-sm ${
                    status.id === selectedStatus
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {status.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Category Filters */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <View className="flex flex-row space-x-2 gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`flex flex-row items-center px-4 py-2 rounded-full border ${
                category.id === selectedCategory
                  ? "bg-gray-800 border-gray-700 border"
                  : "bg-gray-100 border-gray-200 border"
              }`}
              onPress={() => onCategoryChange(category.id)}
            >
              <Text
                className={`font-quicksandMedium text-sm ${
                  category.id === selectedCategory
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView> */}
    </View>
  );
};

export default EmployerJobFilters;