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
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Keyboard,
} from "react-native";
import UserAvatar from "@/components/common/UserAvatar";
import { useTheme } from "@/contexts/ThemeContext";

interface HomeHeaderProps {
  onSearchChange?: (query: string) => void;
}

export default function HomeHeader({ onSearchChange }: HomeHeaderProps) {
  const { profile, role } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation("home");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Controls the whole-row crossfade: 0 = default content, 1 = search bar
  const transition = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
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
    Animated.timing(transition, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setSearchQuery("");
    onSearchChange?.("");
    Animated.timing(transition, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start(() => setSearchOpen(false));
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  // Default content fades out as transition goes 0→1
  const defaultOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  // Search row fades in as transition goes 0→1
  const searchOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  // Welcome text slides up and fades out
  const welcomeOpacity = transition.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const welcomeTranslateY = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <View className="bg-white dark:bg-[#080A08]">
      {/* Top row — default content and search bar are stacked, crossfade between them */}
      <View className="px-5 pt-4 pb-3" style={{ height: 60 }}>

        {/* Default row: avatar + greeting + icons — fades out when search opens */}
        <Animated.View
          className="flex-row items-center justify-between absolute left-5 right-5"
          style={{ opacity: defaultOpacity, top: 16 }}
          pointerEvents={searchOpen ? "none" : "auto"}
        >
          {/* Left: avatar + greeting */}
          <View className="flex-row items-center gap-3">
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
        </Animated.View>

        {/* Search row — fades in and fills the whole width when open */}
        <Animated.View
          className="flex-row items-center absolute left-5 right-5"
          style={{ opacity: searchOpacity, top: 12 }}
          pointerEvents={searchOpen ? "auto" : "none"}
        >
          {/* Search input — takes all available space */}
          <View
            className="flex-1 flex-row items-center bg-gray-50 dark:bg-[#080A08] rounded-full px-4 py-2.5 border border-gray-200 dark:border-[#2a2a2a] mr-2"
          >
            <Ionicons name="search" size={15} color="#9CA3AF" />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder={t("search.placeholder", { defaultValue: "Search jobs..." })}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-800 dark:text-gray-200 font-quicksandMedium text-sm"
              returnKeyType="search"
              autoCapitalize="none"
            />
          </View>

          {/* Cancel button */}
          <TouchableOpacity
            onPress={closeSearch}
            activeOpacity={0.7}
          >
            <Text className="text-cyan-700 font-quicksandBold text-sm">
              {t("search.cancel")}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Welcome text — fades + slides up when search opens */}
      <Animated.View
        className="px-5 pb-4"
        style={{
          opacity: welcomeOpacity,
          transform: [{ translateY: welcomeTranslateY }],
        }}
      >
        <Text className="font-quicksandBold text-2xl text-gray-900 dark:text-gray-100 leading-tight">
          {t("welcome")}
        </Text>
      </Animated.View>
    </View>
  );
}
