// components/jobseeker/SearchAndSort.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";

interface Category {
  id: string;
  name: string;
}

interface SearchAndSortProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  categories: Category[];
  filters?: { jobType: string; experienceLevel: string };
  onFiltersChange?: (filters: { jobType: string; experienceLevel: string }) => void;
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
  selectedCategory,
  onCategoryChange,
  onSearchChange,
  searchQuery,
  categories,
  filters = { jobType: "all", experienceLevel: "all" },
  onFiltersChange,
}) => {
  const { t } = useTranslation(["home", "common", "jobs"]);
  const { isDark } = useTheme();
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";
  const [searchOpen, setSearchOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [tempFilters, setTempFilters] = useState(filters);

  // Sync temp filters when modal opens
  const handleOpenFilters = () => {
    setTempFilters(filters);
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    if (onFiltersChange) onFiltersChange(tempFilters);
    setShowFilters(false);
  };

  const handleSearchToggle = () => {
    if (searchOpen) {
      onSearchChange("");
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]">
      {/* ── Top bar: category pills row + search icon ─────────────────────── */}
      <View className="flex-row items-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 8,
            paddingVertical: 12,
            gap: 8,
          }}
          className="flex-1"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => onCategoryChange(category.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-cyan-700 border-cyan-700"
                    : "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]"
                }`}
              >
                <Text
                  className={`text-sm font-quicksandMedium ${
                    isSelected
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View className="flex-row items-center pr-4">
          {/* Search toggle icon */}
          <TouchableOpacity
            onPress={handleSearchToggle}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={
              searchOpen
                ? t("jobs:filters.closeSearch", { defaultValue: "Close search" })
                : t("jobs:filters.openSearch", { defaultValue: "Search jobs" })
            }
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mr-2"
          >
            <Ionicons
              name={searchOpen ? "close" : "search"}
              size={17}
              color={iconColor}
            />
          </TouchableOpacity>

          {/* Filter toggle icon */}
          <TouchableOpacity
            onPress={handleOpenFilters}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            className={`w-9 h-9 rounded-full items-center justify-center ${
              filters.jobType !== "all" || filters.experienceLevel !== "all"
                ? "bg-cyan-100 dark:bg-cyan-900"
                : "bg-gray-100 dark:bg-[#1a1a1a]"
            }`}
          >
            <Ionicons
              name="options-outline"
              size={17}
              color={filters.jobType !== "all" || filters.experienceLevel !== "all" ? "#0E7490" : iconColor}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanding search field */}
      {searchOpen && (
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl px-4 py-3 gap-3">
            <Ionicons name="search" size={16} color={iconColor} />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={t("home:search.placeholder", {
                defaultValue: "Search jobs...",
              })}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              className="flex-1 font-quicksandMedium text-gray-800 dark:text-gray-200 text-sm"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View
            className="bg-white dark:bg-[#080A08] pt-5 rounded-t-3xl border border-gray-200 dark:border-[#2a2a2a]"
          >
            <View className="flex-row items-center justify-between px-5 mb-5">
              <Text className="font-quicksandBold text-xl text-gray-900 dark:text-gray-100">
                {t("jobs:filters.title", { defaultValue: "Filter Jobs" })}
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={isDark ? "#D1D5DB" : "#374151"} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5 mb-4" contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Job Type */}
              <Text className="font-quicksandSemibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                {t("jobs:filters.jobType", { defaultValue: "Job Type" })}
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {[
                  { id: "all", label: "All" },
                  { id: "Full-time", label: "Full-time" },
                  { id: "Part-time", label: "Part-time" },
                  { id: "Contract", label: "Contract" },
                  { id: "Remote", label: "Remote" },
                ].map((type) => {
                  const isSelected = tempFilters.jobType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setTempFilters({ ...tempFilters, jobType: type.id })}
                      className={`px-4 py-2 rounded-full border ${
                        isSelected
                          ? "bg-cyan-700 border-cyan-700"
                          : "bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-quicksandMedium ${
                          isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Experience Level */}
              <Text className="font-quicksandSemibold text-sm text-gray-800 dark:text-gray-200 mb-3">
                {t("jobs:filters.experienceLevel", { defaultValue: "Experience Level" })}
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {[
                  { id: "all", label: "All" },
                  { id: "Entry Level", label: "Entry Level" },
                  { id: "Intermediate", label: "Intermediate" },
                  { id: "Senior", label: "Senior" },
                  { id: "Expert", label: "Expert" },
                ].map((exp) => {
                  const isSelected = tempFilters.experienceLevel === exp.id;
                  return (
                    <TouchableOpacity
                      key={exp.id}
                      onPress={() => setTempFilters({ ...tempFilters, experienceLevel: exp.id })}
                      className={`px-4 py-2 rounded-full border ${
                        isSelected
                          ? "bg-cyan-700 border-cyan-700"
                          : "bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]"
                      }`}
                    >
                      <Text
                        className={`text-sm font-quicksandMedium ${
                          isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {exp.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View className="p-5 border-t border-gray-100 dark:border-[#2a2a2a] flex-row gap-3">
              <TouchableOpacity
                onPress={() => setTempFilters({ jobType: "all", experienceLevel: "all" })}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-[#2a2a2a] items-center justify-center bg-white dark:bg-[#141414]"
              >
                <Text className="font-quicksandSemibold text-gray-700 dark:text-gray-300">
                  {t("common:reset", { defaultValue: "Reset" })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyFilters}
                className="flex-1 py-3.5 rounded-2xl bg-cyan-700 dark:bg-cyan-800 items-center justify-center"
              >
                <Text className="font-quicksandSemibold text-white">
                  {t("common:apply", { defaultValue: "Apply" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SearchAndSort;
