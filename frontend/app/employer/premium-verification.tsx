// app/employer/premium-verification.tsx
import PremiumSuccessModal from "@/components/employer/PremiumSuccessModal";
import { useBusinessVerification } from "@/hooks/useBusinessVerification";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PremiumPlan } from "@/types/verification.types";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PLANS = [
  {
    id: "free" as PremiumPlan,
    name: "Basic",
    price: "Free",
    description: "Standard access for small businesses.",
    features: [
      "Post up to 2 jobs/month",
      "Basic applicant filtering",
      "Standard support",
    ],
  },
  {
    id: "professional" as PremiumPlan,
    name: "Professional",
    price: "$19",
    period: "/month",
    description: "Ideal for growing teams.",
    features: [
      "Post up to 10 jobs/month",
      "Advanced applicant filtering",
      "Talenta Verified Badge",
      "Priority support",
    ],
    isPopular: true,
  },
  {
    id: "business" as PremiumPlan,
    name: "Business",
    price: "$39",
    period: "/month",
    description: "For established companies.",
    features: [
      "Unlimited job posts",
      "AI applicant matching",
      "Talenta Verified Badge",
      "Dedicated account manager",
    ],
  },
  {
    id: "enterprise" as PremiumPlan,
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large organizations.",
    features: [
      "Custom integrations",
      "API access",
      "Talenta Verified Badge",
      "24/7 Premium support",
    ],
  },
];

export default function PremiumVerificationScreen() {
  const { t } = useTranslation("premium");
  const {
    loading: premiumLoading,
    activating,
    plan: currentPlan,
    activatePlan,
  } = usePremiumStatus();
  const { loading: bizLoading, status: bizStatus } = useBusinessVerification();
  const [showSuccess, setShowSuccess] = useState(false);

  if (premiumLoading || bizLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0E7490" />
      </SafeAreaView>
    );
  }

  const handleSubscribe = async (planId: PremiumPlan) => {
    if (planId === "enterprise") {
      Linking.openURL(
        "mailto:support@talenta.app?subject=Enterprise%20Plan%20Inquiry",
      );
      return;
    }
    const success = await activatePlan(planId);
    if (success) setShowSuccess(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ── Back header ────────────────────────────────────────────────── */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#080A08]">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
          {t("employer.header", { defaultValue: "Talenta Premium" })}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Hero intro ───────────────────────────────────────────── */}
        <View className="px-6 pt-8 mb-2 items-center">
          <View className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="star" size={32} color="#0E7490" />
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-900 dark:text-white text-center mb-2">
            {t("employer.hero.title", { defaultValue: "Upgrade Your Hiring" })}
          </Text>
          <Text className="text-base font-quicksandMedium text-gray-500 dark:text-gray-400 text-center px-4">
            {t("employer.hero.subtitle", {
              defaultValue:
                "Get the Talenta Verified Badge, unlock advanced filters, and reach the best candidates faster.",
            })}
          </Text>
        </View>

        <View className="px-6">
          {/* ── Gating alert — kept exactly as-is, it was already good ─ */}
          {bizStatus !== "approved" && (
            <View className="mt-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex-row items-start">
              <Ionicons
                name="information-circle"
                size={20}
                color="#D97706"
                style={{ marginTop: 2 }}
              />
              <View className="ml-3 flex-1">
                <Text className="text-amber-800 dark:text-amber-500 font-quicksandBold text-sm mb-1">
                  {t("employer.gating.title", {
                    defaultValue: "Business Verification Required",
                  })}
                </Text>
                <Text className="text-amber-700 dark:text-amber-600 font-quicksandMedium text-xs leading-4">
                  {t("employer.gating.description", {
                    defaultValue:
                      "You must have an approved business registration to subscribe to Premium plans and receive the Verified badge.",
                  })}
                </Text>
                <TouchableOpacity
                  className="mt-3 bg-amber-600 rounded-xl py-2 px-4 self-start"
                  activeOpacity={0.85}
                  onPress={() => router.push("/employer/business-verification")}
                >
                  <Text className="text-white font-quicksandBold text-xs">
                    {t("employer.gating.cta", {
                      defaultValue: "Verify Business Now",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Plan cards ─────────────────────────────────────────────── */}
          <View className="mt-6" style={{ gap: 16 }}>
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isEnterprise = plan.id === "enterprise";
              // Enterprise has no self-serve Stripe price (custom pricing) —
              // its button always routes to "Contact Sales" instead of Checkout,
              // so it isn't gated behind business verification like real
              // purchasable plans are.
              const canSubscribe =
                isEnterprise ||
                (bizStatus === "approved" && plan.id !== "free" && !isCurrent);

              return (
                <View
                  key={plan.id}
                  className={`bg-white dark:bg-[#0E0E0E] rounded-2xl p-5 border ${
                    isCurrent
                      ? "border-cyan-600 dark:border-cyan-700"
                      : "border-gray-100 dark:border-[#2a2a2a]"
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* ── Plan header ──────────────────────────────────── */}
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-1 mr-3">
                      <View
                        className="flex-row items-center"
                        style={{ gap: 8 }}
                      >
                        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100">
                          {t(`employer.plans.${plan.id}.name`, {
                            defaultValue: plan.name,
                          })}
                        </Text>
                        {/* "Popular" — cyan chip, not blue */}
                        {plan.isPopular && (
                          <View className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-quicksandBold text-cyan-700 dark:text-cyan-400">
                              {t("employer.popularBadge", {
                                defaultValue: "Popular",
                              })}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-1">
                        {t(`employer.plans.${plan.id}.description`, {
                          defaultValue: plan.description,
                        })}
                      </Text>
                    </View>

                    {/* Current plan badge */}
                    {isCurrent && (
                      <View className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 px-2.5 py-1 rounded-full flex-row items-center">
                        <Ionicons name="checkmark" size={11} color="#0E7490" />
                        <Text className="text-xs font-quicksandBold text-cyan-700 dark:text-cyan-400 ml-1">
                          {t("employer.currentBadge", { defaultValue: "Current" })}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* ── Price ────────────────────────────────────────── */}
                  <View className="flex-row items-end mt-3 mb-4">
                    <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100">
                      {plan.price}
                    </Text>
                    {plan.period && (
                      <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mb-0.5 ml-1">
                        {plan.period}
                      </Text>
                    )}
                  </View>

                  {/* ── Features ─────────────────────────────────────── */}
                  <View
                    className="mb-5 pb-4 border-b border-gray-100 dark:border-[#222]"
                    style={{ gap: 10 }}
                  >
                    {plan.features.map((feature, i) => (
                      <View key={i} className="flex-row items-center">
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#0E7490"
                        />
                        <Text className="text-sm font-quicksandMedium text-gray-600 dark:text-gray-300 ml-2.5 flex-1">
                          {t(`employer.plans.${plan.id}.features.${i}`, {
                            defaultValue: feature,
                          })}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* ── Action button ─────────────────────────────────
                      One button color: cyan-700. Disabled = ghost border.
                      No black buttons, no white-on-dark inversion trick. */}
                  {plan.id !== "free" && !isCurrent && (
                    <TouchableOpacity
                      disabled={!canSubscribe || activating}
                      onPress={() => handleSubscribe(plan.id)}
                      activeOpacity={0.85}
                      accessibilityRole="button"
                      className={`w-full rounded-2xl py-3.5 items-center justify-center ${
                        canSubscribe
                          ? "bg-cyan-700"
                          : "bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a]"
                      }`}
                    >
                      {activating ? (
                        <ActivityIndicator
                          size="small"
                          color={canSubscribe ? "#fff" : "#9CA3AF"}
                        />
                      ) : (
                        <Text
                          className={`text-sm font-quicksandBold ${
                            canSubscribe
                              ? "text-white"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {isEnterprise
                            ? t("employer.buttons.contactSales", {
                                defaultValue: "Contact Sales",
                              })
                            : bizStatus !== "approved"
                              ? t("employer.buttons.verificationRequired", {
                                  defaultValue: "Verification Required",
                                })
                              : t("employer.buttons.subscribeNow", {
                                  defaultValue: "Subscribe Now",
                                })}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <PremiumSuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </SafeAreaView>
  );
}
