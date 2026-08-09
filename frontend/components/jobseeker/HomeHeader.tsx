// components/jobseeker/HomeHeader.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { JobseekerProfile } from "@/lib/supabase";
import Octicons from "@expo/vector-icons/Octicons";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UserAvatar from "@/components/common/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";
import GlobalSearchModal, { HighlightedText } from "../common/GlobalSearchModal";
import { supabase } from "@/lib/supabase";

interface HomeHeaderProps {
  onSearchChange?: (query: string) => void;
}

export default function HomeHeader({ onSearchChange }: HomeHeaderProps) {
  const { profile, role } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation("home");

  const [searchOpen, setSearchOpen] = useState(false);
  const { isDark } = useTheme();

  const jobseekerProfile = role === "jobseeker" && profile ? (profile as JobseekerProfile) : null;
  const fullName = jobseekerProfile?.full_name ?? "Guest";
  const profileImageUrl = jobseekerProfile?.profile_image_url ?? null;
  const avatarName = fullName !== "Guest" ? fullName : "Guest";

  const handleNotificationsPress = () => {
    router.push("/jobseekers/notifications");
  };

  const openSearch = () => {
    setSearchOpen(true);
  };

  return (
    <View className="bg-white dark:bg-[#080A08] ">
      {/* Top row — default content and search bar are stacked, crossfade between them */}
      <View className="px-5 pt-4 pb-3" style={{ height: 80 }}>

        {/* Default row: avatar + greeting + icons */}
        <View
          className="flex-row items-center justify-between"
          style={{ paddingTop: 16 }}
        >
          {/* Left: avatar + greeting */}
          <View className="flex-row items-center gap-3 ">
            <UserAvatar
              imageUrl={profileImageUrl}
              name={avatarName}
              size={38}
              style={{
                borderWidth: 1,
                borderColor: profileImageUrl ? "transparent" : "#E5E7EB",
              }}
            />
            <Text className="font-quicksandSemibold text-sm text-gray-500 dark:text-gray-400 leading-tight">
              {t("greeting", { firstName: fullName })} 
            </Text>
          </View>

          {/* Right: search trigger + bell */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={openSearch}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={17} color="#374151" />
            </TouchableOpacity>
   <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center relative"
            onPress={() => router.push("/jobseekers/notifications")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="notifications-outline"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center border border-white dark:border-[#080A08]">
                <Text className="text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          </View>
        </View>

      </View>

      {/* Welcome text */}
      <View
        className="px-5 pb-4"
      >
        <Text className="font-quicksandBold text-2xl text-gray-900 dark:text-gray-100 leading-tight">
          {t("welcome")}
        </Text>
      </View>

      <GlobalSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        categories={[]} // HomeHeader doesn't render category filters directly
        onSelectSearch={(query) => {
          if (onSearchChange) onSearchChange(query);
          setSearchOpen(false);
          // E.g., push to jobs tab with the query:
          router.push("/jobseekers/jobs"); 
        }}
        fetchResults={async (query) => {
          const { data, error } = await supabase
            .from("jobs")
            .select(`
              id, 
              title, 
              employer_profiles!inner(company_name)
            `)
            .or(`title.ilike.%${query}%,location.ilike.%${query}%`)
            .eq("status", "active")
            .limit(10);
          if (error) {
            console.error(error);
            return [];
          }
          return data;
        }}
        renderResult={(item: any, currentQuery: string) => (
          <TouchableOpacity
            className="flex-row items-center px-6 py-4 border-b border-gray-50 dark:border-[#141414]"
            onPress={() => {
              setSearchOpen(false);
              router.push(`/jobseekers/job-details/${item.id}`);
            }}
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2a2a2a] items-center justify-center mr-3">
              <Ionicons name="briefcase-outline" size={18} color="#9CA3AF" />
            </View>
            <View className="flex-1">
              <HighlightedText
                text={item.title}
                query={currentQuery}
                style={{ fontSize: 15, color: isDark ? "#f3f4f6" : "#1f2937", marginBottom: 2 }}
              />
              <HighlightedText
                text={item.employer_profiles?.company_name || ""}
                query={currentQuery}
                style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280" }}
              />
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
