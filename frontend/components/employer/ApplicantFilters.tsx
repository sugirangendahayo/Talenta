// components/employer/ApplicantFilters.tsx
import { useTheme } from "@/contexts/ThemeContext";
import GlobalSearchModal from "@/components/common/GlobalSearchModal";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
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

const STATUS_FILTERS: { id: FilterStatus; labelKey: string }[] = [
  { id: "all",         labelKey: "filters.all"        },
  { id: "pending",     labelKey: "status.pending"     },
  { id: "shortlisted", labelKey: "status.shortlisted" },
  { id: "hired",       labelKey: "status.hired"       },
  { id: "rejected",    labelKey: "status.rejected"    },
];

export default function ApplicantFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  counts,
}: ApplicantFiltersProps) {
  const { t } = useTranslation("applicants");
  const { isDark } = useTheme();
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const handleSelectSearch = (query: string, categoryId?: string) => {
    if (categoryId) {
      onStatusChange(categoryId as FilterStatus);
      onSearchChange("");
    } else {
      onSearchChange(query);
    }
  };

  return (
    <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]">

      {/* ── Status chips + search icon ──────────────────────────────────── */}
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
          {STATUS_FILTERS.map(({ id, labelKey }) => {
            const isActive = selectedStatus === id;
            const count = counts[id];

            return (
              <TouchableOpacity
                key={id}
                onPress={() => onStatusChange(id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                  isActive
                    ? "bg-cyan-700 border-cyan-700"
                    : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
                }`}
              >
                <Text
                  className={`text-sm font-quicksandMedium ${
                    isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {t(labelKey, { defaultValue: id })}
                </Text>

                {/* Count badge — fixed 20×20 square so it never changes
                    width as the number changes and chips don't jump. */}
                <View
                  className={`w-5 h-5 rounded-full items-center justify-center ${
                    isActive
                      ? "bg-cyan-600"
                      : "bg-gray-100 dark:bg-[#2a2a2a]"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-quicksandBold leading-none ${
                      isActive
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                    numberOfLines={1}
                  >
                    {count > 99 ? "99+" : count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search toggle — mirrors the pattern in EmployerJobFilters */}
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t("filters.openSearch", { defaultValue: "Search applicants" })}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center mr-4"
        >
          <Ionicons name="search" size={17} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* ── Active search indicator ── */}
      {searchQuery.length > 0 && (
        <View className="flex-row items-center px-4 pb-3">
          <View className="flex-row items-center flex-1 px-4 py-2.5 bg-cyan-50 dark:bg-cyan-900/10 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
            <Ionicons name="search" size={13} color="#0E7490" />
            <Text
              className="ml-2 flex-1 text-xs font-quicksandBold text-cyan-700 dark:text-cyan-400"
              numberOfLines={1}
            >
              {t("filters.searchResultsFor", {
                query: searchQuery,
                defaultValue: `Results for "${searchQuery}"`,
              })}
            </Text>
            <TouchableOpacity onPress={() => onSearchChange("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#0E7490" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <GlobalSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSelectSearch={handleSelectSearch}
        initialQuery={searchQuery}
        storageKey="@recent_employer_applicant_searches"
        placeholder={t("filters.searchPlaceholder", {
          defaultValue: "Search applicants…",
        })}
        searchForLabel={(q) => `Search applicants for "${q}"`}
        categoriesLabel={t("filters.filterByStatus", { defaultValue: "Filter by status" })}
        categories={STATUS_FILTERS.filter((f) => f.id !== "all").map((f) => ({
          id: f.id,
          name: t(f.labelKey, { defaultValue: f.id }),
        }))}
      />
    </View>
  );
}