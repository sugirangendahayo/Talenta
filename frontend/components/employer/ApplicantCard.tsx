// components/employer/ApplicantCard.tsx
import { supabase } from "@/lib/supabase";
import type { Applicant } from "@/types/job.types";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useApplicationStatus } from "@/hooks/useApplicationStatus";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UserAvatar from "@/components/common/UserAvatar";

interface ApplicantCardProps {
  applicant: Applicant;
  onStatusUpdated: () => void;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  Applicant["status"],
  {
    label: string;
    accentHex: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  hired: {
    label:     "status.hired",
    accentHex: "#047857",
    bgClass:   "bg-emerald-50 dark:bg-emerald-900/20",
    textClass: "text-emerald-700 dark:text-emerald-400",
    dotClass:  "bg-emerald-500",
  },
  shortlisted: {
    label:     "status.shortlisted",
    accentHex: "#1D4ED8",
    bgClass:   "bg-blue-50 dark:bg-blue-900/20",
    textClass: "text-blue-700 dark:text-blue-400",
    dotClass:  "bg-blue-500",
  },
  pending: {
    label:     "status.pending",
    accentHex: "#B45309",
    bgClass:   "bg-amber-50 dark:bg-amber-900/20",
    textClass: "text-amber-700 dark:text-amber-400",
    dotClass:  "bg-amber-500",
  },
  rejected: {
    label:     "status.rejected",
    accentHex: "#B91C1C",
    bgClass:   "bg-red-50 dark:bg-red-900/20",
    textClass: "text-red-600 dark:text-red-400",
    dotClass:  "bg-red-500",
  },
};

// ── Date formatter ─────────────────────────────────────────────────────────
function useRelativeDate() {
  const { t } = useTranslation("applicants");
  return (dateString: string) => {
    const diffDays = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 86_400_000,
    );
    if (diffDays === 0) return t("time.today",     { defaultValue: "Today" });
    if (diffDays === 1) return t("time.yesterday", { defaultValue: "Yesterday" });
    if (diffDays < 7)  return t("time.daysAgo",   { days: diffDays,                  defaultValue: `${diffDays}d ago` });
    if (diffDays < 30) return t("time.weeksAgo",  { weeks: Math.floor(diffDays / 7), defaultValue: `${Math.floor(diffDays / 7)}w ago` });
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ApplicantCard({
  applicant,
  onStatusUpdated,
}: ApplicantCardProps) {
  const { updateApplicationStatus, isUpdating } = useApplicationStatus();
  const { t } = useTranslation("applicants");
  const { isDark } = useTheme();
  const formatDate = useRelativeDate();

  const iconColor = isDark ? "#9CA3AF" : "#6B7280";

  const profile       = applicant.jobseeker_profiles;
  const candidateName = profile.full_name || "Unknown";
  const phone         = profile.phone;
  const email         = profile.email;
  const cfg           = STATUS_CONFIG[applicant.status];

  // ── Status update ──────────────────────────────────────────────────────
  const updateStatus = async (newStatus: Applicant["status"]) => {
    const result = await updateApplicationStatus({
      applicationId: applicant.id,
      newStatus,
    });
    
    if (result.success) {
      onStatusUpdated();
    } else {
      Alert.alert(
        t("alerts.error.title",        { defaultValue: "Error" }),
        t("alerts.error.updateStatus", { defaultValue: "Could not update status." }),
      );
    }
  };

  // ── Contact handlers ───────────────────────────────────────────────────
  const handleCall = () => {
    if (!phone) {
      return Alert.alert(
        t("alerts.noPhone.title",   { defaultValue: "No phone" }),
        t("alerts.noPhone.message", { defaultValue: "This applicant has no phone number." }),
      );
    }
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, "")}`);
  };

  const handleWhatsApp = () => {
    if (!phone) {
      return Alert.alert(
        t("alerts.noPhone.title",   { defaultValue: "No phone" }),
        t("alerts.noPhone.message", { defaultValue: "This applicant has no phone number." }),
      );
    }
    const num = phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
    const msg = t("messages.whatsapp", {
      candidateName,
      jobTitle: applicant.jobs.title,
      defaultValue: `Hi ${candidateName}, regarding your application for ${applicant.jobs.title}.`,
    });
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    // NOTE: We intentionally skip `Linking.canOpenURL` here. On Android 11+
    // (API 30+) and iOS, `canOpenURL` can report `false` for WhatsApp even
    // when it's installed, unless the app's manifest/Info.plist explicitly
    // declares package-visibility/query entries for it. Calling `openURL`
    // directly (which falls back to the browser for the universal wa.me
    // link if WhatsApp isn't installed) is far more reliable.
    Linking.openURL(url).catch(() =>
      Alert.alert(
        t("alerts.whatsapp.title",   { defaultValue: "WhatsApp not found" }),
        t("alerts.whatsapp.message", { defaultValue: "Please install WhatsApp." }),
      ),
    );
  };

  const handleEmail = () => {
    const subject = t("messages.email.subject", {
      jobTitle: applicant.jobs.title,
      defaultValue: `Re: ${applicant.jobs.title}`,
    });
    const body = t("messages.email.body", {
      candidateName,
      jobTitle: applicant.jobs.title,
      defaultValue: `Hi ${candidateName},`,
    });
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  const handleViewCV = () =>
    profile.cv_document_url
      ? Linking.openURL(profile.cv_document_url)
      : Alert.alert(
          t("alerts.noCV.title",   { defaultValue: "No CV" }),
          t("alerts.noCV.message", { defaultValue: "This applicant has not uploaded a CV." }),
        );

const handleViewDetails = () =>
  router.push({
    pathname: "/(shared)/user/[id]",
    params: {
      id: applicant.id.toString(),
    },
  });

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl mb-3 border border-gray-100 dark:border-[#2a2a2a]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="p-4">

        {/* ── Top row: name block + status badge ──────────────────────── */}
        <TouchableOpacity
          onPress={() => router.push({
            pathname: "/(shared)/user/[id]",
            params: { id: applicant.jobseeker_id, role: 'jobseeker' }
          })}
          activeOpacity={0.75}
          className="flex-row items-start justify-between mb-3"
        >
          {/* Avatar initial + name/email */}
          <View className="flex-row items-center flex-1 mr-3">
            <UserAvatar 
              imageUrl={profile.profile_image_url} 
              name={candidateName} 
              size={40} 
            />
            <View className="flex-1 ml-3">
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Text
                  className="text-sm font-quicksandBold text-gray-800 dark:text-gray-100"
                  numberOfLines={1}
                >
                  {candidateName}
                </Text>
                {profile.premium_plan === "professional" && (
                  <MaterialIcons name="verified" size={13} color="#0E7490" />
                )}
              </View>
              {/* @username */}
              {profile.username ? (
                <Text
                  className="text-xs font-quicksandSemibold text-cyan-600 dark:text-cyan-400 mt-0"
                  numberOfLines={1}
                >
                  @{profile.username}
                </Text>
              ) : null}
              <Text
                className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5"
                numberOfLines={1}
              >
                {email}
              </Text>
            </View>
          </View>

          {/* Status badge: dot + label */}
          <View
            className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bgClass}`}
          >
            <View className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
            <Text className={`text-xs font-quicksandBold ${cfg.textClass}`}>
              {t(cfg.label, { defaultValue: applicant.status })}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Applied Job ─────────────────────────────────────────────── */}
        <View className="flex-row items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-lg px-2.5 py-1.5 mb-3 self-start border border-gray-100 dark:border-[#2a2a2a]">
          <Ionicons name="briefcase-outline" size={12} color={iconColor} />
          <Text className="text-xs font-quicksandSemibold text-gray-700 dark:text-gray-300 ml-1.5">
            Applied for: <Text className="font-quicksandBold text-cyan-700 dark:text-cyan-400">{applicant.jobs.title}</Text>
          </Text>
        </View>

        {/* ── Meta: experience + applied date ─────────────────────────── */}
        <View className="flex-row items-center gap-3 mb-3">
          {profile.experience_level && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="briefcase-outline" size={12} color={iconColor} />
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                {profile.experience_level}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={12} color={iconColor} />
            <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
              {formatDate(applicant.created_at)}
            </Text>
          </View>
          {phone && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="call-outline" size={12} color={iconColor} />
              <Text
                className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500"
                numberOfLines={1}
              >
                {phone}
              </Text>
            </View>
          )}
        </View>

        {/* ── Skills ──────────────────────────────────────────────────── */}
        {profile.skills && profile.skills.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mb-3">
            {profile.skills.slice(0, 3).map((skill, i) => (
              <View
                key={i}
                className="bg-gray-100 dark:bg-[#1a1a1a] px-2.5 py-1 rounded-full"
              >
                <Text className="text-xs font-quicksandMedium text-gray-600 dark:text-gray-400">
                  {skill}
                </Text>
              </View>
            ))}
            {profile.skills.length > 3 && (
              <View className="bg-gray-100 dark:bg-[#1a1a1a] px-2.5 py-1 rounded-full">
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  +{profile.skills.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <View className="h-px bg-gray-100 dark:bg-[#222] mb-3" />

        {/* ── Status actions (not hired) ───────────────────────────────
            Hierarchy: primary action (Shortlist / Hire) gets a filled or
            bordered pill; Reject is a plain text link so it doesn't compete
            visually with the affirmative action. */}
        {applicant.status !== "hired" && (
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              {applicant.status !== "shortlisted" && (
                <TouchableOpacity
                  onPress={() => updateStatus("shortlisted")}
                  disabled={isUpdating}
                  activeOpacity={0.75}
                  className="border border-gray-200 dark:border-[#2a2a2a] px-4 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-gray-700 dark:text-gray-300">
                    {t("buttons.shortlist", { defaultValue: "Shortlist" })}
                  </Text>
                </TouchableOpacity>
              )}

              {applicant.status === "shortlisted" && (
                <TouchableOpacity
                  onPress={() => updateStatus("hired")}
                  disabled={isUpdating}
                  activeOpacity={0.75}
                  className="bg-cyan-700 px-4 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-white">
                    {t("buttons.hire", { defaultValue: "Mark as Hired" })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Reject as a plain text link — present but not competing */}
            {applicant.status !== "rejected" && (
              <TouchableOpacity
                onPress={() => updateStatus("rejected")}
                disabled={isUpdating}
                activeOpacity={0.6}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="text-xs font-quicksandBold text-red-400">
                  {t("buttons.reject", { defaultValue: "Reject" })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Contact actions (hired state) ────────────────────────────
            Icons on neutral buttons stay gray — cyan reserved for filled
            cyan surfaces only. */}
        {applicant.status === "hired" && (
          <View className="flex-row gap-2 mb-3">
            {phone && (
              <>
                <TouchableOpacity
                  onPress={handleCall}
                  activeOpacity={0.75}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] py-2.5 rounded-full flex-row items-center justify-center gap-1.5"
                >
                  <Ionicons name="call-outline" size={14} color={iconColor} />
                  <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                    {t("buttons.call", { defaultValue: "Call" })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleWhatsApp}
                  activeOpacity={0.75}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] py-2.5 rounded-full flex-row items-center justify-center gap-1.5"
                >
                  <Ionicons name="logo-whatsapp" size={14} color={iconColor} />
                  <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                    {t("buttons.whatsapp", { defaultValue: "WhatsApp" })}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={handleEmail}
              activeOpacity={0.75}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] py-2.5 rounded-full flex-row items-center justify-center gap-1.5"
            >
              <Ionicons name="mail-outline" size={14} color={iconColor} />
              <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                {t("buttons.email", { defaultValue: "Email" })}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Bottom row: View Profile (recedes) + View CV (primary) ── */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleViewDetails}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-row items-center gap-1.5"
          >
            <Ionicons name="person-outline" size={13} color={iconColor} />
            <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500">
              {t("buttons.viewDetails", { defaultValue: "View Profile" })}
            </Text>
          </TouchableOpacity>

          {profile.cv_document_url ? (
            <TouchableOpacity
              onPress={handleViewCV}
              activeOpacity={0.75}
              className="bg-cyan-700 flex-row items-center gap-1.5 px-4 py-2 rounded-full"
            >
              <Ionicons name="document-text-outline" size={13} color="#fff" />
              <Text className="text-xs font-quicksandBold text-white">
                {t("buttons.viewCV", { defaultValue: "View CV" })}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#1a1a1a]">
              <Ionicons name="document-outline" size={13} color={iconColor} />
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                {t("buttons.noCV", { defaultValue: "No CV" })}
              </Text>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}