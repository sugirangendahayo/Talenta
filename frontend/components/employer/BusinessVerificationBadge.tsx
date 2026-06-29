import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BusinessVerificationStatus } from "@/types/verification.types";

interface Props {
  status?: BusinessVerificationStatus;
}

export default function BusinessVerificationBadge({ status = "not_submitted" }: Props) {
  let config = {
    bgClass: "bg-gray-100 dark:bg-[#1e1e1e]",
    borderClass: "border-gray-200 dark:border-[#2a2a2a]",
    textClass: "text-gray-600 dark:text-gray-400",
    iconColor: "#6B7280",
    iconName: "circle" as any,
    label: "Not Submitted",
  };

  switch (status) {
    case "pending_review":
      config = {
        bgClass: "bg-amber-50 dark:bg-amber-900/20",
        borderClass: "border-amber-100 dark:border-amber-900/30",
        textClass: "text-amber-700 dark:text-amber-400",
        iconColor: "#D97706", // amber-600
        iconName: "pending",
        label: "Pending Review",
      };
      break;
    case "approved":
      config = {
        bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
        borderClass: "border-emerald-100 dark:border-emerald-900/30",
        textClass: "text-emerald-700 dark:text-emerald-400",
        iconColor: "#059669", // emerald-600
        iconName: "verified",
        label: "Approved",
      };
      break;
    case "rejected":
      config = {
        bgClass: "bg-red-50 dark:bg-red-900/20",
        borderClass: "border-red-100 dark:border-red-900/30",
        textClass: "text-red-700 dark:text-red-400",
        iconColor: "#DC2626", // red-600
        iconName: "cancel",
        label: "Rejected",
      };
      break;
  }

  return (
    <View
      className={`flex-row items-center gap-1 mt-1.5 self-start px-2.5 py-1 rounded-full border ${config.bgClass} ${config.borderClass}`}
    >
      <MaterialIcons name={config.iconName} size={12} color={config.iconColor} />
      <Text className={`text-xs font-quicksandBold ${config.textClass}`}>
        {config.label}
      </Text>
    </View>
  );
}
