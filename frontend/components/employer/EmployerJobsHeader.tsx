import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function EmployerJobsHeader() {
  const router = useRouter();
  return (
    <View className="bg-white px-6 pt-10 pb-6">
      {/* Title & Post Button */}
      <View className=" flex flex-row justify-between items-center">
        <View>
          <Text className="font-quicksandBold text-2xl text-gray-800">
            Manage Jobs
          </Text>
          <Text className="text-gray-500 font-quicksandMedium mt-1">
            Manage your postings
          </Text>
        </View>

        <TouchableOpacity
          className="bg-cyan-700 rounded-full px-4 py-2 flex flex-row items-center gap-2"
          onPress={() => router.push("/employer/post-job")}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-quicksandBold text-sm">
            Post Job
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
