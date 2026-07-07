// app/(admin-tabs)/admin/Profile.tsx
import LanguageSelector from "@/components/modal/LanguageSelector";
import LogoutSheet from "@/components/modal/LogoutSheet";
import { useAuth } from "@/contexts/AuthContext";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminProfile() {
  const { user, signOut, loading } = useAuth();
  const { setIsVisible } = useTabBarVisibility();
  const { t, i18n } = useTranslation(["profile", "common"]);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const lastScrollY = useRef(0);

  const handleLogout = () => {
    setLogoutSheetVisible(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setLogoutSheetVisible(false);
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        t("messages.error", { defaultValue: "Error" }),
        t("logout.error", {
          defaultValue: "Failed to log out. Please try again.",
        }),
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection =
      currentScrollY > lastScrollY.current ? "down" : "up";
    if (scrollDirection === "down" && currentScrollY > 50) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  const getCurrentLanguageName = () => {
    const languages: { [key: string]: string } = {
      en: "English",
      fr: "Français",
      rw: "Ikinyarwanda",
    };
    return languages[i18n.language] || "English";
  };

  const settingsSections = [
    {
      title: t("sections.administration.title", { defaultValue: "Administration" }),
      icon: "shield-checkmark-outline" as const,
      items: [
        {
          icon: "flag" as const,
          label: t("sections.administration.reports", { defaultValue: "Reports" }),
          value: undefined,
          onPress: () => router.push("/(admin-tabs)/admin/Reports"),
        },
      ],
    },
    {
      title: t("sections.account.title", { defaultValue: "Account" }),
      icon: "person-outline" as const,
      items: [
        {
          icon: "lock" as const,
          label: t("sections.account.privacy", {
            defaultValue: "Privacy & Security",
          }),
          value: undefined,
          onPress: () => router.push("/shared/privacy-security"),
        },
      ],
    },
    {
      title: t("sections.preferences.title", { defaultValue: "Preferences" }),
      icon: "settings-outline" as const,
      items: [
        {
          icon: "translate" as const,
          label: t("sections.language.appLanguage", {
            defaultValue: "App Language",
          }),
          value: getCurrentLanguageName(),
          onPress: () => setLanguageSelectorVisible(true),
        },
        {
          icon: "brightness-6" as const,
          label: t("sections.preferences.theme", { defaultValue: "Theme" }),
          value: undefined,
          onPress: () => router.push("/layout/ui/ThemeScreen"),
        },
      ],
    },
    {
      title: t("sections.support.title", { defaultValue: "Support" }),
      icon: "help-outline" as const,
      items: [
        {
          icon: "support-agent" as const,
          label: t("sections.support.contactSupport", {
            defaultValue: "Contact Support",
          }),
          value: undefined,
          onPress: undefined,
        },
        {
          icon: "description" as const,
          label: t("sections.support.terms", {
            defaultValue: "Terms of Service",
          }),
          value: undefined,
          onPress: undefined,
        },
        {
          icon: "privacy-tip" as const,
          label: t("sections.support.privacy", {
            defaultValue: "Privacy Policy",
          }),
          value: undefined,
          onPress: undefined,
        },
      ],
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* ── Header ── */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
            {t("title", { defaultValue: "Profile" })}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
            {t("subtitle", { defaultValue: "Account & settings" })}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Admin Identity Card ── */}
        <View
          className="mx-6 mt-4 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] p-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {/* Avatar row */}
          <View className="flex-row items-center">
            {/* Avatar squircle */}
            <View className="relative">
              <View className="w-[60px] h-[60px] rounded-full bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] items-center justify-center">
                <Ionicons name="shield-checkmark" size={28} color="#6B7280" />
              </View>
              {/* Online dot */}
              <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0E0E0E]" />
            </View>

            {/* Info */}
            <View className="ml-3 flex-1">
              <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100 leading-tight">
                {t("adminLabel", { defaultValue: "Administrator" })}
              </Text>
              <Text
                className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs mt-0.5"
                numberOfLines={1}
              >
                {user?.email ?? ""}
              </Text>
              {/* Role badge */}
              <View className="flex-row items-center gap-x-1 mt-1.5 self-start bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] px-2.5 py-1 rounded-full">
                <View className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-quicksandBold">
                  {t("roleAdmin", { defaultValue: "Admin" })}
                </Text>
              </View>
            </View>

            {/* QR stub */}
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {}}
            >
              <Ionicons name="qr-code-outline" size={17} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Settings Sections ── */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="mx-6 mb-3 bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Section header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-[#222]">
              <View className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] items-center justify-center">
                <Ionicons name={section.icon} size={15} color="#6B7280" />
              </View>
              <Text className="text-[15px] font-quicksandBold text-gray-900 dark:text-gray-100 ml-2">
                {section.title}
              </Text>
            </View>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between px-4 py-3.5 ${
                  itemIndex !== section.items.length - 1
                    ? "border-b border-gray-100 dark:border-[#222]"
                    : ""
                }`}
                onPress={item.onPress}
                disabled={!item.onPress}
                activeOpacity={0.7}
                hitSlop={{ top: 4, bottom: 4, left: 0, right: 0 }}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name={item.icon} size={20} color="#6B7280" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-quicksandMedium text-gray-800 dark:text-gray-100">
                      {item.label}
                    </Text>
                    {item.value && (
                      <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
                        {item.value}
                      </Text>
                    )}
                  </View>
                </View>
                {item.onPress && (
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* ── Sign Out ── */}
        <TouchableOpacity
          className="mx-6 mb-8 p-4 flex-row items-center justify-center  "
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <Text className="text-red-600 font-quicksandBold text-lg ml-2">
                {t("logout.button", { defaultValue: "Log Out" })}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── App version ── */}
        <View className="items-center">
          <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs">
            {t("version", { defaultValue: "Talenta v1.0.0" })}
          </Text>
        </View>
      </ScrollView>

      {/* ── Language Selector Modal ── */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
        userId={user?.id}
      />
      <LogoutSheet
        visible={logoutSheetVisible}
        onClose={() => setLogoutSheetVisible(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
        title={t("logout.button", { defaultValue: "Log Out" })}
        message={t("logout.confirm", {
          defaultValue: "Are you sure you want to log out?",
        })}
        confirmLabel={t("logout.button", { defaultValue: "Log Out" })}
      />
    </View>
  );
}
