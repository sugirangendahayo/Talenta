// components/employer/EmployerJobsHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface EmployerJobsHeaderProps {
  onPostJob?: () => void;
}

export default function EmployerJobsHeader({
  onPostJob,
}: EmployerJobsHeaderProps) {
  const { t } = useTranslation("jobs");

  return (
    <View className="bg-white px-6 pt-10 pb-6">
      <View className="flex flex-row justify-between items-center">
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
          onPress={onPostJob}
          activeOpacity={0.85}
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