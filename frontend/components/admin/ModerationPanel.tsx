// components/admin/ModerationPanel.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getModerationHistory } from "@/lib/adminService";
import type { ModerationAction } from "@/types/admin.types";
import { PromptModal } from "@/components/common/PromptModal";
import { useTranslation } from "react-i18next";
import { usePushNotification } from "@/hooks/usePushNotification";

interface ModerationPanelProps {
  targetUserId: string;
  targetRole: "jobseeker" | "employer";
  currentStatus: "active" | "suspended" | "banned" | "under_review";
  onStatusChange: (
    newStatus: "active" | "suspended" | "banned" | "under_review"
  ) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ACTION_LABELS: Record<string, string> = {
  warning:              "Warning issued",
  under_review:         "Placed under review",
  suspension:           "Suspended",
  ban:                  "Banned",
  unban:                "Account restored",
  flag_suspicious:      "Flagged suspicious",
  verification_revoked: "Verification revoked",
  unsuspend:            "Suspension lifted",
};

// Muted accent per action type — used only on the history timeline dot.
// Kept because color here actually aids scanning (what kind of action was it?).
// Using lower-saturation versions so they don't shout.
const ACTION_DOT_COLOR: Record<string, string> = {
  warning:              "#D97706",  // amber
  under_review:         "#D97706",  // amber
  suspension:           "#DC2626",  // red
  ban:                  "#991B1B",  // dark red
  unban:                "#059669",  // emerald
  flag_suspicious:      "#6B7280",  // gray
  verification_revoked: "#6B7280",  // gray
  unsuspend:            "#059669",  // emerald
};

// Status display — consistent with the rest of the app
const STATUS_META: Record<
  string,
  { badgeBg: string; badgeText: string; label: string }
> = {
  active:       { badgeBg: "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800", badgeText: "text-emerald-700 dark:text-emerald-400", label: "Active" },
  under_review: { badgeBg: "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800",       badgeText: "text-amber-700 dark:text-amber-400",   label: "Under review" },
  suspended:    { badgeBg: "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800",       badgeText: "text-amber-700 dark:text-amber-400",   label: "Suspended" },
  banned:       { badgeBg: "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800",               badgeText: "text-red-700 dark:text-red-400",       label: "Banned" },
};

type ActionType =
  | "warning"
  | "under_review"
  | "suspend"
  | "ban"
  | "unban"
  | "unsuspend"
  | "flag_suspicious"
  | "require_verification";

// The affected user must be told about every moderation action that changes
// their account state or standing — otherwise they just discover they're
// locked out with no explanation. `flag_suspicious` is intentionally excluded:
// it's an internal admin marker for investigation, not a user-facing action.
const MODERATION_NOTIFICATIONS: Partial<
  Record<ActionType, { type: string; title: string; body: (reason: string) => string }>
> = {
  ban: {
    type: "moderation_banned",
    title: "Account Banned",
    body: (reason) =>
      `Your account has been permanently banned. Reason: ${reason || "Violation of our terms of service."}`,
  },
  unban: {
    type: "moderation_unbanned",
    title: "Account Restored",
    body: () => "Your account has been restored and is active again. Welcome back!",
  },
  suspend: {
    type: "moderation_suspension",
    title: "Account Suspended",
    body: (reason) =>
      `Your account has been temporarily suspended. Reason: ${reason || "Violation of our terms of service."}`,
  },
  unsuspend: {
    type: "moderation_unsuspended",
    title: "Suspension Lifted",
    body: () => "Your account suspension has been lifted. You can now use Talenta normally.",
  },
  under_review: {
    type: "moderation_under_review",
    title: "Account Under Review",
    body: (reason) =>
      `Your account has been placed under review. Reason: ${reason || "We're reviewing recent activity on your account."}`,
  },
  warning: {
    type: "moderation_warning",
    title: "Account Warning",
    body: (reason) => `You've received a warning: ${reason || "Please review our community guidelines."}`,
  },
  require_verification: {
    type: "moderation_verification_revoked",
    title: "Verification Revoked",
    body: (reason) =>
      `Your verification status has been revoked. Reason: ${reason || "Please resubmit your documents."}`,
  },
};

export const ModerationPanel: React.FC<ModerationPanelProps> = ({
  targetUserId,
  targetRole,
  currentStatus,
  onStatusChange,
}) => {
  const { role } = useAuth();
  const { t } = useTranslation("admin");
  const { sendPushToUser } = usePushNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<ModerationAction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const [promptConfig, setPromptConfig] = useState<{
    visible: boolean;
    action: ActionType | null;
    title: string;
    message: string;
    submitText: string;
    submitStyle: "default" | "destructive";
  }>({
    visible: false,
    action: null,
    title: "",
    message: "",
    submitText: "Confirm",
    submitStyle: "default",
  });

  if (role !== "admin") return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getModerationHistory(targetUserId)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [targetUserId]);

  const handleAction = async (
    action: ActionType,
    reason: string,
    suspendHours?: number
  ) => {
    setIsProcessing(true);
    setPromptConfig((c) => ({ ...c, visible: false }));
    try {
      if (action === "ban") {
        const { error } = await supabase.rpc("admin_ban_user", {
          target_user_id: targetUserId,
          ban_reason: reason,
        });
        if (error) throw error;
        onStatusChange("banned");
      } else if (action === "unban") {
        const { error } = await supabase.rpc("admin_unban_user", {
          target_user_id: targetUserId,
          unban_reason: reason,
        });
        if (error) throw error;
        onStatusChange("active");
      } else if (action === "under_review") {
        const { error } = await supabase.rpc("admin_set_under_review", {
          target_user_id: targetUserId,
          review_reason: reason,
        });
        if (error) throw error;
        onStatusChange("under_review");
      } else if (action === "suspend") {
        const { error } = await supabase.rpc("admin_suspend_user", {
          target_user_id: targetUserId,
          suspend_reason: reason,
          hours: suspendHours ?? 72,
        });
        if (error) throw error;
        onStatusChange("suspended");
      } else if (action === "unsuspend") {
        const { error } = await supabase.rpc("admin_unsuspend_user", {
          target_user_id: targetUserId,
          unsuspend_reason: reason,
        });
        if (error) throw error;
        onStatusChange("active");
      } else {
        const actionTypeMapping: Record<string, string> = {
          warning: "warning",
          flag_suspicious: "flag_suspicious",
          require_verification: "verification_revoked",
        };
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { error } = await supabase.from("moderation_actions").insert({
          admin_id: user?.id,
          target_user_id: targetUserId,
          action_type: actionTypeMapping[action] || "warning",
          reason,
          internal_notes: `Admin initiated ${action} from profile panel.`,
        });
        if (error) throw error;
      }

      // Tell the affected user what just happened to their account — an
      // admin action that silently changes account state with no
      // notification is a support nightmare waiting to happen.
      const notif = MODERATION_NOTIFICATIONS[action];
      if (notif) {
        const body = notif.body(reason);
        try {
          await supabase.from("notifications").insert({
            user_id: targetUserId,
            type: notif.type,
            title: notif.title,
            message: body,
          });
          await sendPushToUser({
            recipientUserId: targetUserId,
            title: notif.title,
            body,
            data: { type: notif.type },
          });
        } catch (notifyErr) {
          // Non-fatal: the moderation action itself already succeeded.
          console.warn("[ModerationPanel] Failed to notify user of action:", notifyErr);
        }
      }

      const updated = await getModerationHistory(targetUserId);
      setHistory(updated);
      Alert.alert("Done", "Action applied successfully.");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to execute moderation action.");
    } finally {
      setIsProcessing(false);
    }
  };

  const promptAndAct = (action: ActionType) => {
    const titles: Record<ActionType, string> = {
      warning:              "Issue Warning",
      under_review:         "Put Under Review",
      suspend:              "Suspend User",
      ban:                  "Permanently Ban User",
      unban:                "Restore Account",
      unsuspend:            "Lift Suspension",
      flag_suspicious:      "Flag as Suspicious",
      require_verification: "Require ID Verification",
    };
    setPromptConfig({
      visible: true,
      action,
      title: titles[action],
      message: "Provide a reason for this action (required):",
      submitText: action === "ban" ? "Ban User" : "Confirm",
      submitStyle: action === "ban" ? "destructive" : "default",
    });
  };

  const onPromptSubmit = (reason: string) => {
    if (!reason?.trim()) {
      Alert.alert("Required", "A reason is required.");
      return;
    }
    const { action } = promptConfig;
    if (!action) return;

    if (action === "suspend") {
      setPromptConfig((c) => ({ ...c, visible: false }));
      setTimeout(() => {
        Alert.alert("Suspension Duration", "How long should the suspension last?", [
          { text: "24 hours", onPress: () => handleAction("suspend", reason, 24) },
          { text: "72 hours", onPress: () => handleAction("suspend", reason, 72) },
          { text: "7 days",   onPress: () => handleAction("suspend", reason, 168) },
          { text: "30 days",  onPress: () => handleAction("suspend", reason, 720) },
          { text: "Cancel",   style: "cancel" },
        ]);
      }, 300);
      return;
    }

    handleAction(action, reason);
  };

  const statusMeta = STATUS_META[currentStatus] ?? STATUS_META.active;

  return (
    <View
      className="bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] mt-3 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <PromptModal
        visible={promptConfig.visible}
        title={promptConfig.title}
        message={promptConfig.message}
        submitText={promptConfig.submitText}
        submitStyle={promptConfig.submitStyle}
        onSubmit={onPromptSubmit}
        onCancel={() => setPromptConfig((c) => ({ ...c, visible: false }))}
      />

      {/* ── Panel header ───────────────────────────────────────────────── */}
      <View className="flex-row items-center gap-2 px-4 py-4 border-b border-gray-100 dark:border-[#222]">
        <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
          <Ionicons name="shield-checkmark-outline" size={15} color="#0E7490" />
        </View>
        <Text className="text-[15px] font-quicksandBold text-gray-900 dark:text-gray-100">
          Admin Moderation
        </Text>
      </View>

      <View className="px-4 py-4">
        {/* ── Current status row ────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[13px] font-quicksandMedium text-gray-400 dark:text-gray-500">
            Account status
          </Text>
          <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full ${statusMeta.badgeBg}`}>
            <Text className={`text-xs font-quicksandBold capitalize ${statusMeta.badgeText}`}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        {/* ── Actions ───────────────────────────────────────────────────────
            Same hierarchy as EmployerJobsList / ApplicantCard:
            - No colored button backgrounds
            - One primary per group (cyan-700 filled)
            - Neutral actions as ghost border pills
            - Destructive (ban) as red text link, right-aligned and last
            A ban is permanent so it should require deliberate intent,
            not be one of four equally-weighted colored buttons. */}
        {isProcessing ? (
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#0E7490" />
          </View>
        ) : (
          <>
            {/* Non-ban actions as a pill row */}
            <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
              {currentStatus !== "banned" && (
                <TouchableOpacity
                  onPress={() => promptAndAct("warning")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  className="border border-gray-200 dark:border-[#2a2a2a] px-3 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                    Warn
                  </Text>
                </TouchableOpacity>
              )}

              {currentStatus !== "banned" && currentStatus !== "under_review" && (
                <TouchableOpacity
                  onPress={() => promptAndAct("under_review")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  className="border border-gray-200 dark:border-[#2a2a2a] px-3 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                    Under Review
                  </Text>
                </TouchableOpacity>
              )}

              {currentStatus !== "banned" && (
                <TouchableOpacity
                  onPress={() => promptAndAct("require_verification")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  className="border border-gray-200 dark:border-[#2a2a2a] px-3 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                    Require ID
                  </Text>
                </TouchableOpacity>
              )}

              {(currentStatus === "active" || currentStatus === "under_review") && (
                <TouchableOpacity
                  onPress={() => promptAndAct("suspend")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  className="border border-gray-200 dark:border-[#2a2a2a] px-3 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-gray-600 dark:text-gray-300">
                    Suspend
                  </Text>
                </TouchableOpacity>
              )}

              {currentStatus === "suspended" && (
                <TouchableOpacity
                  onPress={() => promptAndAct("unsuspend")}
                  activeOpacity={0.7}
                  className="bg-cyan-700 px-3 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-white">
                    Lift Suspension
                  </Text>
                </TouchableOpacity>
              )}

              {currentStatus === "banned" && (
                <TouchableOpacity
                  onPress={() => promptAndAct("unban")}
                  activeOpacity={0.7}
                  className="bg-cyan-700 px-3 py-2 rounded-full"
                >
                  <Text className="text-xs font-quicksandBold text-white">
                    Restore Account
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Permanent ban — destructive text link, visually separated */}
            {currentStatus !== "banned" && (
              <View className="flex-row justify-end pt-2 border-t border-gray-100 dark:border-[#222]">
                <TouchableOpacity
                  onPress={() => promptAndAct("ban")}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="text-xs font-quicksandBold text-red-400 dark:text-red-400">
                    Permanently Ban
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* ── Moderation history ──────────────────────────────────────────
            Dots use per-action colors because timeline scanning is the one
            genuine use case for multiple colors in a list — the same reason
            ApplicationCard uses accent edges. Kept but desaturated. */}
        <TouchableOpacity
          onPress={() => setShowHistory((v) => !v)}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-[#222]"
        >
          <Ionicons
            name={showHistory ? "chevron-up" : "chevron-down"}
            size={14}
            color="#9CA3AF"
          />
          <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
            {showHistory
              ? "Hide history"
              : `Moderation history (${history.length})`}
          </Text>
        </TouchableOpacity>

        {showHistory && (
          <View className="mt-3" style={{ gap: 8 }}>
            {historyLoading ? (
              <ActivityIndicator size="small" color="#0E7490" />
            ) : history.length === 0 ? (
              <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 text-center py-2">
                No moderation history for this user.
              </Text>
            ) : (
              history.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-start gap-3 bg-gray-50 dark:bg-[#141414] rounded-xl p-3 border border-gray-100 dark:border-[#2a2a2a]"
                >
                  {/* Timeline dot — the one place color-per-action is justified */}
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      marginTop: 5,
                      flexShrink: 0,
                      backgroundColor:
                        ACTION_DOT_COLOR[item.action_type] ?? "#9CA3AF",
                    }}
                  />
                  <View className="flex-1">
                    <Text className="text-[13px] font-quicksandBold text-gray-800 dark:text-gray-100">
                      {ACTION_LABELS[item.action_type] ?? item.action_type}
                    </Text>
                    {item.reason ? (
                      <Text
                        className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 mt-0.5"
                        numberOfLines={2}
                      >
                        {item.reason}
                      </Text>
                    ) : null}
                    <Text className="text-[11px] font-quicksandMedium text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
};