import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useBusinessVerification } from "@/hooks/useBusinessVerification";
import BusinessVerificationBadge from "@/components/employer/BusinessVerificationBadge";
import * as Linking from "expo-linking";

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#080A08]">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center mr-4"
      >
        <Ionicons name="arrow-back" size={20} color="#6B7280" />
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
          Business Verification
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (status === "approved") {
      return (
        <View className="flex-1 px-6 pt-8 pb-12 items-center">
          <View className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100 text-center mb-2">
            Verification Approved
          </Text>
          <Text className="text-base font-quicksandMedium text-gray-500 dark:text-gray-400 text-center mb-8 px-4">
            Your business registration has been verified successfully. You can now subscribe to Talenta Premium to get your Verified badge.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/employer/premium-verification")}
            className="w-full bg-cyan-700 rounded-2xl py-4 items-center justify-center"
            activeOpacity={0.85}
          >
            <Text className="text-white font-quicksandBold text-base">
              Get Talenta Premium
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "pending_review") {
      return (
        <View className="flex-1 px-6 pt-8 pb-12 items-center">
          <View className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full items-center justify-center mb-6">
            <Ionicons name="time" size={48} color="#D97706" />
          </View>
          <Text className="text-2xl font-quicksandBold text-gray-800 dark:text-gray-100 text-center mb-2">
            Under Review
          </Text>
          <Text className="text-base font-quicksandMedium text-gray-500 dark:text-gray-400 text-center mb-8 px-4">
            Our team is currently reviewing your documents. We will notify you once the review is complete.
          </Text>
          <View className="w-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl p-4">
            <Text className="text-sm font-quicksandBold text-gray-800 dark:text-gray-200 mb-3">
              Uploaded Documents ({docs.length})
            </Text>
            {docs.map((url, i) => (
              <TouchableOpacity
                key={i}
                className="flex-row items-center p-3 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl mb-2"
                onPress={() => Linking.openURL(url)}
              >
                <Ionicons name="document-text" size={20} color="#0E7490" />
                <Text
                  className="flex-1 ml-3 text-sm font-quicksandMedium text-gray-700 dark:text-gray-300"
                  numberOfLines={1}
                >
                  Document {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // not_submitted or rejected
    return (
      <View className="flex-1 px-6 pt-6 pb-12">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-base font-quicksandMedium text-gray-600 dark:text-gray-400">
            Current Status
          </Text>
          <BusinessVerificationBadge status={status} />
        </View>

        {status === "rejected" && rejectionReason && (
          <View className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={16} color="#DC2626" />
              <Text className="text-red-700 dark:text-red-400 font-quicksandBold text-sm ml-2">
                Verification Rejected
              </Text>
            </View>
            <Text className="text-red-600 dark:text-red-300 font-quicksandMedium text-sm leading-5">
              {rejectionReason}
            </Text>
          </View>
        )}

        <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-100 mb-2">
          Upload Registration Documents
        </Text>
        <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-6 leading-5">
          Please upload your official business registration certificate, tax clearance, or operating license (max 3 files). We support PDF, JPG, and PNG formats up to 5MB.
        </Text>

        {/* Upload Button */}
        {docs.length < 3 && (
          <TouchableOpacity
            className="border-2 border-dashed border-gray-300 dark:border-[#333] rounded-2xl p-6 items-center justify-center mb-6 bg-white dark:bg-[#141414]"
            onPress={handleUploadDoc}
            disabled={uploading}
            activeOpacity={0.7}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#0E7490" />
            ) : (
              <>
                <View className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-full items-center justify-center mb-3">
                  <Ionicons name="cloud-upload-outline" size={24} color="#0E7490" />
                </View>
                <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200">
                  Select Document
                </Text>
                <Text className="text-xs font-quicksandMedium text-gray-400 mt-1">
                  PDF, JPG, PNG (Max 5MB)
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Uploaded List */}
        {docs.length > 0 && (
          <View className="mb-8">
            <Text className="text-sm font-quicksandBold text-gray-800 dark:text-gray-200 mb-3">
              Uploaded Documents ({docs.length}/3)
            </Text>
            {docs.map((url, i) => (
              <View
                key={i}
                className="flex-row items-center p-3 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#2a2a2a] rounded-xl mb-3"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1"
                  onPress={() => Linking.openURL(url)}
                >
                  <View className="w-10 h-10 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg items-center justify-center">
                    <Ionicons name="document-text" size={20} color="#0E7490" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-sm font-quicksandBold text-gray-800 dark:text-gray-200"
                      numberOfLines={1}
                    >
                      Document {i + 1}
                    </Text>
                    <Text className="text-xs font-quicksandMedium text-cyan-600 dark:text-cyan-400 mt-0.5">
                      Tap to view
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-10 h-10 items-center justify-center ml-2 rounded-lg bg-red-50 dark:bg-red-900/10"
                  onPress={() => {
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
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          className={`w-full rounded-2xl py-4 items-center justify-center mt-auto ${
            docs.length > 0 && !submitting
              ? "bg-cyan-700"
              : "bg-gray-200 dark:bg-[#2a2a2a]"
          }`}
          disabled={docs.length === 0 || submitting}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text
              className={`text-base font-quicksandBold ${
                docs.length > 0
                  ? "text-white"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              Submit for Review
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
