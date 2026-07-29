// components/skeletons/AdminDashboardSkeleton.tsx
// Mirrors the actual admin Dashboard layout section by section so the
// loading state doesn't look like a mismatched, generic placeholder:
//   - Header (title + subtitle + 2 icon buttons)
//   - Platform Overview (2x2 stat card grid)
//   - Quick access (5-row action list)
//   - Recent employers / Recent jobseekers (avatar-row cards)
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";
import {
  SkeletonCircle,
  SkeletonLine,
  useSkeletonColorMode,
} from "./SkeletonBase";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

// ─── Header ──────────────────────────────────────────────────────────────────
const HeaderSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
    <View
      className="bg-white dark:bg-[#080A08]"
      style={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, paddingRight: 16 }}>
        <SkeletonLine width={140} height={26} />
        <Spacer h={8} />
        <SkeletonLine width={180} height={13} />
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Skeleton colorMode={C} width={40} height={40} radius={20} />
        <Skeleton colorMode={C} width={40} height={40} radius={20} />
      </View>
    </View>
  );
};

// ─── Platform Overview (2x2 stat grid) ────────────────────────────────────────
const StatCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] border-gray-100 dark:border-[#2a2a2a]"
      style={{
        width: "47%",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
      }}
    >
      <Skeleton colorMode={C} width={36} height={36} radius={12} />
      <Spacer h={10} />
      <Skeleton colorMode={C} width={48} height={22} radius={6} />
      <Spacer h={6} />
      <SkeletonLine width={70} height={10} />
    </View>
  );
};

const PlatformOverviewSkeleton: React.FC = () => (
  <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
    <SkeletonLine width={150} height={18} />
    <Spacer h={12} />
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <StatCardSkeleton key={i} />
      ))}
    </View>
  </View>
);

// ─── Quick access (5-row action list) ────────────────────────────────────────
const QuickAccessRowSkeleton: React.FC<{ isLast?: boolean }> = ({ isLast }) => {
  const C = useSkeletonColorMode();
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        <Skeleton colorMode={C} width={32} height={32} radius={12} />
        <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
          <SkeletonLine width="55%" height={13} />
          <SkeletonLine width="75%" height={10} />
        </View>
        <Skeleton colorMode={C} width={14} height={14} radius={4} />
      </View>
      {!isLast && (
        <View className="h-px bg-gray-100 dark:bg-[#222]" style={{ marginHorizontal: 16 }} />
      )}
    </View>
  );
};

const QuickAccessSkeleton: React.FC = () => (
  <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
    <SkeletonLine width={90} height={11} style={{ marginLeft: 4 }} />
    <Spacer h={12} />
    <View
      className="bg-white dark:bg-[#0E0E0E] border-gray-100 dark:border-[#2a2a2a]"
      style={{ borderRadius: 16, borderWidth: 1, overflow: "hidden" }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <QuickAccessRowSkeleton key={i} isLast={i === 4} />
      ))}
    </View>
  </View>
);

// ─── Recent list card (New Employers / New Jobseekers) ───────────────────────
const RecentRowSkeleton: React.FC<{ isLast?: boolean }> = ({ isLast }) => (
  <View>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      <SkeletonCircle size={32} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <SkeletonLine width="50%" height={12} />
        <SkeletonLine width="70%" height={10} />
      </View>
      <SkeletonLine width={40} height={10} />
    </View>
    {!isLast && (
      <View className="h-px bg-gray-100 dark:bg-[#222]" style={{ marginHorizontal: 16 }} />
    )}
  </View>
);

const RecentListSkeleton: React.FC<{ titleWidth?: number; rows?: number }> = ({
  titleWidth = 120,
  rows = 3,
}) => {
  const C = useSkeletonColorMode();
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Skeleton colorMode={C} width={28} height={28} radius={8} />
        <SkeletonLine width={titleWidth} height={14} />
      </View>
      <View
        className="bg-white dark:bg-[#0E0E0E] border-gray-100 dark:border-[#2a2a2a]"
        style={{ borderRadius: 16, borderWidth: 1, overflow: "hidden" }}
      >
        {Array.from({ length: rows }).map((_, i) => (
          <RecentRowSkeleton key={i} isLast={i === rows - 1} />
        ))}
      </View>
    </View>
  );
};

// ─── Full admin dashboard skeleton (staggered fade-in) ───────────────────────
export const AdminDashboardSkeleton: React.FC = () => (
  <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
    <HeaderSkeleton />
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 250, delay: 0 }}
    >
      <PlatformOverviewSkeleton />
    </MotiView>

    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 100 }}
    >
      <QuickAccessSkeleton />
    </MotiView>

    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 200 }}
    >
      <RecentListSkeleton titleWidth={110} rows={3} />
    </MotiView>

    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 280 }}
    >
      <RecentListSkeleton titleWidth={125} rows={3} />
    </MotiView>
  </View>
);

export default AdminDashboardSkeleton;
