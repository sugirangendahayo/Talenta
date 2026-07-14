// components/common/SkillMatchBadge.tsx
// Compact pill that shows the skill-match percentage for a job.
// Designed to drop into any job card's tag row with zero layout impact.

import React, { memo } from "react";
import { Text, View } from "react-native";
import { SkillMatchResult } from "@/utils/skillMatching";

interface SkillMatchBadgeProps {
  /** Result from computeMatchScore / getMatchForJob. Pass null to render nothing. */
  match: SkillMatchResult | null;
  /** When true, renders a slightly larger badge (for detail screens). Default: false */
  large?: boolean;
}

// ─── Visual tokens per match tier ──────────────────────────────────────────────
const BADGE_STYLES: Record<
  SkillMatchResult["label"],
  { bg: string; border: string; text: string; darkBg: string; darkText: string }
> = {
  high: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#065F46",
    darkBg: "#052e16",
    darkText: "#34d399",
  },
  medium: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    text: "#92400E",
    darkBg: "#2d1b00",
    darkText: "#fbbf24",
  },
  low: {
    bg: "#FFF1F2",
    border: "#FECDD3",
    text: "#9F1239",
    darkBg: "#2d0a0f",
    darkText: "#fb7185",
  },
  none: {
    bg: "#F3F4F6",
    border: "#E5E7EB",
    text: "#6B7280",
    darkBg: "#111111",
    darkText: "#9CA3AF",
  },
};

const ICON: Record<SkillMatchResult["label"], string> = {
  high: "✓",
  medium: "~",
  low: "↓",
  none: "—",
};

function SkillMatchBadge({ match, large = false }: SkillMatchBadgeProps) {
  // Render nothing when there is no match data
  if (!match) return null;
  // Skip "none" label on cards (no skills set / no job skills) to avoid clutter
  if (match.label === "none" && match.score === 0 && match.matchedSkills.length === 0) return null;

  const style = BADGE_STYLES[match.label];
  const icon = ICON[match.label];
  const fontSize = large ? 13 : 11;
  const px = large ? 10 : 8;
  const py = large ? 5 : 3;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: style.bg,
        borderWidth: 1,
        borderColor: style.border,
        borderRadius: 999,
        paddingHorizontal: px,
        paddingVertical: py,
        gap: 3,
      }}
    >
      <Text
        style={{
          fontSize,
          fontFamily: "Quicksand_700Bold",
          color: style.text,
          lineHeight: fontSize + 2,
        }}
      >
        {icon}
      </Text>
      <Text
        style={{
          fontSize,
          fontFamily: "Quicksand_700Bold",
          color: style.text,
          lineHeight: fontSize + 2,
        }}
      >
        {match.score}% Match
      </Text>
    </View>
  );
}

export default memo(SkillMatchBadge);
