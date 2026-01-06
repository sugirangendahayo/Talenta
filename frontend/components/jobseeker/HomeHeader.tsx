import Octicons from "@expo/vector-icons/Octicons";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { JobseekerProfile } from "@/lib/supabase";

export default function HomeHeader() {
  const { profile, role } = useAuth();

  // Get first name from profile
  const getFirstName = () => {
    if (role === "jobseeker" && profile) {
      const jobseekerProfile = profile as JobseekerProfile;
      return jobseekerProfile.first_name;
    }
    return "Guest";
  };

  const firstName = getFirstName();

  return (
    <View className="my-2">
      <View className="flex flex-row justify-around items-center py-4">
        <View className="flex flex-row items-center gap-4">
          <View
            className="w-[25%] p-2 aspect-square rounded-full border border-gray-200 border-solid bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
            }}
          >
            <ImageBackground
              source={require("@/assets/images/user_.png")}
              className="w-full h-full rounded-full object-cover"
            />
          </View>
          <View>
            <Text className="font-quicksandSemibold text-base">
              Hey, {firstName} 👋
            </Text>
          </View>
        </View>
        <View className="p-3 rounded-full bg-white">
          <TouchableOpacity>
            {/* Inner shadow */}
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
      <View className="px-4 mx-4">
        <Text className="font-quicksandBold text-3xl">
          Welcome to Smarter Job Discovery
        </Text>
      </View>
    </View>
  );
}