// components/skeletons/JobCardSkeleton.tsx
//
// Two variants:
//   - "compact"  → matches HomeJobs card (smaller avatar, no description)
//   - "full"     → matches JobsList card (larger avatar, has description snippet)
//
// Usage:
//   <JobCardSkeleton variant="compact" />   // HomeJobs
//   <JobCardSkeleton variant="full" />      // JobsList

import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";
import {
  SkeletonCircle,
  SkeletonLine,
  SkeletonPill,
  SkeletonRoundedSquare,
  useSkeletonColorMode
} from "./SkeletonBase";

// ─── Spacer helper ────────────────────────────────────────────────────────────
const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

// ─── Compact card (HomeJobs) ──────────────────────────────────────────────────
export const CompactJobCardSkeleton: React.FC = () => {
  const COLOR_MODE = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#141414] border-gray-100 dark:border-[#2a2a2a]"
    style={{
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    }}
  >
    {/* Top row: avatar + text block + bookmark */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      {/* Company avatar square */}
      <SkeletonRoundedSquare size={48} radius={12} />

      {/* Text block */}
      <View style={{ flex: 1, marginLeft: 12, marginRight: 12 }}>
        {/* Company name row */}
        <SkeletonLine width={90} height={10} />
        <Spacer h={6} />
        {/* Job title */}
        <SkeletonLine width="85%" height={14} />
        <Spacer h={5} />
        {/* Location */}
        <SkeletonLine width={110} height={10} />
      </View>

      {/* Bookmark icon placeholder */}
      <Skeleton colorMode={COLOR_MODE} width={32} height={32} radius={16} />
    </View>

    {/* Tags row */}
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      <SkeletonPill width={80} />
      <SkeletonPill width={68} />
      <SkeletonPill width={56} />
    </View>

    {/* Footer: salary + apply button */}
    <View
      className="border-t border-gray-100 dark:border-[#2a2a2a]"
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
      }}
    >
      <SkeletonLine width={80} height={12} />
      <Skeleton colorMode={COLOR_MODE} width={64} height={28} radius={999} />
    </View>
  </View>
);
};

// ─── Full card (JobsList) ─────────────────────────────────────────────────────
export const FullJobCardSkeleton: React.FC = () => {
  const COLOR_MODE = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
    style={{
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    }}
  >
    {/* Top row: circle avatar + text block + bookmark */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
      }}
    >
      {/* Circle avatar (JobsList uses rounded circle) */}
      <SkeletonCircle size={64} />

      {/* Text block */}
      <View style={{ flex: 1, marginLeft: 12, marginRight: 12 }}>
        {/* Company name */}
        <SkeletonLine width={100} height={11} />
        <Spacer h={6} />
        {/* Job title */}
        <SkeletonLine width="90%" height={16} />
        <Spacer h={5} />
        {/* Location */}
        <SkeletonLine width={120} height={11} />
      </View>

      {/* Bookmark */}
      <Skeleton colorMode={COLOR_MODE} width={36} height={36} radius={18} />
    </View>

    {/* Tags row */}
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      <SkeletonPill width={88} />
      <SkeletonPill width={72} />
    </View>

    {/* Description snippet (2 lines) */}
    <SkeletonLine width="100%" height={11} />
    <Spacer h={5} />
    <SkeletonLine width="70%" height={11} />
    <Spacer h={12} />

    {/* Footer: salary pill + arrow button */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Skeleton colorMode={COLOR_MODE} width={90} height={32} radius={999} />
      <Skeleton colorMode={COLOR_MODE} width={40} height={40} radius={20} />
    </View>
  </View>
);
};

// ─── Default export (compact by default) ─────────────────────────────────────
interface JobCardSkeletonProps {
  variant?: "compact" | "full";
}

const JobCardSkeleton: React.FC<JobCardSkeletonProps> = ({
  variant = "compact",
}) => {
  return variant === "full" ? (
    <FullJobCardSkeleton />
  ) : (
    <CompactJobCardSkeleton />
  );
};

export default JobCardSkeleton;
