import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useBusinessVerification } from "@/hooks/useBusinessVerification";
import BusinessVerificationBadge from "@/components/employer/BusinessVerificationBadge";
import * as Linking from "expo-linking";
import { useAuth } from "@/contexts/AuthContext";

export default function BusinessVerificationScreen() {
  const {
    loading,
    uploading,
    submitting,
    status,
    docs,
    rejectionReason,
    handleUploadDoc,
    handleRemoveDoc,
    handleSubmit,
  } = useBusinessVerification();

  const { profile } = useAuth();
  const isProfileComplete = profile?.profile_completed ?? false;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </SafeAreaView>
    );
  }

  // ── Header ────────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View className="px-4 py-4 flex-row items-center border-b border-gray-100 dark:border-[#1f1f1f] bg-white dark:bg-[#080A08]">
      <TouchableOpacity
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1a1a1a] items-center justify-center mr-3"
      >
        <Ionicons name="arrow-back" size={18} color="#374151" />
      </TouchableOpacity>
      <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
        Business Verification
      </Text>
    </View>
  );

  // ── Document list row ─────────────────────────────────────────────────────

  const renderDocRow = (url: string, i: number, removable = true) => (
    <View
      key={i}
      className="flex-row items-center p-3 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1f1f1f] rounded-xl mb-2"
    >
      <TouchableOpacity
        className="flex-row items-center flex-1"
        onPress={() => Linking.openURL(url)}
        activeOpacity={0.7}
      >
        <View className="w-9 h-9 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg items-center justify-center">
          <Ionicons name="document-text-outline" size={17} color="#6B7280" />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-sm font-quicksandBold text-gray-800 dark:text-gray-200"
            numberOfLines={1}
          >
            Document {i + 1}
          </Text>
          <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
            Tap to view
          </Text>
        </View>
      </TouchableOpacity>

      {removable && (
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="ml-2"
          onPress={() =>
            Alert.alert(
              "Remove Document",
              "Are you sure you want to remove this document?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => handleRemoveDoc(url),
                },
              ]
            )
          }
        >
          <Ionicons name="trash-outline" size={16} color="#D1D5DB" />
        </TouchableOpacity>
      )}
    </View>
  );

  // ── Document manager (upload + list) ──────────────────────────────────────

  const renderDocumentManager = () => (
    <View className="mt-8 border-t border-gray-100 dark:border-[#1f1f1f] pt-8 w-full">
      <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100 mb-1">
        Documents
      </Text>
      <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-5 leading-5">
        Business registration certificate, tax clearance, or operating license. Max 3 files — PDF, JPG, PNG up to 5 MB.
      </Text>

      {/* Upload zone */}
      {docs.length < 3 && isProfileComplete && (
        <TouchableOpacity
          className="border border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 items-center justify-center mb-4 bg-white dark:bg-[#0e0e0e]"
          onPress={handleUploadDoc}
          disabled={uploading}
          activeOpacity={0.7}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#0E7490" />
          ) : (
            <>
              <View className="w-10 h-10 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl items-center justify-center mb-3">
                <Ionicons name="cloud-upload-outline" size={20} color="#6B7280" />
              </View>
              <Text className="text-sm font-quicksandBold text-gray-700 dark:text-gray-300">
                Add Document
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-400 mt-1">
                PDF, JPG, PNG · Max 5 MB
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Uploaded list */}
      {docs.length > 0 && (
        <View>
          <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Uploaded ({docs.length}/3)
          </Text>
          {docs.map((url, i) => renderDocRow(url, i, true))}
        </View>
      )}
    </View>
  );

  // ── Status: approved ──────────────────────────────────────────────────────

  if (status === "approved") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
        {renderHeader()}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pt-10 pb-12 items-center">
            {/* Neutral status icon — meaning comes from the heading, not a green circle */}
            <View className="w-16 h-16 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl items-center justify-center mb-6">
              <Ionicons name="shield-checkmark-outline" size={32} color="#0E7490" />
            </View>

            <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100 text-center mb-2">
              Verification Approved
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center leading-6 mb-8 px-4">
              Your business registration has been verified. Subscribe to Talenta Premium to display your Verified badge on your profile.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/employer/premium-verification")}
              className="w-full bg-cyan-700 rounded-2xl py-4 items-center justify-center"
              activeOpacity={0.85}
            >
              <Text className="text-white font-quicksandBold text-sm">
                Get Talenta Premium
              </Text>
            </TouchableOpacity>

            {renderDocumentManager()}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Status: pending_review ────────────────────────────────────────────────

  if (status === "pending_review") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
        {renderHeader()}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pt-10 pb-12 items-center">
            <View className="w-16 h-16 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl items-center justify-center mb-6">
              <Ionicons name="time-outline" size={32} color="#6B7280" />
            </View>

            <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100 text-center mb-2">
              Under Review
            </Text>
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 text-center leading-6 mb-8 px-4">
              Our team is reviewing your documents. We'll notify you once the process is complete.
            </Text>

            {docs.length > 0 && (
              <View className="w-full bg-white dark:bg-[#0e0e0e] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-4">
                <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                  Submitted ({docs.length})
                </Text>
                {docs.map((url, i) => renderDocRow(url, i, false))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Status: not_submitted / rejected ─────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pt-6 pb-12">

          {/* Current status row */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400">
              Current status
            </Text>
            <BusinessVerificationBadge status={status} />
          </View>

          {/* Rejection notice — neutral surface, no red background */}
          {status === "rejected" && rejectionReason && (
            <View className="bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 mb-6">
              <Text className="text-xs font-quicksandBold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                Rejection reason
              </Text>
              <Text className="text-sm font-quicksandMedium text-gray-700 dark:text-gray-300 leading-5">
                {rejectionReason}
              </Text>
            </View>
          )}

          <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100 mb-1">
            Upload Registration Documents
          </Text>
          <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-6 leading-5">
            Upload your official business registration certificate, tax clearance, or operating license. Max 3 files — PDF, JPG, PNG up to 5 MB.
          </Text>

          {/* Incomplete profile notice — neutral, no amber */}
          {!isProfileComplete && (
            <View className="bg-white dark:bg-[#0e0e0e] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 mb-6">
              <Text className="text-sm font-quicksandBold text-gray-800 dark:text-gray-200 mb-1">
                Profile incomplete
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-500 dark:text-gray-400 leading-5 mb-3">
                Complete your company profile before submitting documents.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/employer/complete-profile")}
                className="self-start bg-cyan-700 px-4 py-2 rounded-xl"
                activeOpacity={0.85}
              >
                <Text className="text-white font-quicksandBold text-xs">
                  Complete Profile
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {renderDocumentManager()}

          {/* Submit */}
          <TouchableOpacity
            className={`w-full rounded-2xl py-4 items-center justify-center mt-8 ${
              docs.length > 0 && isProfileComplete && !submitting
                ? "bg-cyan-700"
                : "bg-gray-100 dark:bg-[#1a1a1a]"
            }`}
            disabled={docs.length === 0 || !isProfileComplete || submitting}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                className={`text-sm font-quicksandBold ${
                  docs.length > 0 && isProfileComplete
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                Submit for Review
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}