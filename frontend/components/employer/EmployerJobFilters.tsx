import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

// Status filter options
const STATUS_FILTERS = [
  { id: "all", label: "All Jobs", icon: "apps-outline" },
  {
    id: "active",
    label: "Active",
    icon: "checkmark-circle-outline",
    color: "#10B981",
  },
  { id: "expired", label: "Expired", icon: "time-outline", color: "#EF4444" },
  {
    id: "paused",
    label: "Paused",
    icon: "pause-circle-outline",
    color: "#F59E0B",
  },
  {
    id: "closed",
    label: "Closed",
    icon: "close-circle-outline",
    color: "#6B7280",
  },
  { id: "draft", label: "Draft", icon: "create-outline", color: "#3B82F6" },
];

export default function EmployerJobFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  categories,
  selectedStatus,
  onStatusChange,
}: EmployerJobFiltersProps) {
  const { t } = useTranslation("jobs");
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  return (
    <View className="bg-white border-b border-gray-200 pb-3">
      {/* Search Bar */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder={t("filters.searchPlaceholder")}
            value={searchQuery}
            onChangeText={onSearchChange}
            className="flex-1 ml-2 text-gray-800 font-quicksandMedium"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <View className="px-4 pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_FILTERS.map((status) => {
            const isSelected = selectedStatus === status.id;
            return (
              <TouchableOpacity
                key={status.id}
                onPress={() => onStatusChange(status.id)}
                className={`flex flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-cyan-700 border-cyan-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <Ionicons
                  name={status.icon as any}
                  size={16}
                  color={isSelected ? "#fff" : status.color || "#6B7280"}
                />
                <Text
                  className={`text-sm font-quicksandBold ${
                    isSelected ? "text-white" : "text-gray-700"
                  }`}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Filter Toggle */}
      <View className="px-4">
        <TouchableOpacity
          onPress={() => setShowCategoryFilter(!showCategoryFilter)}
          className="flex flex-row items-center justify-between py-2"
        >
          <View className="flex flex-row items-center gap-2">
            <Ionicons name="grid-outline" size={18} color="#0E7490" />
            <Text className="text-sm font-quicksandBold text-gray-700">
              {t("filters.category")}:{" "}
              <Text className="text-cyan-700">
                {categories.find((c) => c.id === selectedCategory)?.name ||
                  t("filters.allCategories")}
              </Text>
            </Text>
          </View>
          <Ionicons
            name={showCategoryFilter ? "chevron-up" : "chevron-down"}
            size={18}
            color="#9CA3AF"
          />
        </TouchableOpacity>

        {/* Category Chips */}
        {showCategoryFilter && (
          <View className="flex flex-row flex-wrap gap-2 mt-2">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => onCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? "bg-cyan-100 border-cyan-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-xs font-quicksandBold ${
                      isSelected ? "text-cyan-700" : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
