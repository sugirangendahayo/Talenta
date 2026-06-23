// components/jobseeker/applications/StatusFilterBar.tsx
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { APPLICATION_FILTERS } from "@/constants/applicationStatus";
import type { ApplicationFilterId } from "@/types/appication";

interface StatusFilterBarProps {
  activeFilter: ApplicationFilterId;
  onChange: (filter: ApplicationFilterId) => void;
}

export default function StatusFilterBar({ activeFilter, onChange }: StatusFilterBarProps) {
  const { t } = useTranslation("jobs");

  return (
    <View className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#222]">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, gap: 8 }}
      >
        {APPLICATION_FILTERS.map((filterId) => {
          const isActive = filterId === activeFilter;
          return (
            <TouchableOpacity
              key={filterId}
              onPress={() => onChange(filterId)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              className={`px-4 py-2 rounded-full border ${
                isActive ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-700" : "bg-white dark:bg-[#080A08] border-gray-200 dark:border-[#2a2a2a]"
              }`}
            >
              <Text
                className={`font-quicksandMedium text-sm ${
                  isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {t(`applications.filters.${filterId}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}