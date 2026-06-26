// components/employer/EmployerJobFilters.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
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

const STATUS_FILTERS = [
  { id: "all",     labelKey: "filters.allJobs"    },
  { id: "active",  labelKey: "status.active"       },
  { id: "paused",  labelKey: "status.paused"       },
  { id: "expired", labelKey: "status.expired"      },
  { id: "draft",   labelKey: "status.draft"        },
  { id: "closed",  labelKey: "status.closed"       },
] as const;

// Accent edge color per status — same single-accent-edge pattern used on
// ApplicationCard so a hiring manager can scan their list as quickly as
// a jobseeker scans their applications.
const STATUS_ACCENT: Record<string, string> = {
  active:  "#059669",
  paused:  "#D97706",
  expired: "#DC2626",
  draft:   "#2563EB",
  closed:  "#6B7280",
};

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
  const { isDark } = useTheme();
  const iconColor = isDark ? "#9CA3AF" : "#6B7280";
  const [searchOpen, setSearchOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearchToggle = () => {
    if (searchOpen) {
      // Close: clear & collapse
      onSearchChange("");
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
      // Let the layout settle before focusing
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]">
      {/* ── Top bar: status filters + search icon ──────────────────────── */}
      <View className="flex-row items-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 8, paddingVertical: 12, gap: 8 }}
          className="flex-1"
        >
          {STATUS_FILTERS.map(({ id, labelKey }) => {
            const isActive = selectedStatus === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => onStatusChange(id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className={`px-4 py-2 rounded-full border ${
                  isActive ? "bg-cyan-700 border-cyan-700" : "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]"
                }`}
              >
                <Text
                  className={`text-sm font-quicksandMedium ${
                    isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search toggle — icon collapses into an expanding input */}
        <TouchableOpacity
          onPress={handleSearchToggle}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={searchOpen ? t("filters.closeSearch", { defaultValue: "Close search" }) : t("filters.openSearch", { defaultValue: "Search jobs" })}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mr-4"
        >
          <Ionicons
            name={searchOpen ? "close" : "search"}
            size={17}
            color={iconColor}
          />
        </TouchableOpacity>
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
              placeholder={t("filters.searchPlaceholder")}
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

      {/* ── Category accordion ─────────────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => setShowCategories(!showCategories)}
        activeOpacity={0.7}
        accessibilityRole="button"
        className="flex-row items-center justify-between px-4 pb-3"
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="grid-outline" size={15} color="#0E7490" />
          <Text className="text-sm font-quicksandMedium text-gray-600 dark:text-gray-300">
            {t("filters.category", { defaultValue: "Category" })}
            {"  "}
            <Text className="text-cyan-700 font-quicksandBold">
              {activeCategory?.name ?? t("filters.allCategories", { defaultValue: "All" })}
            </Text>
          </Text>
        </View>
        <Ionicons
          name={showCategories ? "chevron-up" : "chevron-down"}
          size={15}
          color={iconColor}
        />
      </TouchableOpacity>

      {showCategories && (
        <View className="flex-row flex-wrap gap-2 px-4 pb-3">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => onCategoryChange(category.id)}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? "bg-cyan-700 border-cyan-700"
                    : "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]"
                }`}
              >
                <Text
                  className={`text-xs font-quicksandMedium ${
                    isSelected ? "text-white" : "text-gray-600 dark:text-gray-300"
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
  );
}