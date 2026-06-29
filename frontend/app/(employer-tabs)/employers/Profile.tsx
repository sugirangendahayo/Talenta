// app/(employer-tabs)/employers/Profile.tsx
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
import BusinessVerificationBadge from "@/components/employer/BusinessVerificationBadge";
import TalentaVerifiedBadge from "@/components/employer/TalentaVerifiedBadge";

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
    // ── Account ──────────────────────────────────────────────────────────────
    // Edit profile and privacy only — no verification items here.
    {
      title: t("sections.account.title"),
      icon: "business-outline",
      items: [
        {
          icon: "edit",
          label: t("sections.account.editProfile"),
          type: "link",
          onPress: () => router.push("/employer/complete-profile"),
        },
        {
          icon: "lock",
          label: t("sections.account.privacy"),
          type: "link",
          onPress: () => router.push("/shared/privacy-security"),
        },
      ],
    },

    // ── Verification ─────────────────────────────────────────────────────────
    // All three items are one workflow: submit docs → get business verified
    // → unlock premium. They belong together so the employer can follow the
    // steps in order without hunting across multiple sections.
    {
      title: t("sections.verification.title", { defaultValue: "Verification & Premium" }),
      icon: "shield-checkmark-outline",
      items: [

        {
          icon: "verified-user",
          label: t("sections.verification.businessVerification", {
            defaultValue: "Business Verification",
          }),
          type: "link",
          onPress: () => router.push("/employer/business-verification"),
        },
        {
          icon: "star",
          label: t("sections.verification.premium", {
            defaultValue: "Talenta Premium",
          }),
          type: "link",
          onPress: () => router.push("/employer/premium-verification"),
       
        },
      ],
    },

    // ── Preferences ───────────────────────────────────────────────────────────
    {
      title: t("sections.preferences.title", { defaultValue: "Preferences" }),
      icon: "settings-outline",
      items: [
        {
          icon: "translate",
          label: t("sections.language.appLanguage"),
          value: getCurrentLanguageName(),
          type: "link",
          onPress: () => setLanguageSelectorVisible(true),
        },
        {
          icon: "brightness-6",
          label: t("sections.preferences.theme", { defaultValue: "Theme" }),
          type: "link",
          onPress: () => router.push("/layout/ui/ThemeScreen"),
        },
      ],
    },

    // ── Support ───────────────────────────────────────────────────────────────
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
      {/* ── Header ─────────────────────────────────────────────────────── */}
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
        {/* ── Company profile card ────────────────────────────────────── */}
        <View
          className="mx-6 my-4 bg-white dark:bg-[#0E0E0E] rounded-3xl p-4 border border-gray-100 dark:border-[#222]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          {/* Top row: logo + info + QR */}
          <View className="flex-row items-center">
            <View className="relative">
              <View className="bg-gray-100 dark:bg-[#141414] rounded-2xl p-1">
                <Image
                  source={{
                    uri: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png",
                  }}
                  className="w-14 h-14 rounded-2xl"
                  resizeMode="contain"
                />
              </View>
              <TouchableOpacity className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-1.5 border-2 border-white dark:border-[#0E0E0E]">
                <Feather name="camera" size={11} color="white" />
              </TouchableOpacity>
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-base font-quicksandBold text-gray-900 dark:text-gray-100 leading-tight">
                {employerData?.company_name || "Company Name"}
              </Text>
              <Text
                className="text-gray-400 font-quicksandMedium text-xs mt-0.5"
                numberOfLines={1}
              >
                {employerData?.email || "email@company.com"}
              </Text>
              <View className="flex-col mt-2" style={{ gap: 6 }}>
                <BusinessVerificationBadge
                  status={employerData?.business_verification_status}
                />
                <TalentaVerifiedBadge
                  businessStatus={employerData?.business_verification_status}
                  premiumPlan={employerData?.premium_plan}
                />
              </View>
            </View>

            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="qr-code-outline" size={17} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 dark:bg-[#222] mt-4 mb-3" />

          {/* Stats row */}
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                0
              </Text>
              <Text className="text-gray-400 font-quicksandMedium text-xs mt-0.5">
                {t("stats.activeJobs")}
              </Text>
            </View>
            <View className="w-px bg-gray-100 dark:bg-[#222]" />
            <View className="flex-1 items-center">
              <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                0
              </Text>
              <Text className="text-gray-400 font-quicksandMedium text-xs mt-0.5">
                {t("stats.applicants")}
              </Text>
            </View>
            <View className="w-px bg-gray-100 dark:bg-[#222]" />
            <View className="flex-1 items-center">
              <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                0
              </Text>
              <Text className="text-gray-400 font-quicksandMedium text-xs mt-0.5">
                {t("stats.hired")}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Settings sections ───────────────────────────────────────── */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="mx-6 mb-4 bg-white dark:bg-[#0E0E0E] rounded-3xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Section header */}
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100 dark:border-[#222]">
              <Ionicons
                name={section.icon as any}
                size={20}
                color="#0E7490"
              />
              <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200 ml-3">
                {section.title}
              </Text>
            </View>

            {/* Section rows */}
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  itemIndex !== section.items.length - 1
                    ? "border-b border-gray-100 dark:border-[#222]"
                    : ""
                }`}
                onPress={
                  item.type === "link" ? (item as any).onPress : undefined
                }
                disabled={item.type !== "link"}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialIcons
                    name={item.icon as any}
                    size={22}
                    color="#6B7280"
                  />
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

        <View className="h-2" />

        {/* ── Logout ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          className="mx-6 mb-8 bg-red-50 dark:bg-red-900/10 rounded-2xl p-4 flex-row items-center justify-center border border-red-200 dark:border-red-900/30"
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.85}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text className="text-red-600 dark:text-red-400 font-quicksandBold text-lg ml-2">
                {t("logout.button")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── App version ─────────────────────────────────────────────── */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 dark:text-gray-600 font-quicksandMedium text-sm">
            {t("version")}
          </Text>
        </View>
      </ScrollView>

      {/* Language selector modal */}
      <LanguageSelector
        visible={languageSelectorVisible}
        onClose={() => setLanguageSelectorVisible(false)}
        userId={user?.id}
      />
    </View>
  );
}