import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCVManagement } from "@/app/hooks/useCVManagement";

export default function UploadCVScreen() {
  const router = useRouter();
  const { loading, uploading, deleting, cvInfo, uploadCV, deleteCV } =
    useCVManagement();

  const handleDelete = () => {
    Alert.alert(
      "Delete CV",
      "Are you sure you want to delete your CV? You'll need to upload a new one to apply for jobs.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteCV,
        },
      ]
    );
  };

  const handleView = () => {
    if (cvInfo.url) {
      Linking.openURL(cvInfo.url);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0E7490" />
        <Text className="text-gray-600 font-quicksandMedium mt-4">
          Loading CV information...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-cyan-700 px-6 pt-16 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-quicksandBold text-white">
            Resume / CV
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <Text className="text-cyan-100 font-quicksandMedium text-center">
          Upload your CV to apply for jobs
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* CV Status Card */}
        <View className="mx-6 mt-6">
          {cvInfo.url ? (
            // CV Uploaded - Show Details
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="bg-green-100 p-4 rounded-2xl">
                    <Ionicons name="document-text" size={32} color="#059669" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-quicksandBold text-gray-800">
                      CV Uploaded ✓
                    </Text>
                    <Text className="text-gray-500 font-quicksandMedium text-sm mt-1">
                      Ready to apply for jobs
                    </Text>
                  </View>
                </View>
                <View className="bg-green-100 p-2 rounded-full">
                  <Ionicons name="checkmark" size={20} color="#059669" />
                </View>
              </View>

              {/* CV Details */}
              <View className="bg-gray-50 rounded-2xl p-4 mt-4">
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-gray-600 font-quicksandMedium">
                    File Name
                  </Text>
                  <Text
                    className="text-gray-800 font-quicksandSemibold text-sm flex-1 text-right ml-2"
                    numberOfLines={1}
                  >
                    {cvInfo.fileName || "resume.pdf"}
                  </Text>
                </View>
                <View className="h-px bg-gray-200 my-2" />
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-gray-600 font-quicksandMedium">
                    Last Updated
                  </Text>
                  <Text className="text-gray-800 font-quicksandSemibold">
                    {formatDate(cvInfo.uploadedAt)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={handleView}
                  className="flex-1 bg-cyan-700 rounded-2xl py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="eye-outline" size={20} color="white" />
                  <Text className="text-white font-quicksandBold ml-2">
                    View
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={uploadCV}
                  disabled={uploading}
                  className="flex-1 bg-gray-700 rounded-2xl py-3 flex-row items-center justify-center"
                >
                  {uploading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={20} color="white" />
                      <Text className="text-white font-quicksandBold ml-2">
                        Replace
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={deleting}
                  className="bg-red-100 rounded-2xl px-4 py-3 items-center justify-center"
                >
                  {deleting ? (
                    <ActivityIndicator color="#DC2626" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // No CV - Show Upload Card
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
              <View className="items-center py-8">
                <View className="bg-gray-100 p-6 rounded-full mb-4">
                  <Ionicons
                    name="document-text-outline"
                    size={64}
                    color="#6B7280"
                  />
                </View>
                <Text className="text-xl font-quicksandBold text-gray-800 mb-2">
                  No CV Uploaded
                </Text>
                <Text className="text-gray-500 font-quicksandMedium text-center px-4">
                  Upload your CV to start applying for jobs. Accepted format:
                  PDF (max 5MB)
                </Text>
              </View>

              <TouchableOpacity
                onPress={uploadCV}
                disabled={uploading}
                className="bg-cyan-700 rounded-2xl py-4 flex-row items-center justify-center mt-4"
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={24} color="white" />
                    <Text className="text-white font-quicksandBold text-lg ml-2">
                      Upload CV
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View className="mx-6 mt-6 bg-cyan-50 rounded-3xl p-6 border border-cyan-200">
          <View className="flex-row items-center mb-4">
            <Ionicons name="bulb" size={24} color="#0E7490" />
            <Text className="text-lg font-quicksandBold text-cyan-800 ml-3">
              CV Upload Tips
            </Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-start mb-3">
              <View className="bg-cyan-700 rounded-full p-1 mt-1">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
              <Text className="text-cyan-800 font-quicksandMedium ml-3 flex-1">
                Keep your CV updated with latest experience and skills
              </Text>
            </View>
            <View className="flex-row items-start mb-3">
              <View className="bg-cyan-700 rounded-full p-1 mt-1">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
              <Text className="text-cyan-800 font-quicksandMedium ml-3 flex-1">
                Use PDF format for best compatibility
              </Text>
            </View>
            <View className="flex-row items-start mb-3">
              <View className="bg-cyan-700 rounded-full p-1 mt-1">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
              <Text className="text-cyan-800 font-quicksandMedium ml-3 flex-1">
                Keep file size under 5MB for faster uploads
              </Text>
            </View>
            <View className="flex-row items-start">
              <View className="bg-cyan-700 rounded-full p-1 mt-1">
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
              <Text className="text-cyan-800 font-quicksandMedium ml-3 flex-1">
                Include contact info, experience, education, and skills
              </Text>
            </View>
          </View>
        </View>

        {/* Security Note */}
        <View className="mx-6 my-6 bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <View className="flex-row items-start gap-3">
            <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
            <View className="flex-1">
              <Text className="text-purple-800 font-quicksandBold mb-1">
                Your Privacy Matters
              </Text>
              <Text className="text-purple-700 font-quicksandMedium text-sm">
                Your CV is securely stored and only shared with employers when
                you apply for jobs.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
