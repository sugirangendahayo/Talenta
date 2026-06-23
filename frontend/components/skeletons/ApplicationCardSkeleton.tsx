// components/skeletons/ApplicationCardSkeleton.tsx
//
// Mirrors the card structure in Applications.tsx:
//   - Top row: company avatar + job title/company + status badge
//   - Two info pills (location + salary)
//   - Applied-at row
//   - Action buttons row (view job + withdraw)

import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";
import { SkeletonLine, SkeletonRoundedSquare, useSkeletonColorMode } from "./SkeletonBase";
import { useTheme } from "@/contexts/ThemeContext";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

export const ApplicationCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  const { isDark } = useTheme();
  
  return (
  <View
    className="bg-white dark:bg-[#080A08] border-gray-200 dark:border-[#2a2a2a]"
    style={{
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    }}
  >
    {/* ── Top row: avatar + title/company + status badge ── */}
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 16 }}>
      {/* Company avatar square */}
      <SkeletonRoundedSquare size={56} radius={12} />

      {/* Title + company name */}
      <View style={{ flex: 1, marginLeft: 16 }}>
        <SkeletonLine width="75%" height={14} />
        <Spacer h={7} />
        <SkeletonLine width={110} height={11} />
      </View>

      {/* Status badge pill */}
      <Skeleton colorMode={C} width={72} height={26} radius={999} />
    </View>

    {/* ── Info pills row: location + salary ── */}
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
      {/* Location pill */}
      <View
        className="bg-gray-50 dark:bg-[#141414]"
        style={{
          flex: 1,
          borderRadius: 12,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Icon placeholder */}
        <Skeleton colorMode={C} width={26} height={26} radius={8} />
        <Skeleton colorMode={C} width={80} height={11} radius={4} />
      </View>

      {/* Salary pill */}
      <View
        className="bg-green-50 dark:bg-green-900/20"
        style={{
          flex: 1,
          borderRadius: 12,
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Skeleton colorMode={C} width={26} height={26} radius={8} />
        <Skeleton colorMode={C} width={68} height={11} radius={4} />
      </View>
    </View>

    {/* ── Applied-at row ── */}
    <View
      className="bg-gray-50 dark:bg-[#141414]"
      style={{
        borderRadius: 12,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <Skeleton colorMode={C} width={26} height={26} radius={8} />
      <Skeleton colorMode={C} width={140} height={11} radius={4} />
    </View>

    {/* ── Action buttons row ── */}
    <View style={{ flexDirection: "row", gap: 8 }}>
      {/* View Job button */}
      <Skeleton colorMode={C} width="48%" height={40} radius={16} />
      {/* Withdraw button */}
      <Skeleton colorMode={C} width="48%" height={40} radius={16} />
    </View>
  </View>
);
};

export default ApplicationCardSkeleton;