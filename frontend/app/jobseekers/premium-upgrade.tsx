import { useJobseekerPremiumStatus } from "@/hooks/useJobseekerPremiumStatus";
import { JobseekerPremiumPlan } from "@/lib/jobseekerPremiumService";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, Stack, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

// Reuse the same success modal we have for employers, but we can just mock the UI locally if we want, or create a specific one. Let's create a simple inline success view or modal logic here.
import PremiumSuccessModal from "@/components/employer/PremiumSuccessModal";

const PLANS = [
  {
    id: "free" as JobseekerPremiumPlan,
    name: "Basic",
    price: "Free",
    description: "Standard access for jobseekers.",
    features: [
      "Browse and search jobs",
      "Apply to standard jobs",
      "Save jobs for later",
    ],
  },
  {
    id: "professional" as JobseekerPremiumPlan,
    name: "Professional",
    price: "$5",
    period: "/month",
    description: "Stand out to employers.",
    features: [
      "Talenta Verified Badge",
      "Top of applicant lists",
      "See who viewed your profile",
      "Priority application processing",
    ],
    isPopular: true,
  },
];

export default function JobseekerPremiumUpgradeScreen() {
  const {
    loading: premiumLoading,
    activating,
    plan: currentPlan,
    activatePlan,
  } = useJobseekerPremiumStatus();
  
  const { t } = useTranslation("premium");
  const { profile, refreshProfile } = useAuth();
  const isProfileComplete = profile?.profile_completed ?? false;

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
    }, [refreshProfile])
  );

  const [showSuccess, setShowSuccess] = useState(false);

  if (premiumLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0E7490" />
      </SafeAreaView>
    );
  }

  const handleSubscribe = async (planId: JobseekerPremiumPlan) => {
    const success = await activatePlan(planId);
    if (success && planId !== "free") {
        setShowSuccess(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Back header ── */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#080A08]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 dark:bg-[#141414] rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-center mr-10 text-lg font-quicksandBold text-gray-900 dark:text-white">
          {t("jobseeker.header", { defaultValue: "Talenta Premium" })}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <View className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="verified" size={32} color="#D97706" />
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-900 dark:text-white text-center mb-2">
            {t("jobseeker.hero.title", { defaultValue: "Stand out from the crowd" })}
          </Text>
          <Text className="text-base font-quicksandMedium text-gray-500 dark:text-gray-400 text-center px-4">
            {t("jobseeker.hero.subtitle", {
              defaultValue:
                "Get noticed by top employers and increase your chances of getting hired.",
            })}
          </Text>
        </View>

        {!isProfileComplete && (
          <View className="mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#D97706" style={{ marginTop: 2 }} />
            <View className="ml-3 flex-1">
              <Text className="text-amber-800 dark:text-amber-500 font-quicksandBold text-sm mb-1">
                {t("jobseeker.gating.title", { defaultValue: "Profile Incomplete" })}
              </Text>
              <Text className="text-amber-700 dark:text-amber-600 font-quicksandMedium text-xs leading-4 mb-3">
                {t("jobseeker.gating.description", {
                  defaultValue:
                    "You must complete your jobseeker profile before you can upgrade to Premium and receive the Verified badge.",
                })}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/jobseekers/complete-profile")}
                className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-xl self-start"
              >
                <Text className="text-amber-800 dark:text-amber-500 font-quicksandBold text-xs">
                  {t("jobseeker.gating.cta", { defaultValue: "Complete Profile" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          
          return (
            <View
              key={plan.id}
              className={`bg-white dark:bg-[#141414] rounded-3xl p-6 mb-4 border-2 ${
                isCurrent
                  ? "border-cyan-600 dark:border-cyan-500"
                  : plan.isPopular
                  ? "border-amber-400 dark:border-amber-500"
                  : "border-gray-100 dark:border-[#2a2a2a]"
              }`}
            >
              {plan.isPopular && !isCurrent && (
                <View className="absolute -top-3.5 right-6 bg-amber-400 dark:bg-amber-500 px-3 py-1 rounded-full">
                  <Text className="text-amber-900 font-quicksandBold text-xs">
                    {t("jobseeker.popularBadge", { defaultValue: "Most Popular" })}
                  </Text>
                </View>
              )}
              {isCurrent && (
                <View className="absolute -top-3.5 right-6 bg-cyan-600 dark:bg-cyan-500 px-3 py-1 rounded-full">
                  <Text className="text-white font-quicksandBold text-xs">
                    {t("jobseeker.currentBadge", { defaultValue: "Current Plan" })}
                  </Text>
                </View>
              )}

              <Text className="text-xl font-quicksandBold text-gray-900 dark:text-white mb-2">
                {t(`jobseeker.plans.${plan.id}.name`, { defaultValue: plan.name })}
              </Text>
              <View className="flex-row items-end gap-1 mb-3">
                <Text className="text-3xl font-quicksandBold text-cyan-700 dark:text-cyan-400">
                  {plan.price}
                </Text>
                {plan.period && (
                  <Text className="text-gray-500 font-quicksandMedium text-base mb-1">
                    {plan.period}
                  </Text>
                )}
              </View>
              <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-6">
                {t(`jobseeker.plans.${plan.id}.description`, {
                  defaultValue: plan.description,
                })}
              </Text>

              <View className="gap-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <View key={idx} className="flex-row items-center gap-3">
                    <View className="w-5 h-5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#0E7490"
                      />
                    </View>
                    <Text className="text-sm font-quicksandMedium text-gray-700 dark:text-gray-300">
                      {t(`jobseeker.plans.${plan.id}.features.${idx}`, {
                        defaultValue: feature,
                      })}
                    </Text>
                  </View>
                ))}
              </View>

              {plan.id !== "free" && !isCurrent && (
                <TouchableOpacity
                onPress={() => handleSubscribe(plan.id)}
                disabled={activating || !isProfileComplete}
                className={`w-full py-4 rounded-xl items-center justify-center ${
                  !isProfileComplete
                    ? "bg-gray-200 dark:bg-[#1a1a1a]"
                    : "bg-cyan-700 dark:bg-cyan-600"
                }`}
                activeOpacity={0.85}
              >
                {activating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    className={`font-quicksandBold text-base ${
                      !isProfileComplete
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-white"
                    }`}
                  >
                    {isCurrent
                      ? t("jobseeker.buttons.currentPlan", {
                          defaultValue: "Current Plan",
                        })
                      : t("jobseeker.buttons.upgradeTo", {
                          defaultValue: `Upgrade to ${plan.name}`,
                          name: t(`jobseeker.plans.${plan.id}.name`, {
                            defaultValue: plan.name,
                          }),
                        })}
                  </Text>
                )}
              </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View className="h-10" />
      </ScrollView>

      {/* Reusing employer success modal logic (since it just requires a visible flag and onClose, let's verify if PremiumSuccessModal works this way) */}
      <PremiumSuccessModal 
        visible={showSuccess} 
        onClose={() => {
            setShowSuccess(false);
            router.back();
        }} 
      />
    </SafeAreaView>
  );
}
