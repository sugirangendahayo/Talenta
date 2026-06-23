import LanguageSelector from "@/components/modal/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { EmployerProfile as EmployerProfileType } from "@/lib/supabase";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmployerProfile() {
  const { profile, role, user, signOut, loading } = useAuth();
  const { setIsVisible } = useTabBarVisibility();
  const { t, i18n } = useTranslation(["profile", "common"]);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const lastScrollY = useRef(0);

  const employerData =
    role === "employer" && profile ? (profile as EmployerProfileType) : null;

  const handleLogout = () => {
    Alert.alert(t("logout.button"), t("logout.confirm"), [
      { text: t("buttons.cancel", { ns: "common" }), style: "cancel" },
      {
        text: t("logout.button"),
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await signOut();
            router.replace("/auth/signin");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert(t("common.error"), t("logout.error"));
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? "down" : "up";
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
      title: t("sections.account.title"),
      icon: "business-outline",
      items: [
        {
          icon: "edit",
          label: t("sections.account.editProfile"),
          type: "link",
          onPress: undefined,
        },
        {
          icon: "verified-user",
          label: t("sections.account.verification"),
          value: employerData?.is_verified
            ? t("status.verified")
            : t("status.pending"),
          type: "link",
          onPress: undefined,
        },
        {
          icon: "lock",
          label: t("sections.account.privacy"),
          type: "link",
          onPress: undefined,
        },
      ],
    },
    {
      title: t("sections.language.title"),
      icon: "language",
      items: [
        {
          icon: "translate",
          label: t("sections.language.appLanguage"),
          value: getCurrentLanguageName(),
          type: "link",
          onPress: () => setLanguageSelectorVisible(true),
        },
      ],
    },
    {
      title: t("sections.support.title"),
      icon: "help-outline",
      items: [
        {
          icon: "support-agent",
          label: t("sections.support.contactSupport"),
          type: "link",
          onPress: undefined,
        },
        {
          icon: "description",
          label: t("sections.support.terms"),
          type: "link",
          onPress: undefined,
        },
        {
          icon: "privacy-tip",
          label: t("sections.support.privacy"),
          type: "link",
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
      {/* Header */}
      <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-6">
        <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-200">
          {t("title")}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
          {t("subtitle")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Profile Card */}
        <View className="mx-6 my-6 bg-white dark:bg-[#080A08] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-[#2a2a2a]">
          <View className="flex-row items-center">
            <View className="relative bg-gray-100 dark:bg-[#141414] rounded-full p-1">
              <Image
                source={{
                  uri: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png",
                }}
                className="w-20 h-20"
                resizeMode="contain"
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-2 border-2 border-white">
                <Feather name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-200">
                {employerData?.company_name || "Company Name"}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
                {employerData?.email || "email@company.com"}
              </Text>
              <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                <View className="bg-cyan-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                  <MaterialIcons
                    name={employerData?.is_verified ? "verified" : "pending"}
                    size={14}
                    color="#0E7490"
                  />
                  <Text className="text-cyan-700 text-xs font-quicksandBold">
                    {employerData?.is_verified
                      ? t("status.verified")
                      : t("status.pending")}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="bg-gray-100 dark:bg-[#141414] p-3 rounded-2xl">
              <Ionicons name="qr-code-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Company Stats */}
          <View className="flex-row mt-6 pt-6 border-t border-gray-100 dark:border-[#222]">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200">0</Text>
              <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs mt-1">
                {t("stats.activeJobs")}
              </Text>
            </View>
            <View className="w-px bg-gray-200 dark:bg-[#1e1e1e]" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200">0</Text>
              <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs mt-1">
                {t("stats.applicants")}
              </Text>
            </View>
            <View className="w-px bg-gray-200 dark:bg-[#1e1e1e]" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-200">0</Text>
              <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs mt-1">
                {t("stats.hired")}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="mx-6 mb-4 bg-white dark:bg-[#080A08] rounded-3xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] overflow-hidden"
          >
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-[#222]">
              <Ionicons name={section.icon as any} size={20} color="#0E7490" />
              <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 ml-3">
                {section.title}
              </Text>
            </View>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  itemIndex !== section.items.length - 1
                    ? "border-b border-gray-100 dark:border-[#222]"
                    : ""
                }`}
                onPress={item.type === "link" ? (item as any).onPress : undefined}
                disabled={item.type !== "link"}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name={item.icon as any} size={22} color="#6B7280" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-800 dark:text-gray-200 font-quicksandMedium">
                      {item.label}
                    </Text>
                    {item.value && typeof item.value === "string" && (
                      <Text className="text-gray-500 dark:text-gray-400 text-sm font-quicksandMedium mt-0.5">
                        {item.value}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Preferences — Theme only (MVP) */}
        <View className="mx-6 mb-4 bg-white dark:bg-[#080A08] rounded-3xl shadow-sm border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
          <View className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-[#222]">
            <Ionicons name="color-palette-outline" size={20} color="#0E7490" />
            <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 ml-3">
              Preferences
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-between px-6 py-4"
            onPress={() => router.push("/layout/ui/ThemeScreen")}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <MaterialIcons name="brightness-6" size={22} color="#6B7280" />
              <Text className="ml-4 text-gray-800 dark:text-gray-200 font-quicksandMedium">
                Theme
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View className="h-2" />

        {/* Logout Button */}
        <TouchableOpacity
          className="mx-6 mb-8 bg-red-50 rounded-2xl p-4 flex-row items-center justify-center border border-red-200"
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text className="text-red-600 font-quicksandBold text-lg ml-2">
                {t("logout.button")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 font-quicksandMedium text-sm">
            {t("version")}
          </Text>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
        userId={user?.id}
      />
    </View>
  );
}