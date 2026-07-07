// components/skeletons/AdminListSkeleton.tsx
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";
import { useSkeletonColorMode } from "./SkeletonBase";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

// ─── Single card skeleton ─────────────────────────────────────────────────────

const AdminCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] mb-3 p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header: avatar + name lines + status pill */}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Avatar squircle */}
        <Skeleton colorMode={C} width={44} height={44} radius={12} />
        <View style={{ width: 10 }} />

        {/* Name + subtitle */}
        <View style={{ flex: 1, gap: 6, paddingTop: 2 }}>
          <Skeleton colorMode={C} width="55%" height={13} radius={6} />
          <Skeleton colorMode={C} width="75%" height={11} radius={4} />
        </View>

        {/* Status pill */}
        <Skeleton colorMode={C} width={72} height={24} radius={999} />
      </View>

      <Spacer h={12} />

      {/* Meta row: 3 icon+text pairs */}
      <View style={{ flexDirection: "row", gap: 14 }}>
        <Skeleton colorMode={C} width={64} height={11} radius={4} />
        <Skeleton colorMode={C} width={80} height={11} radius={4} />
        <Skeleton colorMode={C} width={56} height={11} radius={4} />
      </View>

      <Spacer h={12} />

      {/* Divider */}
      <View className="h-px bg-gray-100 dark:bg-[#222]" />

      <Spacer h={12} />

      {/* Document / action row */}
      <View style={{ gap: 8 }}>
        <Skeleton colorMode={C} width="45%" height={11} radius={4} />
        <Skeleton colorMode={C} width="40%" height={11} radius={4} />
      </View>
    </View>
  );
};

// ─── Full list skeleton (header + N staggered cards) ─────────────────────────

interface AdminListSkeletonProps {
  /** Number of card skeletons to render (default: 5) */
  count?: number;
  /** Show a search/filter bar skeleton above the list (default: true) */
  showFilterBar?: boolean;
}

export const AdminListSkeleton: React.FC<AdminListSkeletonProps> = ({
  count = 5,
  showFilterBar = true,
}) => {
  const C = useSkeletonColorMode();
  return (
    <View style={{ flex: 1 }}>
      {/* Screen header skeleton */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 250 }}
        className="bg-white dark:bg-[#080A08]"
        style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 20 }}
      >
        <Skeleton colorMode={C} width={160} height={28} radius={8} />
        <View style={{ height: 6 }} />
        <Skeleton colorMode={C} width={200} height={13} radius={4} />
      </MotiView>

      {/* Optional filter chips bar */}
      {showFilterBar && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 200, delay: 40 }}
          className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]"
          style={{ paddingHorizontal: 24, paddingVertical: 12, flexDirection: "row", gap: 8 }}
        >
          <Skeleton colorMode={C} width={56} height={30} radius={999} />
          <Skeleton colorMode={C} width={80} height={30} radius={999} />
          <Skeleton colorMode={C} width={72} height={30} radius={999} />
        </MotiView>
      )}

      {/* Cards */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 80 + i * 70 }}
          >
            <AdminCardSkeleton />
          </MotiView>
        ))}
      </View>
    </View>
  );
};

export default AdminListSkeleton;
