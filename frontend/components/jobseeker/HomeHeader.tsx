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
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Keyboard,
} from "react-native";

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

  const getFirstName = () => {
    if (role === "jobseeker" && profile) {
      const jobseekerProfile = profile as JobseekerProfile;
      return jobseekerProfile.first_name;
    }
    return "Guest";
  };

  const firstName = getFirstName();

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
    <View className="bg-white">
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
            <View
              className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-white"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <ImageBackground
                source={require("@/assets/images/user_.png")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="font-quicksandSemibold text-sm text-gray-500 leading-tight">
              {t("greeting", { firstName })}
            </Text>
          </View>

          {/* Right: search trigger + bell */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={openSearch}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={17} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNotificationsPress}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <View className="absolute -right-0.5 -top-0.5 bg-cyan-700 rounded-full min-w-[14px] h-[14px] items-center justify-center px-0.5 z-10">
                <Text className="text-white font-quicksandBold" style={{ fontSize: 9 }}>
                  1{/* {unreadCount > 99 ? "99+" : unreadCount} */}
                </Text>
              </View>
              <Octicons name="bell" size={17} color="#374151" />
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
            className="flex-1 flex-row items-center bg-gray-50 rounded-full px-4 py-2.5 border border-gray-200 mr-2"
          >
            <Ionicons name="search" size={15} color="#9CA3AF" />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder={t("search.placeholder", { defaultValue: "Search jobs..." })}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-800 font-quicksandMedium text-sm"
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
              Cancel
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
        <Text className="font-quicksandBold text-2xl text-gray-900 leading-tight">
          {t("welcome")}
        </Text>
      </Animated.View>
    </View>
  );
}