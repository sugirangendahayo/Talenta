// components/JobsHeader.tsx
import Octicons from "@expo/vector-icons/Octicons";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export default function JobsHeader() {
  const { t } = useTranslation(["home", "jobs"]);

  return (
    <View className="my-2">
      <View className="px-4 mx-4 ">
        <Text className="font-quicksandBold text-3xl ">{t("jobs:exploreAll")}</Text>
      </View>
    </View>
  );
}
