import { useCVManagement } from "@/hooks/useCVManagement";
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

export default function UploadCVScreen() {
  const router = useRouter();
  const { loading, uploading, deleting, cvInfo, uploadCV, deleteCV } =
    useCVManagement();

  const handleDelete = () => {
    Alert.alert(
      "Delete CV",
      "Are you sure you want to delete your CV? You'll need to upload a new one to apply for jobs.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteCV },
      ]
    );
  };

  const handleView = () => {
    if (cvInfo.url) Linking.openURL(cvInfo.url);
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-400 font-quicksandMedium mt-3 text-sm">
          Loading CV information...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-quicksandBold text-gray-900">
          Resume / CV
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* CV Status Card */}
        <View className="mx-6 mt-6">
          {cvInfo.url ? (
            /* ── CV uploaded state ── */
            <View
              className="bg-white rounded-3xl p-5 border border-gray-200"
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
                  <Ionicons name="document-text" size={22} color="#0E7490" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-quicksandBold text-gray-800">
                    CV Uploaded
                  </Text>
                  <Text className="text-xs font-quicksandMedium text-gray-400 mt-0.5">
                    Ready to apply for jobs
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

              {/* CV meta details — inset feel */}
              <View
                className="rounded-2xl border border-gray-100"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-gray-400 font-quicksandMedium text-xs">
                    File Name
                  </Text>
                  <Text
                    className="text-gray-700 font-quicksandSemibold text-xs flex-1 text-right ml-4"
                    numberOfLines={1}
                  >
                    {cvInfo.fileName || "resume.pdf"}
                  </Text>
                </View>
                <View className="h-px bg-gray-100 mx-4" />
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-gray-400 font-quicksandMedium text-xs">
                    Last Updated
                  </Text>
                  <Text className="text-gray-700 font-quicksandSemibold text-xs">
                    {formatDate(cvInfo.uploadedAt)}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View className="flex-row gap-2 mt-5">
                <TouchableOpacity
                  onPress={handleView}
                  className="flex-1 bg-cyan-700 rounded-2xl py-3 flex-row items-center justify-center gap-1.5"
                  activeOpacity={0.85}
                >
                  <Ionicons name="eye-outline" size={16} color="white" />
                  <Text className="text-white font-quicksandBold text-sm">
                    View
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={uploadCV}
                  disabled={uploading}
                  className="flex-1 border border-gray-200 bg-gray-50 rounded-2xl py-3 flex-row items-center justify-center gap-1.5"
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator color="#374151" size="small" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={16} color="#374151" />
                      <Text className="text-gray-700 font-quicksandBold text-sm">
                        Replace
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={deleting}
                  className="w-12 border border-red-100 bg-red-50 rounded-2xl items-center justify-center"
                  activeOpacity={0.8}
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
              className="bg-white rounded-3xl p-6 border border-gray-200 items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
              }}
            >
              {/* Empty state icon */}
              <View
                className="w-16 h-16 rounded-3xl border border-gray-100 items-center justify-center mb-4"
                style={{ backgroundColor: "#F8FAFC" }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color="#9CA3AF"
                />
              </View>
              <Text className="text-lg font-quicksandBold text-gray-800 mb-1">
                No CV Uploaded
              </Text>
              <Text className="text-gray-400 font-quicksandMedium text-sm text-center px-4 mb-6">
                Upload your CV to start applying for jobs. Accepted format: PDF
                (max 5MB)
              </Text>

              <TouchableOpacity
                onPress={uploadCV}
                disabled={uploading}
                className="w-full bg-cyan-700 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
                activeOpacity={0.85}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="white" />
                    <Text className="text-white font-quicksandBold text-sm">
                      Upload CV
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips section */}
        <View
          className="mx-6 mt-4 rounded-3xl p-5 border border-gray-100"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <View className="flex-row items-center mb-4 gap-2">
            <Ionicons name="bulb-outline" size={18} color="#0E7490" />
            <Text className="text-sm font-quicksandBold text-gray-700">
              Tips for a great CV
            </Text>
          </View>

          {[
            "Keep it updated with your latest experience and skills",
            "Use PDF format for the best compatibility",
            "Keep the file size under 5MB for faster uploads",
            "Include contact info, experience, education, and skills",
          ].map((tip, i) => (
            <View key={i} className="flex-row items-start gap-3 mb-3 last:mb-0">
              <View className="w-5 h-5 rounded-full bg-cyan-700 items-center justify-center mt-0.5 shrink-0">
                <Ionicons name="checkmark" size={11} color="white" />
              </View>
              <Text className="text-gray-500 font-quicksandMedium text-sm flex-1 leading-relaxed">
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {/* Privacy note */}
        <View
          className="mx-6 mt-4 rounded-2xl p-4 border border-gray-100 flex-row items-start gap-3"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color="#0E7490" />
          <View className="flex-1">
            <Text className="text-gray-700 font-quicksandBold text-sm mb-0.5">
              Your privacy matters
            </Text>
            <Text className="text-gray-400 font-quicksandMedium text-xs leading-relaxed">
              Your CV is securely stored and only shared with employers when you
              apply for jobs.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}