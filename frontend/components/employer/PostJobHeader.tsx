import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface PostJobHeaderProps {
  onSaveDraft?: () => void;
  isDraftSaving?: boolean;
}

export default function PostJobHeader({
  onSaveDraft,
  isDraftSaving = false,
}: PostJobHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
      <View className="flex flex-row items-center justify-between">
        {/* Back Button - More accessible */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row items-center gap-2 active:opacity-70"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View className="p-1.5 rounded-lg bg-cyan-50">
            <Ionicons name="chevron-back" size={22} color="#0E7490" />
          </View>
         
        </TouchableOpacity>

        {/* Title - Better hierarchy */}
        <View className="flex-1 items-center ml-2">
          <Text className="text-xl font-quicksandBold text-gray-900">
            Post New Job
          </Text>
          <Text className="text-xs font-quicksandMedium text-gray-600 mt-0.5">
            Fill in the details below
          </Text>
        </View>

        {/* Save Draft Button - Better visual priority */}
        <TouchableOpacity
          onPress={onSaveDraft}
          disabled={isDraftSaving}
          className={`px-4 py-2.5 rounded-xl border ${
            isDraftSaving
              ? "bg-gray-100 border-gray-200"
              : "bg-cyan-50 border-cyan-100 active:bg-cyan-100"
          }`}
          activeOpacity={0.7}
        >
          {isDraftSaving ? (
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-sm font-quicksandBold text-gray-600">
                Saving...
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="save-outline" size={16} color="#0E7490" />
              <Text className="text-sm font-quicksandBold text-cyan-900">
                Save Draft
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
}
