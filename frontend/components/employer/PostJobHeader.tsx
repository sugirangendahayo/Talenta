import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface PostJobHeaderProps {
  onSaveDraft?: () => void;
}

export default function PostJobHeader({ onSaveDraft }: PostJobHeaderProps) {
  const router = useRouter();

  return (
    <View className="bg-white">
      {/* Top Section with Back and Save Draft */}
      <View className="px-6 pt-16 pb-4 flex flex-row items-center justify-between">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-100 p-2.5 rounded-xl"
        >
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>

        {/* Save Draft Button */}
        <TouchableOpacity
          onPress={onSaveDraft}
          className="bg-cyan-50 px-4 py-2.5 rounded-xl flex flex-row items-center gap-2 border border-cyan-200"
        >
          <Ionicons name="bookmark-outline" size={18} color="#0E7490" />
          <Text className="text-sm font-quicksandBold text-cyan-700">
            Save Draft
          </Text>
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View className="px-6 pb-6">
        <Text className="text-3xl font-quicksandBold text-gray-800">
          Post New Job
        </Text>
        <View className="flex flex-row items-center mt-2">
          <View className="w-1.5 h-1.5 rounded-full bg-cyan-600 mr-2" />
          <Text className="text-sm font-quicksandMedium text-gray-500">
            Fill in the details to find your perfect candidate
          </Text>
        </View>
      </View>

      {/* Bottom Border */}
      <View className="h-px bg-gray-200" />
    </View>
  );
}
