import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Category {
  id: string;
  name: string;
}

export function HighlightedText({ text, query, style }: { text: string; query: string; style?: any }) {
  if (!query) return <Text style={style}>{text}</Text>;
  // Escape regex special chars
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "gi");
  const parts = text.split(regex);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} className="text-cyan-600 dark:text-cyan-400 font-quicksandBold">{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

interface GlobalSearchModalProps<T> {
  visible: boolean;
  onClose: () => void;
  onSelectSearch: (query: string, categoryId?: string) => void;
  categories?: Category[];
  initialQuery?: string;
  fetchResults?: (query: string) => Promise<T[]>;
  renderResult?: (item: T, query: string) => React.ReactNode;
  /** AsyncStorage key used to persist recent searches for this modal instance.
   * Give each distinct search context (jobs, admin employers, admin jobseekers,
   * etc.) its own key so their "recent searches" histories don't mix. */
  storageKey?: string;
  /** Overridable copy — defaults keep the original job-search wording so
   * existing callers don't need to change anything. */
  placeholder?: string;
  searchForLabel?: (query: string) => string;
  noMatchesLabel?: string;
  recentLabel?: string;
  categoriesLabel?: string;
}

const DEFAULT_RECENT_SEARCHES_KEY = "@recent_job_searches";

export default function GlobalSearchModal<T>({
  visible,
  onClose,
  onSelectSearch,
  categories = [],
  initialQuery = "",
  fetchResults,
  renderResult,
  storageKey = DEFAULT_RECENT_SEARCHES_KEY,
  placeholder,
  searchForLabel,
  noMatchesLabel,
  recentLabel,
  categoriesLabel,
}: GlobalSearchModalProps<T>) {
  const { t } = useTranslation(["home", "common", "jobs"]);
  const { isDark } = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!fetchResults) return;
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const res = await fetchResults(query.trim());
          setResults(res);
        } catch (e) {
          console.error("Failed to fetch search results", e);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, fetchResults]);

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
      loadRecentSearches();
    }
  }, [visible, initialQuery]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  };

  const saveSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    try {
      let updated = [searchQuery.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== searchQuery.trim().toLowerCase())];
      updated = updated.slice(0, 10); // Keep max 10
      setRecentSearches(updated);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  const removeSearch = async (searchQuery: string) => {
    try {
      const updated = recentSearches.filter((s) => s !== searchQuery);
      setRecentSearches(updated);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to remove recent search", e);
    }
  };

  const handleSearch = (searchQuery: string, categoryId?: string) => {
    if (searchQuery.trim()) {
        saveSearch(searchQuery);
    }
    onSelectSearch(searchQuery, categoryId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Header & Search Input */}
          <View className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] flex-row items-center gap-3">
            <TouchableOpacity onPress={onClose} className="p-1" hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color={isDark ? "#f3f4f6" : "#111827"} />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl px-3 py-2.5 gap-2">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder={
                  placeholder ??
                  t("common:search", { defaultValue: "Search for jobs, companies, keywords..." })
                }
                placeholderTextColor="#9CA3AF"
                className="flex-1 font-quicksandMedium text-sm text-gray-800 dark:text-gray-100 py-1 m-0"
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(query)}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="flex-1 pt-2">
            {query.length > 0 ? (
              <View className="flex-1">
                 <TouchableOpacity
                   className="flex-row items-center px-6 py-4 border-b border-gray-50 dark:border-[#141414]"
                   onPress={() => handleSearch(query)}
                 >
                   <View className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center mr-3">
                     <Ionicons name="search" size={18} color="#0E7490" />
                   </View>
                   <Text className="flex-1 font-quicksandBold text-base text-gray-800 dark:text-gray-100">
                     {searchForLabel ? searchForLabel(query) : `Search for "${query}"`}
                   </Text>
                   <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                 </TouchableOpacity>

                 {/* Live Results */}
                 {loading ? (
                   <View className="py-6 items-center">
                     <ActivityIndicator color="#0E7490" />
                   </View>
                 ) : results.length > 0 && renderResult ? (
                   <FlatList
                     data={results}
                     keyExtractor={(_, index) => index.toString()}
                     renderItem={({ item }) => renderResult(item, query)}
                     keyboardShouldPersistTaps="handled"
                   />
                 ) : fetchResults && query.trim().length > 1 ? (
                   <View className="py-6 items-center">
                     <Text className="text-gray-500 font-quicksandMedium text-sm">
                       {noMatchesLabel ??
                         t("jobs:search.noMatches", { defaultValue: "No direct matches found" })}
                     </Text>
                   </View>
                 ) : null}
              </View>
            ) : (
              <View className="flex-1">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <View className="mb-6">
                    <View className="flex-row items-center justify-between px-6 mb-3">
                      <Text className="font-quicksandBold text-sm text-gray-900 dark:text-white">
                        {recentLabel ?? t("jobs:search.recent", { defaultValue: "Recent Searches" })}
                      </Text>
                    </View>
                    {recentSearches.map((s, index) => (
                      <View key={`recent-${index}`} className="flex-row items-center justify-between px-6 py-3">
                        <TouchableOpacity
                          className="flex-1 flex-row items-center gap-3"
                          onPress={() => handleSearch(s)}
                        >
                          <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                          <Text className="font-quicksandMedium text-sm text-gray-700 dark:text-gray-300">
                            {s}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeSearch(s)} hitSlop={10}>
                          <Ionicons name="close" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Categories — omitted entirely when the caller has no natural
                    category/filter concept for this search context. */}
                {categories.length > 0 && (
                <View className="px-6">
                  <Text className="font-quicksandBold text-sm text-gray-900 dark:text-white mb-3">
                    {categoriesLabel ?? t("jobs:search.browseCategories", { defaultValue: "Browse Categories" })}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => handleSearch("", cat.id)}
                        className="flex-row items-center px-4 py-2 bg-gray-50 dark:bg-[#141414] rounded-full border border-gray-100 dark:border-[#2a2a2a]"
                      >
                        <Text className="font-quicksandMedium text-sm text-gray-700 dark:text-gray-300">
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                )}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
