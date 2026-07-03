// components/moderation/ReportModal.tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "user" | "job" | "company" | "post" | "comment";
}

const REPORT_REASONS = [
  { id: "spam",         label: "Spam or Misleading"    },
  { id: "harassment",   label: "Harassment or Abuse"   },
  { id: "fraud",        label: "Fraud or Scam"         },
  { id: "inappropriate",label: "Inappropriate Content" },
  { id: "suspicious",   label: "Suspicious Activity"   },
  { id: "other",        label: "Other"                 },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetId,
  targetType,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedReason("");
    setDetails("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Select a reason", "Please select a reason before submitting.");
      return;
    }
    if (!user) {
      Alert.alert("Not signed in", "You must be logged in to submit a report.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        target_id: targetId,
        target_type: targetType,
        reason: selectedReason,
        details: details.trim(),
        status: "pending",
      });
      if (error) throw error;
      Alert.alert(
        "Report submitted",
        "Thank you for keeping Talenta safe. We will review your report shortly."
      );
      handleClose();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        <View className="bg-white dark:bg-[#0E0E0E] rounded-t-3xl px-5 pt-4 pb-8 max-h-[85%]">
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-[#333] self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="font-quicksandBold text-[20px] text-gray-900 dark:text-gray-100 capitalize">
              Report {targetType}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Prompt */}
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-3">
              Why are you reporting this?
            </Text>

            {/* Reason chips — same pattern as filter chips throughout the app */}
            <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <TouchableOpacity
                    key={reason.id}
                    onPress={() => setSelectedReason(reason.id)}
                    activeOpacity={0.7}
                    className={`px-4 py-2 rounded-full border ${
                      isSelected
                        ? "bg-cyan-700 border-cyan-700"
                        : "bg-white dark:bg-[#141414] border-gray-200 dark:border-[#2a2a2a]"
                    }`}
                  >
                    <Text
                      className={`text-sm font-quicksandMedium ${
                        isSelected
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Details input */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-quicksandMedium text-gray-800 dark:text-gray-100">
                  Additional details
                </Text>
                <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500">
                  Optional
                </Text>
              </View>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Describe what happened..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                className="bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 font-quicksandMedium text-gray-800 dark:text-gray-100 min-h-[100px] text-sm"
              />
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleClose}
                disabled={isSubmitting}
                activeOpacity={0.7}
                className="flex-1 bg-gray-100 dark:bg-[#1e1e1e] py-3.5 rounded-2xl items-center justify-center"
              >
                <Text className="text-sm font-quicksandBold text-gray-600 dark:text-gray-300">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Submit is cyan-700 — reporting is a positive safety action,
                  not a destructive one. Red is reserved for delete/ban/remove. */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                activeOpacity={0.85}
                className={`flex-[2] py-3.5 rounded-2xl items-center justify-center ${
                  !selectedReason || isSubmitting
                    ? "bg-gray-100 dark:bg-[#1e1e1e]"
                    : "bg-cyan-700"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={!selectedReason ? "#9CA3AF" : "#fff"}
                  />
                ) : (
                  <Text
                    className={`text-sm font-quicksandBold ${
                      !selectedReason
                        ? "text-gray-400 dark:text-gray-500"
                        : "text-white"
                    }`}
                  >
                    Submit Report
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};