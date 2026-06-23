// constants/applicationStatus.ts
import type { ApplicationFilterId, ApplicationStatus } from "@/types/appication";

export const APPLICATION_FILTERS: ApplicationFilterId[] = [
  "all",
  "pending",
  "shortlisted",
  "hired",
  "rejected",
];

interface ApplicationStatusMeta {
  /** Hex used for the card's accent edge + status dot (not a Tailwind class — needs to be a real color value for inline styles) */
  accent: string;
  badgeBg: string;
  badgeText: string;
}

// Pending → amber (waiting), Shortlisted → blue (in progress), Hired → emerald (success),
// Rejected → red (closed). Each stage gets its own hue so the eye can scan a list of
// applications and read status from color alone, without needing to read every label.
export const APPLICATION_STATUS_META: Record<ApplicationStatus, ApplicationStatusMeta> = {
  pending: { accent: "#D97706", badgeBg: "bg-amber-50", badgeText: "text-amber-700" },
  shortlisted: { accent: "#2563EB", badgeBg: "bg-blue-50", badgeText: "text-blue-700" },
  hired: { accent: "#059669", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700" },
  rejected: { accent: "#DC2626", badgeBg: "bg-red-50", badgeText: "text-red-700" },
};

/** Fallback so an unexpected status string from the backend never crashes the card */
export const DEFAULT_STATUS_META: ApplicationStatusMeta = {
  accent: "#6B7280",
  badgeBg: "bg-gray-100",
  badgeText: "text-gray-600",
};