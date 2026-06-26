import { useEmployerDocuments } from "@/hooks/useEmployerDocuments";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadDocumentsScreen() {
  const router = useRouter();
  const {
    loading,
    uploading,
    deleting,
    docsInfo,
    uploadBusinessLicense,
    uploadVerificationDoc,
    deleteBusinessLicense,
    deleteVerificationDoc,
  } = useEmployerDocuments();

  const handleView = (url: string | null) => {
    if (url) Linking.openURL(url);
  };

  const handleDeleteBusinessLicense = () => {
    Alert.alert(
      "Remove Business License",
      "Are you sure you want to remove your business license?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: deleteBusinessLicense },
      ]
    );
  };

  const handleDeleteVerificationDoc = () => {
    Alert.alert(
      "Remove Verification Document",
      "Are you sure you want to remove your verification document?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: deleteVerificationDoc },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-400 font-quicksandMedium mt-3 text-sm">
          Loading documents...
        </Text>
      </View>
    );
  }

  const renderDocumentCard = (
    title: string,
    subtitle: string,
    iconName: keyof typeof Ionicons.glyphMap,
    url: string | null,
    updatedAt: string | null,
    isUploading: boolean,
    isDeleting: boolean,
    onUpload: () => void,
    onDelete: () => void
  ) => {
    if (url) {
      return (
        <View
          className="bg-white dark:bg-[#080A08] rounded-3xl p-5 border border-gray-200 dark:border-[#2a2a2a] mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 3,
          }}
        >
          {/* Status row */}
          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 items-center justify-center">
              <Ionicons name={iconName} size={22} color="#0E7490" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200">
                {title} Uploaded
              </Text>
              <Text className="text-xs font-quicksandMedium text-gray-400 mt-0.5">
                Ready for verification
              </Text>
            </View>
            {/* Status pill */}
            <View className="bg-cyan-50 border border-cyan-100 px-3 py-1 rounded-full flex-row items-center gap-1">
              <View className="w-1.5 h-1.5 rounded-full bg-cyan-600" />
              <Text className="text-cyan-700 font-quicksandBold text-xs">
                Active
              </Text>
            </View>
          </View>

          {/* Doc meta details — inset feel */}
          <View
            className="rounded-2xl border border-gray-100 dark:border-[#222]"
            style={{ backgroundColor: "#F8FAFC" }}
          >
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-gray-400 font-quicksandMedium text-xs">
                File Type
              </Text>
              <Text className="text-gray-700 dark:text-gray-300 font-quicksandSemibold text-xs">
                Document
              </Text>
            </View>
            <View className="h-px bg-gray-100 dark:bg-[#141414] mx-4" />
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="text-gray-400 font-quicksandMedium text-xs">
                Last Updated
              </Text>
              <Text className="text-gray-700 dark:text-gray-300 font-quicksandSemibold text-xs">
                {formatDate(updatedAt)}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-2 mt-5">
            <TouchableOpacity
              onPress={() => handleView(url)}
              className="flex-1 bg-cyan-700 dark:bg-cyan-800 rounded-2xl py-3 flex-row items-center justify-center gap-1.5"
              activeOpacity={0.85}
            >
              <Ionicons name="eye-outline" size={16} color="white" />
              <Text className="text-white font-quicksandBold text-sm">
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onUpload}
              disabled={isUploading}
              className="flex-1 border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#080A08] rounded-2xl py-3 flex-row items-center justify-center gap-1.5"
              activeOpacity={0.8}
            >
              {isUploading ? (
                <ActivityIndicator color="#374151" size="small" />
              ) : (
                <>
                  <Ionicons name="refresh" size={16} color="#374151" />
                  <Text className="text-gray-700 dark:text-gray-300 font-quicksandBold text-sm">
                    Replace
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDelete}
              disabled={isDeleting}
              className="w-12 border border-red-100 bg-red-50 rounded-2xl items-center justify-center"
              activeOpacity={0.8}
            >
              {isDeleting ? (
                <ActivityIndicator color="#DC2626" size="small" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Empty state
    return (
      <View
        className="bg-white dark:bg-[#080A08] rounded-3xl p-6 border border-gray-200 dark:border-[#2a2a2a] items-center mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
        }}
      >
        <View
          className="w-16 h-16 rounded-3xl border border-gray-100 dark:border-[#222] items-center justify-center mb-4"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <Ionicons
            name={iconName}
            size={28}
            color="#9CA3AF"
          />
        </View>
        <Text className="text-lg font-quicksandBold text-gray-800 dark:text-gray-200 mb-1">
          {title}
        </Text>
        <Text className="text-gray-400 font-quicksandMedium text-sm text-center px-4 mb-6">
          {subtitle}
        </Text>

        <TouchableOpacity
          onPress={onUpload}
          disabled={isUploading}
          className="w-full bg-cyan-700 dark:bg-cyan-800 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
          activeOpacity={0.85}
        >
          {isUploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color="white" />
              <Text className="text-white font-quicksandBold text-sm">
                Upload Document
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#080A08]" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-[#222]">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-900 dark:text-gray-100">
          Verification Documents
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="mx-6 mt-6">
          {renderDocumentCard(
            "Business License",
            "Upload your company's certificate of incorporation or trading license. Accepted format: PDF (max 5MB)",
            "document-text-outline",
            docsInfo.businessLicenseUrl,
            docsInfo.businessLicenseUpdatedAt,
            uploading.business,
            deleting.business,
            uploadBusinessLicense,
            handleDeleteBusinessLicense
          )}

          {renderDocumentCard(
            "Verification Document",
            "Upload supplementary documents (e.g., utility bill or director's ID) for verification. Accepted format: PDF (max 5MB)",
            "shield-checkmark-outline",
            docsInfo.verificationDocUrl,
            docsInfo.verificationDocUpdatedAt,
            uploading.verification,
            deleting.verification,
            uploadVerificationDoc,
            handleDeleteVerificationDoc
          )}
        </View>

        {/* Privacy note */}
        <View
          className="mx-6 mt-2 rounded-2xl p-4 border border-gray-100 dark:border-[#222] flex-row items-start gap-3"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#0E7490" />
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 font-quicksandBold text-sm mb-0.5">
              Secure & Confidential
            </Text>
            <Text className="text-gray-400 font-quicksandMedium text-xs leading-relaxed">
              Your documents are securely stored and only used by administrators to verify your company's legitimacy. They are never shown to jobseekers.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
