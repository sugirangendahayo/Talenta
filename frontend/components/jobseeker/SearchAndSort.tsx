import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

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
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
  selectedCategory,
  onCategoryChange,
  onSearchChange,
  searchQuery,
  categories,
}) => {
  const { t } = useTranslation(["home", "common"]);
  return (
    <View className="pb-3">
      <View className="px-4 py-3">
        <View className="flex flex-row items-center bg-gray-50 dark:bg-[#080A08] rounded-full px-4 py-2 shadow-sm border border-gray-100 dark:border-[#222]">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder={t("home:search.placeholder")}
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-gray-800 dark:text-gray-200 font-quicksandMedium text-base"
            onChangeText={onSearchChange}
            value={searchQuery}
          />
          <View className="h-6 w-px bg-gray-300 mx-2" />
          <TouchableOpacity className="flex flex-row items-center bg-cyan-700 dark:bg-cyan-800 rounded-xl px-3 py-2 shadow-sm">
            <Ionicons name="options-outline" size={16} color="white" />
            <Text className="text-white font-quicksandBold text-sm ml-1">
              {t("common:buttons.filter")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
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
                  ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-600 border"
                  : "bg-gray-100 dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a] border"
              }`}
              onPress={() => onCategoryChange(category.id)}
            >
              <Text
                className={`font-quicksandMedium text-sm ${
                  category.id === selectedCategory
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchAndSort;
