// Step2.tsx (Updated)
import { useRouter } from "expo-router";
import { Pressable, Text, View, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext"; // NEW: Import useAuth

export default function Step2() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuth(); // NEW: Destructure from context

  const handleGetStarted = async () => {
    try {
      // Mark onboarding as seen
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setHasSeenOnboarding(true); // NEW: Update context state immediately
      // Navigate to signin
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Error setting onboarding flag:", error);
      router.replace("/auth/signin");
    }
  };

  const features = [
    {
      icon: "briefcase-search",
      title: "Browse Jobs",
      description:
        "Explore thousands of job opportunities tailored to your skills",
      color: "#00827E",
    },
    {
      icon: "cursor-pointer",
      title: "Apply with One Click",
      description:
        "Send your application instantly with our smart apply feature",
      color: "#2f95dc",
    },
    {
      icon: "chart-line",
      title: "Track Applications",
      description: "Monitor your application status and get real-time updates",
      color: "#FF6B6B",
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header with gradient background */}
      <View className="pt-16 pb-8 px-6 rounded-b-[40px] bg-cyan-700">
        <Text className="text-3xl font-quicksandBold text-white text-center mb-2">
          Why Choose Talenta?
        </Text>
        <Text className="text-white/90 text-center text-base font-quicksandBold">
          Everything you need for your job search
        </Text>
      </View>

      {/* Features Section */}
      <ScrollView
        className="flex-1 px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        {features.map((feature, index) => (
          <View
            key={index}
            className="bg-gray-50 rounded-3xl p-5 mb-4 border border-gray-100"
          >
            <View className="flex flex-row items-center ">
              <View
                className="rounded-full p-3 mr-4"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={28}
                  color={feature.color}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-quicksandBold text-gray-800 mb-1">
                  {feature.title}
                </Text>
                <Text className="text-gray-500 text-sm leading-5 font-quicksandBold">
                  {feature.description}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Additional benefits */}
        <View className="bg-cyan-50 rounded-3xl p-5 mb-6 mt-2">
          <View className="flex flex-row items-center mb-3">
            <Ionicons name="sparkles" size={20} color="#00827E" />
            <Text className="text-lg font-quicksandBold text-gray-800 ml-2">
              Plus More Benefits
            </Text>
          </View>
          <View className="space-y-2">
            <View className="flex flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-cyan-700 mr-3" />
              <Text className="text-gray-700 flex-1 font-quicksandMedium">
                Personalized job recommendations
              </Text>
            </View>
            <View className="flex flex-row items-center mb-2">
              <View className="w-2 h-2 rounded-full bg-cyan-700 mr-3" />
              <Text className="text-gray-700 flex-1 font-quicksandMedium">
                Save jobs for later
              </Text>
            </View>
            <View className="flex flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-cyan-700 mr-3" />
              <Text className="text-gray-700 flex-1 font-quicksandMedium">
                Get notified of new opportunities
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating button near bottom */}
      <View className="px-6 pb-12 pt-4 bg-white">
        <Pressable
          className="bg-cyan-700 py-3 rounded-full items-center flex flex-row justify-between px-3"
          onPress={handleGetStarted}
        >
          <Text className="bg-white rounded-full p-2">
            <MaterialCommunityIcons
              name="chevron-double-right"
              size={24}
              color="#00827E"
            />
          </Text>
          <Text className="text-white text-lg font-quicksandBold">
            Get Started
          </Text>
          <Text className="bg-white rounded-full p-2">
            <MaterialIcons name="arrow-outward" size={24} color="#00827E" />
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
