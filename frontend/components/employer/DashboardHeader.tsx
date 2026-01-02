import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export default function DashboardHeader() {
  return (
    <View className="my-2  ">
      <View className="flex flex-row justify-between items-center px-4 py-4">
        {/* Left: Company Logo + Greeting */}
        <View className="flex flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-full border border-gray-200 bg-white overflow-hidden p-1"
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
              className="w-full h-full "
              resizeMode="contain"
            />
          </View>
          <View>
            <Text className="font-quicksandBold text-base text-gray-800">
              Hi, TechCorp Inc! 👋
            </Text>
            <Text className="font-quicksandMedium text-xs text-gray-500">
              Welcome back to your dashboard
            </Text>
          </View>
        </View>

        {/* Right: Notifications + Profile */}
        <View className="flex flex-row items-center gap-3">
          {/* Notification Bell */}
          <TouchableOpacity className="relative">
            <View
              className="p-2 rounded-full bg-white"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <View className="w-2 h-2 bg-red-500 rounded-full absolute right-1 top-1 z-10" />
              <Octicons name="bell" size={20} color="#0E7490" />
            </View>
          </TouchableOpacity>

          {/* Profile Icon */}
          <TouchableOpacity>
            <View
              className="w-10 h-10 rounded-full border border-gray-200 bg-white overflow-hidden"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <ImageBackground
                source={require("@/assets/images/user_.png")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <View className="px-4 mt-2">
        <View className=" flex flex-row items-center gap-2">
          <Ionicons name="analytics-sharp" size={24} color="black" />
          <Text className="font-quicksandBold text-2xl text-gray-800">
            Dashboard Overview
          </Text>
        </View>
      </View>
    </View>
  );
}
