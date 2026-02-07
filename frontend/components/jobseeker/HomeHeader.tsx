// components/HomeHeader.tsx (Updated with Notifications)
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { JobseekerProfile } from "@/lib/supabase";
import Octicons from "@expo/vector-icons/Octicons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader() {
  const { profile, role } = useAuth();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation("home");

  // Get first name from profile
  const getFirstName = () => {
    if (role === "jobseeker" && profile) {
      const jobseekerProfile = profile as JobseekerProfile;
      return jobseekerProfile.first_name;
    }
    return "Guest";
  };

  const firstName = getFirstName();

  const handleNotificationsPress = () => {
    router.push("/jobseekers/notifications");
  };

  return (
    <View className="my-1">
      <View className="flex flex-row justify-around items-center py-4">
        <View className="flex flex-row items-center gap-4">
          <View
            className="w-[22%] p-2 aspect-square rounded-full border border-gray-200 border-solid bg-white"
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
              {t("greeting", { firstName })}
            </Text>
          </View>
        </View>
        <View className="p-2 rounded-full bg-white relative">
          <TouchableOpacity onPress={handleNotificationsPress}>
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
            {/* Badge for unread count */}
            {/* {unreadCount > 0 && ( */}
            <View className="absolute -right-1 -top-2 bg-red-500 rounded-full min-w-[15px] h-4 items-center justify-center flex px-1 z-10">
              <Text className="text-white font-quicksandBold text-xs">
                1{/* {unreadCount > 99 ? "99+" : unreadCount} */}
              </Text>
            </View>
            {/* )} */}
            <Octicons name="bell" size={22} color="#0E7490" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="px-4 mx-4">
        <Text className="font-quicksandBold text-3xl">{t("welcome")}</Text>
      </View>
    </View>
  );
}
