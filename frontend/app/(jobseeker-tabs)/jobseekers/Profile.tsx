import UserAvatar from "@/components/common/UserAvatar";
import LanguageSelector from "@/components/modal/LanguageSelector";
import LogoutSheet from "@/components/modal/LogoutSheet";
import QRCodeModal from "@/components/modal/QRCodeModal";
import { LINKS } from "@/constants/links";
import { useAuth } from "@/contexts/AuthContext";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import { useProfileImage } from "@/hooks/useProfileImage";
import {
  JobseekerProfile as JobseekerProfileType,
  supabase,
} from "@/lib/supabase";
import { openWebPage } from "@/utils/openWebPage";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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

export default function JobseekerProfile() {
  const { profile, role, user, signOut, loading, refreshProfile } = useAuth();
  const { setIsVisible } = useTabBarVisibility();
  const { t, i18n } = useTranslation("profile");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const [logoutSheetVisible, setLogoutSheetVisible] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);

  const lastScrollY = useRef(0);

  const jobseekerData =
    role === "jobseeker" && profile ? (profile as JobseekerProfileType) : null;

  const { pickAndUpload, uploading: uploadingPhoto } = useProfileImage(
    user?.id ?? "",
    "jobseeker_profiles",
    async () => {
      // Refresh context profile when done
      await refreshProfile();
    },
  );

  const calculateCompletion = useCallback(() => {
    if (!jobseekerData) return;
    const fields = [
      jobseekerData.full_name,
      jobseekerData.username,
      jobseekerData.email,
      jobseekerData.phone,
      jobseekerData.date_of_birth,
      jobseekerData.gender,
      jobseekerData.country,
      jobseekerData.city,
      jobseekerData.education_level,
      jobseekerData.experience_level,
      jobseekerData.skills && jobseekerData.skills.length > 0,
      jobseekerData.cv_document_url,
      jobseekerData.profile_image_url,
    ];
    const filledFields = fields.filter((field) => field && field !== "").length;
    setCompletionPercentage(Math.round((filledFields / fields.length) * 100));
  }, [jobseekerData]);

  // Recalculate whenever profile data changes
  useEffect(() => {
    if (jobseekerData) {
      calculateCompletion();
      fetchApplicationCount();
    }
  }, [jobseekerData, calculateCompletion]);

  // Refresh from DB every time this tab comes into focus so % syncs instantly
  // after the user returns from the complete-profile screen
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const fetchApplicationCount = async () => {
    if (!jobseekerData?.id) return;
    try {
      const { count, error } = await supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true })
        .eq("jobseeker_id", jobseekerData.id);
      if (!error && count !== null) setApplicationCount(count);
    } catch (err) {
      console.error("Error fetching application count:", err);
    }
  };

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
    const languageNames: { [key: string]: string } = {
      en: "English",
      fr: "Français",
      rw: "Ikinyarwanda",
    };
    return languageNames[i18n.language] || "English";
  };

  const settingsSections = [
    {
      title: t("sections.account.title", { defaultValue: "Personal Account" }),
      icon: "person-outline",
      items: [
        {
          icon: "edit",
          label: t("sections.account.editProfile", {
            defaultValue: "Edit Profile",
          }),
          type: "link",
          onPress: () => router.push("/jobseekers/complete-profile"),
        },
        {
          icon: "lock",
          label: t("sections.account.privacy", {
            defaultValue: "Privacy & Security",
          }),
          type: "link",
          onPress: () => router.push("/shared/privacy-security"),
        },
        {
          icon: "star",
          label: t("sections.account.premium", {
            defaultValue: "Talenta Premium",
          }),
          type: "link",
          onPress: () => router.push("/jobseekers/premium-upgrade"),
        },
      ],
    },
    {
      title: t("sections.preferences.title", { defaultValue: "Preferences" }),
      icon: "settings-outline",
      items: [
        {
          icon: "translate",
          label: t("sections.language.appLanguage", {
            defaultValue: "App Language",
          }),
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
    {
      title: t("sections.documents.title", { defaultValue: "Documents" }),
      icon: "folder-outline",
      items: [
        {
          icon: "description",
          label: t("sections.documents.resume", {
            defaultValue: "Resume / CV",
          }),
          type: "link",
          onPress: () => router.push("/jobseekers/upload-cv"),
        },
      ],
    },
    {
      title: t("sections.support.title", { defaultValue: "Help & Legal" }),
      icon: "help-outline",
      isExternal: true,
      items: [
        {
          icon: "support-agent",
          label: t("sections.support.contactSupport", {
            defaultValue: "Contact Support",
          }),
          value: undefined,
          type: "link",
          onPress: () => openWebPage(LINKS.support),
        },
        {
          icon: "shield",
          label: t("sections.support.privacy", {
            defaultValue: "Privacy Policy",
          }),
          value: undefined,
          type: "link",
          onPress: () => openWebPage(LINKS.privacy),
        },
        {
          icon: "description",
          label: t("sections.support.terms", {
            defaultValue: "Terms of Service",
          }),
          value: undefined,
          type: "link",
          onPress: () => openWebPage(LINKS.terms),
        },
        {
          icon: "info-outline",
          label: t("sections.support.about", {
            defaultValue: "About Talenta",
          }),
          value: undefined,
          type: "link",
          onPress: () => openWebPage(LINKS.about),
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
          {t("title", { defaultValue: "My Profile" })}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium mt-1">
          {t("subtitle", {
            defaultValue: "Manage your account and preferences",
          })}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Card */}
        <View
          className="mx-6 my-4 bg-white dark:bg-[#080A08] rounded-3xl p-4 border border-gray-100 dark:border-[#222]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
          }}
        >
          {/* Top row: avatar + info + QR */}
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="relative">
              <UserAvatar
                imageUrl={jobseekerData?.profile_image_url}
                name={jobseekerData?.full_name || "JS"}
                size={56}
              />
              <TouchableOpacity
                onPress={pickAndUpload}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 bg-gray-700 dark:bg-gray-600 rounded-full p-1.5 border-2 border-white items-center justify-center"
              >
                {uploadingPhoto ? (
                  <ActivityIndicator
                    size="small"
                    color="white"
                    style={{ transform: [{ scale: 0.5 }] }}
                  />
                ) : (
                  <Feather name="camera" size={11} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Name / username / email / status */}
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-base font-quicksandBold text-gray-900 dark:text-gray-100 leading-tight">
                  {jobseekerData?.full_name || "Your Name"}
                </Text>
                {jobseekerData?.premium_plan === "professional" && (
                  <MaterialIcons name="verified" size={14} color="#6B7280" />
                )}
              </View>
              {/* @username handle */}
              {jobseekerData?.username ? (
                <Text className="text-cyan-600 dark:text-cyan-400 font-quicksandSemibold text-xs mt-0.5">
                  @{jobseekerData.username}
                </Text>
              ) : null}
              <Text
                className="text-gray-400 font-quicksandMedium text-xs mt-0.5"
                numberOfLines={1}
              >
                {jobseekerData?.email || "email@example.com"}
              </Text>
              {/* Status chip */}
              <View className="flex-row items-center gap-1 mt-1.5 self-start bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] px-2.5 py-1 rounded-full">
                <MaterialIcons
                  name={
                    jobseekerData?.profile_completed ? "verified" : "pending"
                  }
                  size={12}
                  color="#6B7280"
                />
                <Text className="text-gray-600 dark:text-gray-400 text-xs font-quicksandBold">
                  {jobseekerData?.profile_completed
                    ? t("status.verified", { defaultValue: "Verified" })
                    : t("status.incomplete", { defaultValue: "Incomplete" })}
                </Text>
              </View>
            </View>

            {/* QR */}
            <TouchableOpacity
              onPress={() => setQrCodeVisible(true)}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center"
            >
              <Ionicons name="qr-code-outline" size={17} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-100 dark:bg-[#141414] mt-4 mb-3" />

          {/* Stats row */}
          <View className="flex-row">
            <View className="flex-1 items-center">
              <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                {applicationCount}
              </Text>
              <Text className="text-gray-400 font-quicksandMedium text-xs mt-0.5">
                {t("stats.applications", { defaultValue: "Applications" })}
              </Text>
            </View>
            <View className="w-px bg-gray-100 dark:bg-[#141414]" />
            <View className="flex-1 items-center">
              <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200">
                {completionPercentage}%
              </Text>
              <Text className="text-gray-400 font-quicksandMedium text-xs mt-0.5">
                {t("stats.profile", { defaultValue: "Profile" })}
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
              <Ionicons name={section.icon as any} size={20} color="#6B7280" />
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
                onPress={
                  item.type === "link" ? (item as any).onPress : undefined
                }
                disabled={item.type !== "link"}
                activeOpacity={0.7}
                accessibilityRole={section.isExternal ? "link" : "button"}
                accessibilityLabel={item.label}
                accessibilityHint={section.isExternal ? "Opens in your browser" : undefined}
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

        {/* Logout Button */}
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

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 font-quicksandMedium text-sm">
            Talenta v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
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
      {user?.id && (
        <QRCodeModal
          visible={qrCodeVisible}
          onClose={() => setQrCodeVisible(false)}
          userId={user.id}
          role="jobseeker"
          displayName={jobseekerData?.full_name || "Your Name"}
          username={jobseekerData?.username}
          avatarUrl={jobseekerData?.profile_image_url}
          verified={jobseekerData?.premium_plan === "professional"}
        />
      )}
    </View>
  );
}
