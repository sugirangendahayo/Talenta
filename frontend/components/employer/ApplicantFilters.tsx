// components/employer/ApplicantFilters.tsx
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
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearchToggle = () => {
    if (searchOpen) {
      onSearchChange("");
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 80);
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
          onPress={handleSearchToggle}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={
            searchOpen
              ? t("filters.closeSearch", { defaultValue: "Close search" })
              : t("filters.openSearch", { defaultValue: "Search applicants" })
          }
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center mr-4"
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
          <View className="flex-row items-center bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl px-4 py-3 gap-3">
            <Ionicons name="search" size={16} color="#9CA3AF" />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={t("filters.searchPlaceholder", {
                defaultValue: "Search applicants…",
              })}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              className="flex-1 font-quicksandMedium text-gray-800 dark:text-gray-100 text-sm"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}