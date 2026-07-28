// components/skeletons/JobDetailsSkeleton.tsx
// Full-screen skeleton shown while a job details screen (jobseeker or
// employer view) is fetching data — mirrors the real layout: header,
// company/title block, chip row, and a few content sections.
import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";
import {
  SkeletonCircle,
  SkeletonLine,
  SkeletonPill,
  useSkeletonColorMode,
} from "./SkeletonBase";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

const SectionBox = ({ children }: { children: React.ReactNode }) => (
  <View
    className="mx-4 mb-4 bg-white dark:bg-[#0e0e0e] rounded-2xl p-4 border border-gray-100 dark:border-[#1f1f1f]"
  >
    {children}
  </View>
);

export default function JobDetailsSkeleton() {
  const colorMode = useSkeletonColorMode();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {/* Header */}
      <View className="pt-14 pb-4 px-4 bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#1f1f1f]">
        <View className="flex-row items-center justify-between">
          <Skeleton colorMode={colorMode} width={36} height={36} radius={18} />
          <SkeletonLine width={100} height={14} />
          <Skeleton colorMode={colorMode} width={36} height={36} radius={18} />
        </View>
      </View>

      <View style={{ paddingTop: 20 }}>
        {/* Company + title block */}
        <View className="px-4 pb-4">
          <View className="flex-row items-center mb-4" style={{ gap: 14 }}>
            <SkeletonCircle size={56} />
            <View className="flex-1">
              <SkeletonLine width={90} height={11} />
              <Spacer h={8} />
              <SkeletonLine width="80%" height={18} />
              <Spacer h={8} />
              <SkeletonLine width={110} height={11} />
            </View>
          </View>

          {/* Chips row */}
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            <SkeletonPill width={90} />
            <SkeletonPill width={70} />
            <SkeletonPill width={60} />
          </View>
        </View>

        {/* About the role */}
        <SectionBox>
          <SkeletonLine width={110} height={10} />
          <Spacer h={12} />
          <SkeletonLine width="100%" height={12} />
          <Spacer h={6} />
          <SkeletonLine width="100%" height={12} />
          <Spacer h={6} />
          <SkeletonLine width="60%" height={12} />
        </SectionBox>

        {/* Experience */}
        <SectionBox>
          <SkeletonLine width={140} height={10} />
          <Spacer h={12} />
          <SkeletonLine width="70%" height={12} />
        </SectionBox>

        {/* Skills */}
        <SectionBox>
          <SkeletonLine width={100} height={10} />
          <Spacer h={12} />
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            <SkeletonPill width={64} />
            <SkeletonPill width={80} />
            <SkeletonPill width={56} />
            <SkeletonPill width={72} />
          </View>
        </SectionBox>
      </View>
    </View>
  );
}
