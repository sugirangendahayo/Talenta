// components/skeletons/SkeletonBase.tsx
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { ViewStyle } from "react-native";

// ─── Colour mode ─────────────────────────────────────────────────────────────
// Your app is light-mode; keep this "light" unless you later support dark mode.
const COLOR_MODE = "light" as const;

// ─── Primitive: generic skeleton box ─────────────────────────────────────────
interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}) => (
  <Skeleton
    colorMode={COLOR_MODE}
    width={width}
    height={height}
    radius={radius}
  />
);

// ─── Primitive: text-line skeleton ────────────────────────────────────────────
interface SkeletonLineProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  width = "100%",
  height = 12,
  style,
}) => (
  <Skeleton colorMode={COLOR_MODE} width={width} height={height} radius={4} />
);

// ─── Primitive: circle (avatar) ───────────────────────────────────────────────
interface SkeletonCircleProps {
  size?: number;
  style?: ViewStyle;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({
  size = 48,
  style,
}) => (
  <Skeleton
    colorMode={COLOR_MODE}
    width={size}
    height={size}
    radius={size / 2}
  />
);

// ─── Primitive: rounded square (company initial avatar) ───────────────────────
interface SkeletonRoundedSquareProps {
  size?: number;
  radius?: number;
  style?: ViewStyle;
}

export const SkeletonRoundedSquare: React.FC<SkeletonRoundedSquareProps> = ({
  size = 48,
  radius = 16,
  style,
}) => (
  <Skeleton colorMode={COLOR_MODE} width={size} height={size} radius={radius} />
);

// ─── Primitive: pill tag ──────────────────────────────────────────────────────
interface SkeletonPillProps {
  width?: number;
  style?: ViewStyle;
}

export const SkeletonPill: React.FC<SkeletonPillProps> = ({
  width = 72,
  style,
}) => (
  <Skeleton colorMode={COLOR_MODE} width={width} height={26} radius={999} />
);

// ─── Wrapper: animates children in with a stagger ─────────────────────────────
// Use this to wrap a list of skeleton cards so they fade in staggered.
interface SkeletonListProps {
  count?: number;
  renderItem: (index: number) => React.ReactNode;
  staggerMs?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 4,
  renderItem,
  staggerMs = 80,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <MotiView
        key={i}
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 300,
          delay: i * staggerMs,
        }}
      >
        {renderItem(i)}
      </MotiView>
    ))}
  </>
);
