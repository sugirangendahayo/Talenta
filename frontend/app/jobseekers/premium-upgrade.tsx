import { useJobseekerPremiumStatus } from "@/hooks/useJobseekerPremiumStatus";
import { JobseekerPremiumPlan } from "@/lib/jobseekerPremiumService";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    price: "5,000 RWF",
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
          Talenta Premium
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <View className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="star" size={32} color="#D97706" />
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-900 dark:text-white text-center mb-2">
            Stand out from the crowd
          </Text>
          <Text className="text-base font-quicksandMedium text-gray-500 dark:text-gray-400 text-center px-4">
            Get noticed by top employers and increase your chances of getting hired.
          </Text>
        </View>

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
                    Most Popular
                  </Text>
                </View>
              )}
              {isCurrent && (
                <View className="absolute -top-3.5 right-6 bg-cyan-600 dark:bg-cyan-500 px-3 py-1 rounded-full">
                  <Text className="text-white font-quicksandBold text-xs">
                    Current Plan
                  </Text>
                </View>
              )}

              <Text className="text-xl font-quicksandBold text-gray-900 dark:text-white mb-2">
                {plan.name}
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
                {plan.description}
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
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {!isCurrent && (
                <TouchableOpacity
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={activating}
                  className={`py-4 rounded-2xl items-center justify-center ${
                    plan.isPopular
                      ? "bg-cyan-700 dark:bg-cyan-600"
                      : "bg-gray-100 dark:bg-[#222]"
                  }`}
                >
                  {activating ? (
                    <ActivityIndicator
                      color={plan.isPopular ? "white" : "#0E7490"}
                    />
                  ) : (
                    <Text
                      className={`font-quicksandBold text-base ${
                        plan.isPopular
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {plan.price === "Free" ? "Downgrade to Free" : "Subscribe Now"}
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
