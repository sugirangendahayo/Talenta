// components/skeletons/DashboardSkeleton.tsx
//
// Mirrors the employer Dashboard layout section by section:
//   - DashboardHeader (avatar + greeting + icon button)
//   - StatCards (2×2 grid of stat cards)
//   - AttentionSection (card with applicant list rows)
//   - ActiveJobsSection (card with job sub-cards)
//   - RecentContactsSection (card with contact sub-cards)
//
// Each section is exported individually so you can mix/match
// if any section loads independently in the future.

import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { View } from "react-native";
import { SkeletonCircle, SkeletonLine, useSkeletonColorMode } from "./SkeletonBase";

const Spacer = ({ h }: { h: number }) => <View style={{ height: h }} />;

// ─── Header ──────────────────────────────────────────────────────────────────
export const DashboardHeaderSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#2a2a2a]"
    style={{
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* Left: avatar circle + greeting lines */}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <SkeletonCircle size={44} />
      <View style={{ gap: 6 }}>
        <SkeletonLine width={80} height={10} />
        <SkeletonLine width={120} height={14} />
      </View>
    </View>

    {/* Right: icon button */}
    <Skeleton colorMode={C} width={36} height={36} radius={18} />
  </View>
);
};

// ─── Stat Cards (2×2 grid) ────────────────────────────────────────────────────
const StatCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
    style={{
      flex: 1,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      marginHorizontal: 4,
      alignItems: "center",
    }}
  >
    {/* Icon circle */}
    <Skeleton colorMode={C} width={48} height={48} radius={24} />
    <Spacer h={8} />
    {/* Big number */}
    <Skeleton colorMode={C} width={40} height={22} radius={6} />
    <Spacer h={6} />
    {/* Label */}
    <SkeletonLine width={64} height={10} />
  </View>
);
};

export const StatCardsSkeleton: React.FC = () => (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
      paddingVertical: 16,
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <View key={i} style={{ width: "50%", marginBottom: 12 }}>
        <StatCardSkeleton />
      </View>
    ))}
  </View>
);

// ─── Section card shell (shared by Attention, ActiveJobs, RecentContacts) ────
const SectionShell = ({ children }: { children: React.ReactNode }) => (
  <View style={{ marginHorizontal: 16, marginVertical: 8 }}>
    <View
      className="bg-white dark:bg-[#141414] border-gray-100 dark:border-[#2a2a2a]"
      style={{
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
      }}
    >
      {children}
    </View>
  </View>
);

// ─── Section header row (icon circle + two lines + "View all" stub) ───────────
const SectionHeaderSkeleton: React.FC<{ titleWidth?: number }> = ({
  titleWidth = 140,
}) => {
  const C = useSkeletonColorMode();
  return (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Skeleton colorMode={C} width={32} height={32} radius={16} />
      <View style={{ gap: 5 }}>
        <SkeletonLine width={titleWidth} height={13} />
        <SkeletonLine width={100} height={10} />
      </View>
    </View>
    {/* "View all" */}
    <Skeleton colorMode={C} width={58} height={16} radius={4} />
  </View>
);
};

// ─── Attention Section ────────────────────────────────────────────────────────
// Each row: avatar circle + name+job lines + match chip + chevron
const ApplicantRowSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="border-b border-gray-50 dark:border-[#222]"
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
    }}
  >
    {/* Avatar */}
    <SkeletonCircle size={32} />
    <View style={{ width: 12 }} />

    {/* Name + job title */}
    <View style={{ flex: 1, gap: 5 }}>
      <SkeletonLine width="60%" height={12} />
      <SkeletonLine width="40%" height={10} />
    </View>

    {/* Match chip + chevron */}
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Skeleton colorMode={C} width={72} height={26} radius={999} />
      <Skeleton colorMode={C} width={14} height={14} radius={7} />
    </View>
  </View>
);
};

export const AttentionSectionSkeleton: React.FC = () => (
  <SectionShell>
    <SectionHeaderSkeleton titleWidth={130} />
    {[0, 1, 2].map((i) => (
      <ApplicantRowSkeleton key={i} />
    ))}
  </SectionShell>
);

// ─── Active Jobs Section ──────────────────────────────────────────────────────
// Each job sub-card: title → chips row → footer (applicants + pause button)
const JobSubCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a]"
    style={{
      backgroundColor: "#F9FAFB",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#F3F4F6",
      marginBottom: 12,
    }}
  >
    {/* Job title */}
    <SkeletonLine width="70%" height={13} />
    <Spacer h={10} />

    {/* Meta chips row */}
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      <Skeleton colorMode={C} width={90} height={26} radius={999} />
      <Skeleton colorMode={C} width={80} height={26} radius={999} />
      <Skeleton colorMode={C} width={58} height={26} radius={999} />
    </View>

    {/* Footer */}
    <View
      className="border-t border-gray-200 dark:border-[#2a2a2a]"
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 10,
        borderTopWidth: 1,
      }}
    >
      <Skeleton colorMode={C} width={90} height={20} radius={4} />
      <Skeleton colorMode={C} width={72} height={30} radius={999} />
    </View>
  </View>
);
};

export const ActiveJobsSectionSkeleton: React.FC = () => (
  <SectionShell>
    <SectionHeaderSkeleton titleWidth={110} />
    {[0, 1].map((i) => (
      <JobSubCardSkeleton key={i} />
    ))}
  </SectionShell>
);

// ─── Recent Contacts Section ──────────────────────────────────────────────────
// Each contact sub-card: avatar+name+job+status → last contact line → 3 action buttons
const ContactSubCardSkeleton: React.FC = () => {
  const C = useSkeletonColorMode();
  return (
  <View
    className="bg-gray-50 dark:bg-[#1e1e1e] border-gray-100 dark:border-[#2a2a2a]"
    style={{
      backgroundColor: "#F9FAFB",
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: "#F3F4F6",
      marginBottom: 12,
    }}
  >
    {/* Top row: avatar + name/job + status badge */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}
      >
        <SkeletonCircle size={36} />
        <View style={{ gap: 5 }}>
          <SkeletonLine width={110} height={12} />
          <SkeletonLine width={80} height={10} />
        </View>
      </View>
      <Skeleton colorMode={C} width={72} height={24} radius={999} />
    </View>

    {/* "Last contact: X days ago" */}
    <Spacer h={4} />
    <SkeletonLine width={130} height={10} />
    <Spacer h={10} />

    {/* Divider */}
    <View className="bg-gray-200 dark:bg-[#2a2a2a]" style={{ height: 1, marginBottom: 10 }} />

    {/* Action buttons row: Call + WhatsApp + Email */}
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Skeleton colorMode={C} width="30%" height={34} radius={999} />
      <Skeleton colorMode={C} width="30%" height={34} radius={999} />
      <Skeleton colorMode={C} width="36%" height={34} radius={999} />
    </View>
  </View>
);
};

export const RecentContactsSectionSkeleton: React.FC = () => (
  <SectionShell>
    <SectionHeaderSkeleton titleWidth={145} />
    {[0, 1].map((i) => (
      <ContactSubCardSkeleton key={i} />
    ))}
  </SectionShell>
);

// ─── Full dashboard skeleton (all sections staggered) ─────────────────────────
export const DashboardSkeleton: React.FC = () => (
  <>
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 250, delay: 0 }}
    >
      <StatCardsSkeleton />
    </MotiView>

    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 80 }}
    >
      <AttentionSectionSkeleton />
    </MotiView>

    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 160 }}
    >
      <ActiveJobsSectionSkeleton />
    </MotiView>

    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300, delay: 240 }}
    >
      <RecentContactsSectionSkeleton />
    </MotiView>
  </>
);

export default DashboardSkeleton;
