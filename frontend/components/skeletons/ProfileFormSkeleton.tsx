// components/skeletons/ProfileFormSkeleton.tsx
//
// Mirrors the CompleteProfileScreen layout:
//   - Header bar (back button + title + % pill)
//   - Progress card
//   - Personal Information section card (4 fields)
//   - Location section card (2 fields)
//   - Education & Experience section card (2 chip groups)
//   - Skills section card (input row + empty state)

import { Skeleton } from "moti/skeleton";
import { MotiView } from "moti";
import React from "react";
import { View } from "react-native";
import { SkeletonLine, SkeletonBox, SkeletonPill, useSkeletonColorMode } from "./SkeletonBase";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

// ─── Reusable: a single input field row (label + input box) ──────────────────
const FieldSkeleton = ({ labelWidth = 100 }: { labelWidth?: number }) => {
  const C = useSkeletonColorMode();
  return (
  <View style={{ marginBottom: 16 }}>
    {/* Label */}
    <SkeletonLine width={labelWidth} height={11} />
    <Spacer h={8} />
    {/* Input box */}
    <Skeleton colorMode={C} width="100%" height={46} radius={16} />
  </View>
);
};

// ─── Reusable: a chip group row (label + row of pill placeholders) ────────────
const ChipGroupSkeleton = ({
  labelWidth = 120,
  chips = [80, 88, 72, 96, 80],
}: {
  labelWidth?: number;
  chips?: number[];
}) => {
  const C = useSkeletonColorMode();
  return (
  <View style={{ marginBottom: 20 }}>
    <SkeletonLine width={labelWidth} height={11} />
    <Spacer h={8} />
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {chips.map((w, i) => (
        <Skeleton key={i} colorMode={C} width={w} height={34} radius={999} />
      ))}
    </View>
  </View>
);
};

// ─── Reusable: section card shell (icon dot + title + children) ───────────────
const SectionCardSkeleton = ({ children }: { children: React.ReactNode }) => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#141414] border-gray-100 dark:border-[#2a2a2a]"
    style={{
      marginHorizontal: 24,
      marginTop: 16,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    }}
  >
    {/* Section header: icon circle + title line */}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <Skeleton colorMode={C} width={28} height={28} radius={14} />
      <SkeletonLine width={150} height={13} />
    </View>
    {children}
  </View>
);
};

// ─── Full profile form skeleton ───────────────────────────────────────────────
export const ProfileFormSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View className="flex-1 bg-white dark:bg-[#080A08]">

    {/* ── Header bar ── */}
    <View
      className="border-b border-gray-100 dark:border-[#2a2a2a]"
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
      }}
    >
      {/* Back button */}
      <Skeleton colorMode={C} width={36} height={36} radius={18} />
      <View style={{ width: 12 }} />
      {/* Title */}
      <SkeletonLine width={160} height={16} />
      <View style={{ flex: 1 }} />
      {/* % pill */}
      <Skeleton colorMode={C} width={48} height={26} radius={999} />
    </View>

    {/* ── Scrollable body (staggered sections) ── */}
    <View style={{ flex: 1, paddingBottom: 40 }}>

      {/* Progress card */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 0 }}
      >
        <View
          className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a]"
          style={{
            marginHorizontal: 24,
            marginTop: 20,
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <SkeletonLine width={120} height={11} />
            <SkeletonLine width={32} height={11} />
          </View>
          {/* Progress track */}
          <Skeleton colorMode={C} width="100%" height={8} radius={999} />
          <Spacer h={8} />
          <SkeletonLine width={100} height={10} />
        </View>
      </MotiView>

      {/* Personal Information */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 80 }}
      >
        <SectionCardSkeleton>
          <FieldSkeleton labelWidth={80} />
          <FieldSkeleton labelWidth={75} />
          {/* Phone input — dial code strip + number box */}
          <View style={{ marginBottom: 16 }}>
            <SkeletonLine width={100} height={11} />
            <Spacer h={8} />
            <View style={{ flexDirection: "row", gap: 0 }}>
              <Skeleton colorMode={C} width={90} height={46} radius={16} />
              <View style={{ width: 1 }} />
              
            </View>
          </View>
          {/* Date of birth */}
          <FieldSkeleton labelWidth={95} />
          {/* Gender chips */}
          <ChipGroupSkeleton
            labelWidth={60}
            chips={[60, 68, 52, 120]}
          />
        </SectionCardSkeleton>
      </MotiView>

      {/* Location */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 160 }}
      >
        <SectionCardSkeleton>
          <FieldSkeleton labelWidth={65} />
          <FieldSkeleton labelWidth={40} />
        </SectionCardSkeleton>
      </MotiView>

      {/* Education & Experience */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 240 }}
      >
        <SectionCardSkeleton>
          <ChipGroupSkeleton
            labelWidth={110}
            chips={[90, 110, 108, 104, 72, 52]}
          />
          <ChipGroupSkeleton
            labelWidth={115}
            chips={[90, 104, 62, 60]}
          />
        </SectionCardSkeleton>
      </MotiView>

      {/* Skills */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 320 }}
      >
        <SectionCardSkeleton>
          {/* Add skill row */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <Skeleton colorMode={C} width="82%" height={46} radius={16} />
            <Skeleton colorMode={C} width={46} height={46} radius={16} />
          </View>
          {/* Skill chips placeholder */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[72, 88, 64, 96, 76].map((w, i) => (
              <Skeleton key={i} colorMode={C} width={w} height={30} radius={999} />
            ))}
          </View>
        </SectionCardSkeleton>
      </MotiView>

      {/* CV info note */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 400 }}
      >
        <View
          className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a]"
          style={{
            marginHorizontal: 24,
            marginTop: 16,
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Skeleton colorMode={C} width={20} height={20} radius={10} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonLine width={130} height={12} />
            <SkeletonLine width="90%" height={10} />
            <SkeletonLine width="70%" height={10} />
          </View>
        </View>
      </MotiView>

      {/* Save button */}
      <MotiView
        from={{ opacity: 0, translateY: 6 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 300, delay: 460 }}
      >
        <View style={{ marginHorizontal: 24, marginTop: 24 }}>
          <Skeleton colorMode={C} width="100%" height={52} radius={16} />
        </View>
      </MotiView>

    </View>
  </View>
);
};

export default ProfileFormSkeleton;