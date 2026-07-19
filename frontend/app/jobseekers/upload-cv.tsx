// app/jobseekers/upload-cv.tsx
import { useCVManagement } from "@/hooks/useCVManagement";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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

export default function UploadCVScreen() {
  const router = useRouter();
  const { t } = useTranslation("profile");
  const { loading, uploading, deleting, cvInfo, uploadCV, deleteCV } =
    useCVManagement();

  const handleDelete = () => {
    Alert.alert(
      t("cv.deleteTitle", { defaultValue: "Delete CV" }),
      t("cv.deleteMessage", {
        defaultValue:
          "Are you sure you want to delete your CV? You'll need to upload a new one to apply for jobs.",
      }),
      [
        { text: t("buttons.cancel", { defaultValue: "Cancel" }), style: "cancel" },
        {
          text: t("cv.deleteBtn", { defaultValue: "Delete" }),
          style: "destructive",
          onPress: deleteCV,
        },
      ]
    );
  };

  const handleView = () => {
    if (cvInfo.url) Linking.openURL(cvInfo.url);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("cv.never", { defaultValue: "Never" });
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tips = [
    t("cv.tips.1", { defaultValue: "Keep it updated with your latest experience and skills" }),
    t("cv.tips.2", { defaultValue: "Use PDF format for the best compatibility" }),
    t("cv.tips.3", { defaultValue: "Keep the file size under 5MB for faster uploads" }),
    t("cv.tips.4", { defaultValue: "Include contact info, experience, education, and skills" }),
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-[#080A08] items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium mt-3 text-sm">
          {t("cv.loading", { defaultValue: "Loading CV information…" })}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]" edges={["top"]}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="flex-row items-center px-5 py-4 bg-white dark:bg-[#080A08] border-b border-gray-100 dark:border-[#222]">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#141414] items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={18} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-900 dark:text-gray-100">
          {t("sections.documents.resume", { defaultValue: "Resume / CV" })}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── CV status card ───────────────────────────────────────── */}
        <View className="mx-6 mt-6">
          {cvInfo.url ? (
            <View
              className="bg-white dark:bg-[#0E0E0E] rounded-2xl p-5 border border-gray-100 dark:border-[#2a2a2a]"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Status row */}
              <View className="flex-row items-center mb-5">
                <View className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 items-center justify-center">
                  <Ionicons name="document-text-outline" size={22} color="#0E7490" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100">
                    {t("cv.uploadedTitle", { defaultValue: "CV Uploaded" })}
                  </Text>
                  <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
                    {t("cv.uploadedSubtitle", { defaultValue: "Ready to apply for jobs" })}
                  </Text>
                </View>
                {/* Status badge — dot + label, matches app badge pattern */}
                <View className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-2.5 py-1 rounded-full flex-row items-center gap-1.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <Text className="text-emerald-700 dark:text-emerald-400 font-quicksandBold text-xs">
                    {t("cv.activeStatus", { defaultValue: "Active" })}
                  </Text>
                </View>
              </View>

              {/* CV meta table — bg-gray-50 instead of hardcoded #F8FAFC */}
              <View className="bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-100 dark:border-[#2a2a2a]">
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs">
                    {t("cv.fileName", { defaultValue: "File Name" })}
                  </Text>
                  <Text
                    className="text-gray-700 dark:text-gray-300 font-quicksandBold text-xs flex-1 text-right ml-4"
                    numberOfLines={1}
                  >
                    {cvInfo.fileName || "resume.pdf"}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 dark:bg-[#222] mx-4" />
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs">
                    {t("cv.lastUpdated", { defaultValue: "Last Updated" })}
                  </Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-quicksandBold text-xs">
                    {formatDate(cvInfo.uploadedAt)}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View className="flex-row gap-2 mt-5">
                {/* Primary — view */}
                <TouchableOpacity
                  onPress={handleView}
                  activeOpacity={0.85}
                  className="flex-1 bg-cyan-700 rounded-2xl py-3 flex-row items-center justify-center gap-1.5"
                >
                  <Ionicons name="eye-outline" size={16} color="white" />
                  <Text className="text-white font-quicksandBold text-sm">
                    {t("cv.viewBtn", { defaultValue: "View" })}
                  </Text>
                </TouchableOpacity>

                {/* Secondary — replace */}
                <TouchableOpacity
                  onPress={uploadCV}
                  disabled={uploading}
                  activeOpacity={0.8}
                  className="flex-1 border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#141414] rounded-2xl py-3 flex-row items-center justify-center gap-1.5"
                >
                  {uploading ? (
                    <ActivityIndicator color="#6B7280" size="small" />
                  ) : (
                    <>
                      <Ionicons name="refresh-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 dark:text-gray-300 font-quicksandBold text-sm">
                        {t("cv.replaceBtn", { defaultValue: "Replace" })}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Destructive — delete, icon-only */}
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={deleting}
                  activeOpacity={0.8}
                  className="w-12 border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-2xl items-center justify-center"
                >
                  {deleting ? (
                    <ActivityIndicator color="#DC2626" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── No CV state ── */
            <View
              className="bg-white dark:bg-[#0E0E0E] rounded-2xl p-6 border border-gray-100 dark:border-[#2a2a2a] items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="w-20 h-20 rounded-full bg-gray-50 dark:bg-[#141414] items-center justify-center mb-4">
                <Ionicons name="document-text-outline" size={36} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100 mb-1">
                {t("cv.noCV", { defaultValue: "No CV Uploaded" })}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-sm text-center px-4 mb-6 leading-5">
                {t("cv.noCVMessage", {
                  defaultValue:
                    "Upload your CV to start applying for jobs. Accepted format: PDF (max 5MB)",
                })}
              </Text>
              <TouchableOpacity
                onPress={uploadCV}
                disabled={uploading}
                activeOpacity={0.85}
                className="w-full bg-cyan-700 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="white" />
                    <Text className="text-white font-quicksandBold text-sm">
                      {t("cv.uploadBtn", { defaultValue: "Upload CV" })}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Tips section ─────────────────────────────────────────────
            bg-gray-50 dark:bg-[#141414] instead of hardcoded #F8FAFC,
            which was invisible in dark mode. Bullet changed from a filled
            cyan circle (looked like a CTA button) to a plain dot — same
            treatment as the skills section label dots. */}
        <View className="mx-6 mt-4 rounded-2xl p-5 bg-white dark:bg-[#0E0E0E] border border-gray-100 dark:border-[#2a2a2a]">
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center">
              <Ionicons name="bulb-outline" size={15} color="#0E7490" />
            </View>
            <Text className="text-sm font-quicksandBold text-gray-700 dark:text-gray-300">
              {t("cv.tipsTitle", { defaultValue: "Tips for a great CV" })}
            </Text>
          </View>

          {tips.map((tip, i) => (
            <View key={i} className="flex-row items-start gap-3 mb-3">
              {/* Plain dot bullet — not a filled cyan circle */}
              <View className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-500 mt-1.5 flex-shrink-0" />
              <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-sm flex-1 leading-5">
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Privacy note ──────────────────────────────────────────── */}
        <View className="mx-6 mt-4 rounded-2xl p-4 bg-white dark:bg-[#0E0E0E] border border-gray-100 dark:border-[#2a2a2a] flex-row items-start gap-3">
          <View className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 items-center justify-center flex-shrink-0 mt-0.5">
            <Ionicons name="shield-checkmark-outline" size={15} color="#0E7490" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 font-quicksandBold text-sm mb-0.5">
              {t("cv.privacyTitle", { defaultValue: "Your privacy matters" })}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs leading-5">
              {t("cv.privacyMessage", {
                defaultValue:
                  "Your CV is securely stored and only shared with employers when you apply for jobs.",
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}