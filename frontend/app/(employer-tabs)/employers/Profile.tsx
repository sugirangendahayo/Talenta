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
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EmployerProfile() {
  const { profile, role, signOut, loading } = useAuth();
  const { setIsVisible } = useTabBarVisibility();
  const { t, i18n } = useTranslation(["profile", "common"]);
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const lastScrollY = useRef(0);

  // Get employer profile data
  const employerData =
    role === "employer" && profile ? (profile as EmployerProfileType) : null;

  const handleLogout = () => {
    Alert.alert(t("logout.button"), t("logout.confirm"), [
      {
        text: t("buttons.cancel", { ns: "common" }),
        style: "cancel",
      },
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
      en: t("sections.language.name"),
      fr: t("sections.language.name"),
      rw: t("sections.language.name"),
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
        },
        {
          icon: "people",
          label: t("sections.account.teamManagement"),
          type: "link",
        },
        {
          icon: "verified-user",
          label: t("sections.account.verification"),
          value: employerData?.is_verified
            ? t("status.verified")
            : t("status.pending"),
          type: "link",
        },
        {
          icon: "lock",
          label: t("sections.account.privacy"),
          type: "link",
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
      title: t("sections.preferences.title"),
      icon: "settings-outline",
      items: [
        {
          icon: "notifications",
          label: t("sections.preferences.applicationAlerts"),
          type: "toggle",
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: "email",
          label: t("sections.preferences.emailNotifications"),
          type: "toggle",
          value: emailUpdates,
          onValueChange: setEmailUpdates,
        },
        {
          icon: "filter-list",
          label: t("sections.preferences.defaultFilters"),
          type: "link",
        },
        {
          icon: "schedule",
          label: t("sections.preferences.autoReply"),
          type: "link",
        },
      ],
    },
    {
      title: t("sections.billing.title"),
      icon: "card-outline",
      items: [
        {
          icon: "workspace-premium",
          label: t("sections.billing.currentPlan"),
          value: "Business Pro",
          type: "link",
        },
        {
          icon: "payment",
          label: t("sections.billing.paymentMethod"),
          type: "link",
        },
        {
          icon: "receipt-long",
          label: t("sections.billing.billingHistory"),
          type: "link",
        },
        {
          icon: "upgrade",
          label: t("sections.billing.upgrade"),
          type: "link",
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
        },
        {
          icon: "school",
          label: t("sections.support.resources"),
          type: "link",
        },
        {
          icon: "description",
          label: t("sections.support.terms"),
          type: "link",
        },
        {
          icon: "privacy-tip",
          label: t("sections.support.privacy"),
          type: "link",
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
          {t("title")}
        </Text>
        <Text className="text-gray-500 font-quicksandMedium mt-1">
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
        <View className="mx-6 my-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <View className="flex-row items-center">
            <View className="relative bg-gray-100 rounded-full p-1">
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
              <Text className="text-xl font-quicksandBold text-gray-800">
                {employerData?.company_name || "Company Name"}
              </Text>
              <Text className="text-gray-500 font-quicksandMedium mt-1">
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
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-purple-700 text-xs font-quicksandBold">
                    Business Pro
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="bg-gray-100 p-3 rounded-2xl">
              <Ionicons name="qr-code-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Company Stats */}
          <View className="flex-row mt-6 pt-6 border-t border-gray-100">
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                2
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                {t("stats.activeJobs")}
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                15
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                {t("stats.applicants")}
              </Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="flex-1 items-center">
              <Text className="text-2xl font-quicksandBold text-gray-800">
                23
              </Text>
              <Text className="text-gray-500 font-quicksandMedium text-xs mt-1">
                {t("stats.hired")}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            className="mx-6 mb-6 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
              <Ionicons name={section.icon as any} size={20} color="#0E7490" />
              <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
                {section.title}
              </Text>
            </View>

            {/* Section Items */}
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between px-6 py-4 ${
                  itemIndex !== section.items.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onPress={
                  item.onPress || (item.type === "link" ? () => {} : undefined)
                }
              >
                <View className="flex-row items-center flex-1">
                  <MaterialIcons
                    name={item.icon as any}
                    size={22}
                    color="#6B7280"
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-800 font-quicksandMedium">
                      {item.label}
                    </Text>
                    {item.value && typeof item.value === "string" && (
                      <Text className="text-gray-500 text-sm font-quicksandMedium mt-1">
                        {item.value}
                      </Text>
                    )}
                  </View>
                </View>

                {item.type === "toggle" ? (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: "#D1D5DB", true: "#0E7490" }}
                    thumbColor="#FFFFFF"
                  />
                ) : (
                  <View className="flex-row items-center">
                    {item.value && (
                      <Text className="text-gray-500 font-quicksandMedium mr-2">
                        {item.value}
                      </Text>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Quick Actions */}
        <View className="mx-6 mb-6 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
            <Ionicons name="flash-outline" size={20} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-3">
              {t("quickActions.title")}
            </Text>
          </View>
          <View className="flex-row p-4">
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-cyan-100 p-3 rounded-2xl mb-2">
                <Ionicons name="add-circle-outline" size={24} color="#0E7490" />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                {t("quickActions.postJob")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-green-100 p-3 rounded-2xl mb-2">
                <Ionicons name="people-outline" size={24} color="#059669" />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                {t("quickActions.applicants")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center p-4">
              <View className="bg-purple-100 p-3 rounded-2xl mb-2">
                <Ionicons
                  name="stats-chart-outline"
                  size={24}
                  color="#7C3AED"
                />
              </View>
              <Text className="text-gray-700 font-quicksandMedium text-sm text-center">
                {t("quickActions.analytics")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
      />
    </View>
  );
}
