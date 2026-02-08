import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

export default function EmployerJobsHeader() {
  const router = useRouter();
  const { t } = useTranslation("jobs");
  return (
    <View className="bg-white px-6 pt-10 pb-6">
      {/* Title & Post Button */}
      <View className=" flex flex-row justify-between items-center">
        <View>
          <Text className="font-quicksandBold text-2xl text-gray-800">
            {t("header.title")}
          </Text>
          <Text className="text-gray-500 font-quicksandMedium mt-1">
            {t("header.subtitle")}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-cyan-700 rounded-full px-4 py-2 flex flex-row items-center gap-2"
          onPress={() => router.push("/employer/post-job")}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-quicksandBold text-sm">
            {t("buttons.postJob")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
