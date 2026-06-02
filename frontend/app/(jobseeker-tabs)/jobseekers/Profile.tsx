import LanguageSelector from "@/components/modal/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useTabBarVisibility } from "@/contexts/TabBarVisibilityContext";
import {
  JobseekerProfile as JobseekerProfileType,
  supabase,
} from "@/lib/supabase";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobseekerProfile() {
  const { profile, role, user, signOut, loading } = useAuth();
  const { setIsVisible } = useTabBarVisibility();
  const { t, i18n } = useTranslation("profile");
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  const lastScrollY = useRef(0);

  const jobseekerData =
    role === "jobseeker" && profile ? (profile as JobseekerProfileType) : null;

  useEffect(() => {
    if (jobseekerData) {
      calculateCompletion();
      fetchApplicationCount();
    }
  }, [jobseekerData]);

  const calculateCompletion = () => {
    if (!jobseekerData) return;
    const fields = [
      jobseekerData.first_name,
      jobseekerData.last_name,
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
    ];
    const filledFields = fields.filter((field) => field).length;
    setCompletionPercentage(Math.round((filledFields / fields.length) * 100));
  };

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
    Alert.alert(
      t("logout.button", { defaultValue: "Log Out" }),
      t("logout.confirm", { defaultValue: "Are you sure you want to log out?" }),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await signOut();
              router.replace("/auth/signin");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(
                t("messages.error", { defaultValue: "Error" }),
                t("logout.error", { defaultValue: "Failed to log out. Please try again." })
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
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
          label: t("sections.account.editProfile", { defaultValue: "Edit Profile" }),
          type: "link",
          onPress: () => router.push("/jobseekers/complete-profile"),
        },
        {
          icon: "lock",
          label: t("sections.account.privacy", { defaultValue: "Privacy & Security" }),
          type: "link",
          onPress: undefined,
        },
      ],
    },
    {
      title: t("sections.language.title", { defaultValue: "Language" }),
      icon: "language",
      items: [
        {
          icon: "translate",
          label: t("sections.language.appLanguage", { defaultValue: "App Language" }),
          value: getCurrentLanguageName(),
          type: "link",
          onPress: () => setLanguageSelectorVisible(true),
        },
      ],
    },
    {
      title: t("sections.preferences.title", { defaultValue: "Notifications" }),
      icon: "notifications-outline",
      items: [
        {
          icon: "notifications",
          label: t("sections.preferences.jobAlerts", { defaultValue: "Job Alerts" }),
          type: "toggle",
          value: jobAlerts,
          onValueChange: setJobAlerts,
        },
        {
          icon: "email",
          label: t("sections.preferences.emailNotifications", { defaultValue: "Email Notifications" }),
          type: "toggle",
          value: notifications,
          onValueChange: setNotifications,
        },
      ],
    },
    {
      title: t("sections.documents.title", { defaultValue: "Documents" }),
      icon: "folder-outline",
      items: [
        {
          icon: "description",
          label: t("sections.documents.resume", { defaultValue: "Resume / CV" }),
          type: "link",
          onPress: () => router.push("/jobseekers/upload-cv"),
        },
      ],
    },
    {
      title: t("sections.support.title", { defaultValue: "Support & Legal" }),
      icon: "help-outline",
      items: [
        {
          icon: "support-agent",
          label: t("sections.support.contactSupport", { defaultValue: "Contact Support" }),
          type: "link",
          onPress: undefined,
        },
        {
          icon: "description",
          label: t("sections.support.terms", { defaultValue: "Terms & Conditions" }),
          type: "link",
          onPress: undefined,
        },
        {
          icon: "privacy-tip",
          label: t("sections.support.privacy", { defaultValue: "Privacy Policy" }),
          type: "link",
          onPress: undefined,
        },
      ],
    },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-6">
        <Text className="text-3xl font-quicksandBold text-gray-800">
          {t("title", { defaultValue: "My Profile" })}
        </Text>
        <Text className="text-gray-500 font-quicksandMedium mt-1">
          {t("subtitle", { defaultValue: "Manage your account and preferences" })}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Card */}
        <View className="mx-6 my-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center">
            <View className="relative">
              <Image
                source={require("@/assets/images/user_.png")}
                className="w-20 h-20 rounded-full"
                resizeMode="cover"
              />
              <TouchableOpacity className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-2 border-2 border-white">
                <Feather name="camera" size={14} color="white" />
              </TouchableOpacity>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-quicksandBold text-gray-800">
                {jobseekerData?.first_name && jobseekerData?.last_name
                  ? `${jobseekerData.first_name} ${jobseekerData.last_name}`
                  : "Your Name"}
              </Text>
              <Text className="text-gray-500 font-quicksandMedium mt-1">
                {jobseekerData?.email || "email@example.com"}
              </Text>
              <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                <View className="bg-cyan-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                  <MaterialIcons
                    name={jobseekerData?.profile_completed ? "verified" : "pending"}
                    size={14}
                    color="#0E7490"
                  />
                  <Text className="text-cyan-700 text-xs font-quicksandBold">
                    {jobseekerData?.profile_completed
                      ? t("status.verified", { defaultValue: "Verified" })
                      : t("status.incomplete", { defaultValue: "Incomplete" })}
                  </Text>
                </View>
                {jobseekerData?.experience_level && (
                  <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-purple-700 text-xs font-quicksandBold">
                      {jobseekerData.experience_level}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-2xl">
              <Ionicons name="qr-code-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Profile Stats */}
          <View className="flex-row mt-6 pt-6 border-t border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                {applicationCount}
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                {t("stats.applications", { defaultValue: "Applications" })}
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">0</Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                {t("stats.interviews", { defaultValue: "Interviews" })}
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                {completionPercentage}%
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                {t("stats.profile", { defaultValue: "Profile" })}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="mx-6 mb-4 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
              <Ionicons name={section.icon as any} size={20} color="#0E7490" />
              <Text className="text-base font-quicksandBold text-gray-800 ml-3">
                {section.title}
              </Text>
            </View>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  itemIndex !== section.items.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onPress={item.type === "link" ? (item as any).onPress : undefined}
                disabled={item.type !== "link"}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialIcons name={item.icon as any} size={22} color="#6B7280" />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-800 font-quicksandMedium">
                      {item.label}
                    </Text>
                    {item.value && typeof item.value === "string" && item.type !== "toggle" && (
                      <Text className="text-gray-500 text-sm font-quicksandMedium mt-0.5">
                        {item.value}
                      </Text>
                    )}
                  </View>
                </View>

                {item.type === "toggle" ? (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={(item as any).onValueChange}
                    trackColor={{ false: "#D1D5DB", true: "#0E7490" }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

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
    </View>
  );
}