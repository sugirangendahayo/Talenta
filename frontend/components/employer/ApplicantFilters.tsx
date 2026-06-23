// components/employer/ApplicantFilters.tsx

import { Ionicons } from "@expo/vector-icons";

import React from "react";

import { useTranslation } from "react-i18next";

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FilterStatus = "all" | "pending" | "shortlisted" | "hired" | "rejected";

interface ApplicantFiltersProps {
  searchQuery: string;

  onSearchChange: (query: string) => void;

  selectedStatus: FilterStatus;

  onStatusChange: (status: FilterStatus) => void;

  counts: {
    all: number;

    pending: number;

    shortlisted: number;

    hired: number;

    rejected: number;
  };
}

// Status filter options with icons and colors

const STATUS_FILTERS = [
  {
    id: "all" as FilterStatus,

    label: "filters.all",

    icon: "apps-outline",

    color: "#6B7280",
  },

  {
    id: "pending" as FilterStatus,

    label: "status.pending",

    icon: "time-outline",

    color: "#F59E0B",
  },

  {
    id: "shortlisted" as FilterStatus,

    label: "status.shortlisted",

    icon: "star",

    color: "#3B82F6",
  },

  {
    id: "hired" as FilterStatus,

    label: "status.hired",

    icon: "checkmark-circle",

    color: "#10B981",
  },

  {
    id: "rejected" as FilterStatus,

    label: "status.rejected",

    icon: "close-circle",

    color: "#EF4444",
  },
];

export default function ApplicantFilters({
  searchQuery,

  onSearchChange,

  selectedStatus,

  onStatusChange,

  counts,
}: ApplicantFiltersProps) {
  const { t } = useTranslation("applicants");

  return (
    <View className="bg-white dark:bg-[#080A08] border-b border-gray-200 dark:border-[#2a2a2a] pb-3">
      {/* Search Bar */}

      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-gray-100 dark:bg-[#141414] rounded-xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />

          <TextInput
            placeholder={t("filters.searchPlaceholder", { ns: "applicants" })}
            value={searchQuery}
            onChangeText={onSearchChange}
            className="flex-1 ml-2 text-gray-800 dark:text-gray-200 font-quicksandMedium"
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

      <View className="px-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_FILTERS.map((status) => {
            const isSelected = selectedStatus === status.id;

            const count = counts[status.id];

            return (
              <TouchableOpacity
                key={status.id}
                onPress={() => onStatusChange(status.id)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-700"
                    : "bg-white dark:bg-[#080A08] border-gray-300"
                }`}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={status.icon as any}
                  size={16}
                  color={isSelected ? "#fff" : status.color}
                />

                <Text
                  className={`text-sm font-quicksandBold ${
                    isSelected ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {t(status.label)} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
