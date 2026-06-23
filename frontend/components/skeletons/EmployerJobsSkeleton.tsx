// components/skeletons/EmployerJobsSkeleton.tsx
//
// Mirrors the employer Jobs screen layout:
//   - EmployerJobsHeader   (title+subtitle left, "Post Job" button right)
//   - EmployerJobFilters   (search bar + horizontal status chips + category row)
//   - EmployerJobsList     (count header + job cards)
//
// Each section exported individually; full-page EmployerJobsSkeleton combines them.

import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { ScrollView, View } from "react-native";
import { SkeletonLine, useSkeletonColorMode } from "./SkeletonBase";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

// ─── Header ──────────────────────────────────────────────────────────────────
// Title + subtitle on left, "Post Job" pill button on right
export const EmployerJobsHeaderSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#080A08]"
    style={{
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    {/* Left: title + subtitle */}
    <View style={{ gap: 8 }}>
      <SkeletonLine width={130} height={20} />
      <SkeletonLine width={180} height={12} />
    </View>

    {/* Right: Post Job pill button */}
    <Skeleton colorMode={C} width={108} height={38} radius={999} />
  </View>
);
};

// ─── Filters Bar ─────────────────────────────────────────────────────────────
// Search bar → horizontal status chip row → category toggle row
export const EmployerJobsFiltersSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#080A08] border-b border-gray-200 dark:border-[#2a2a2a]"
    style={{
      paddingBottom: 12,
      borderBottomWidth: 1,
    }}
  >
    {/* Search bar */}
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
      <Skeleton colorMode={C} width="100%" height={52} radius={12} />
    </View>

    {/* Status chip row — non-scrollable skeleton placeholders */}
    <View
      style={{
        paddingHorizontal: 16,
        paddingBottom: 8,
        flexDirection: "row",
        gap: 8,
      }}
    >
      {[72, 76, 72, 68, 66, 60].map((w, i) => (
        <Skeleton key={i} colorMode={C} width={w} height={34} radius={999} />
      ))}
    </View>

    {/* Category toggle row */}
    <View
      style={{
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <SkeletonLine width={160} height={13} />
      <Skeleton colorMode={C} width={18} height={18} radius={9} />
    </View>
  </View>
);
};

// ─── Job Card Skeleton ────────────────────────────────────────────────────────
// Mirrors renderJobItem in EmployerJobsList:
//   title + location → type badges → stats row → description → salary + action buttons
const EmployerJobCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
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
      shadowOpacity: 0.03,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    }}
  >
    {/* Header row: title+location left, status badge right */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <View style={{ flex: 1, marginRight: 12, gap: 7 }}>
        <SkeletonLine width="75%" height={16} />
        <SkeletonLine width={120} height={11} />
      </View>
      {/* Status badge pill */}
      <Skeleton colorMode={C} width={64} height={26} radius={999} />
    </View>

    {/* Type badge chips */}
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      <Skeleton colorMode={C} width={86} height={30} radius={999} />
      <Skeleton colorMode={C} width={74} height={30} radius={999} />
    </View>

    {/* Stats row: posted date + days left */}
    <View style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
      <SkeletonLine width={80} height={11} />
      <SkeletonLine width={70} height={11} />
    </View>

    {/* Description lines */}
    <SkeletonLine width="100%" height={11} />
    <Spacer h={5} />
    <SkeletonLine width="80%" height={11} />
    <Spacer h={12} />

    {/* Footer: salary pill left, action buttons right */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Skeleton colorMode={C} width={100} height={32} radius={999} />
      {/* Action buttons: 2 icon circles + 1 primary circle */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Skeleton colorMode={C} width={36} height={36} radius={18} />
        <Skeleton colorMode={C} width={36} height={36} radius={18} />
        <Skeleton colorMode={C} width={36} height={36} radius={18} />
      </View>
    </View>
  </View>
);
};

// ─── Jobs List Skeleton ───────────────────────────────────────────────────────
export const EmployerJobsListSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
    {/* Count header */}
    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
      <SkeletonLine width={160} height={16} />
    </View>

    {/* Cards staggered */}
    {Array.from({ length: count }).map((_, i) => (
      <MotiView
        key={i}
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 280, delay: i * 70 }}
      >
        <EmployerJobCardSkeleton />
      </MotiView>
    ))}
  </View>
);

// ─── Full page skeleton ───────────────────────────────────────────────────────
export const EmployerJobsSkeleton: React.FC = () => (
  <>
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 200, delay: 0 }}
    >
      <EmployerJobsHeaderSkeleton />
    </MotiView>

    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 200, delay: 60 }}
    >
      <EmployerJobsFiltersSkeleton />
    </MotiView>

    <EmployerJobsListSkeleton count={4} />
  </>
);

export default EmployerJobsSkeleton;