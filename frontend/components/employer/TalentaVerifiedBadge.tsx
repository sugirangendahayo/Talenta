import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BusinessVerificationStatus, PremiumPlan } from "@/types/verification.types";

interface Props {
  businessStatus?: BusinessVerificationStatus;
  premiumPlan?: PremiumPlan;
  className?: string;
}

export default function TalentaVerifiedBadge({ businessStatus, premiumPlan, className = "" }: Props) {
  // Only show if business is approved AND they have a paid plan
  if (businessStatus !== "approved" || !premiumPlan || premiumPlan === "free") {
    return null;
  }

  return (
    <View
      className={`flex-row items-center gap-1 self-start px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 ${className}`}
    >
      <MaterialIcons name="verified" size={12} color="#2563EB" />
      <Text className="text-xs font-quicksandBold text-blue-700 dark:text-blue-400">
        Talenta Verified
      </Text>
    </View>
  );
}
