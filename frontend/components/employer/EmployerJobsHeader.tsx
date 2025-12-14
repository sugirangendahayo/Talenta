import Octicons from "@expo/vector-icons/Octicons";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


export default function EmployerJobsHeader() {
  const router = useRouter();
  return (
    <View className="my-2">
      <View className="flex flex-row justify-between items-center px-4 py-4">
        {/* Left: Company Logo + Greeting */}
        <View className="flex flex-row items-center gap-3">
          <View
            className="w-14 h-14 rounded-full border border-gray-200 bg-white overflow-hidden p-1"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
            }}
          >
            <ImageBackground
              source={{
                uri: "https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png",
              }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          </View>
          <View>
            <Text className="font-quicksandSemibold text-base">
              Hey, TechCorp 👋
            </Text>
            <Text className="font-quicksandMedium text-xs text-gray-500">
              Manage your postings
            </Text>
          </View>
        </View>

        {/* Right: Notification */}
        <View className="p-3 rounded-full bg-white">
          <TouchableOpacity>
            <View
              className="absolute inset-0 rounded-full"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
              }}
            />
            <View className="w-2 h-2 bg-red-500 rounded-full absolute right-0 top-[-10%]" />
            <Octicons name="bell" size={24} color="#0E7490" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Post Button */}
      <View className="px-4 flex flex-row justify-between items-center">
        <Text className="font-quicksandBold text-3xl flex-1">Manage Jobs</Text>
        <TouchableOpacity className="bg-cyan-700 rounded-full px-4 py-2 flex flex-row items-center gap-2" onPress={() => router.push("/employer/post-job")}>
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-quicksandBold text-sm">
            Post Job
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
