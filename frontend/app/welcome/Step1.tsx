import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ImageBackground, Pressable, Text, View } from "react-native";

export default function Step1() {
  const router = useRouter();
  const { t } = useTranslation("welcome");
  const image = require("../../assets/images/HeroImage.jpg");

  return (
    <ImageBackground source={image} resizeMode="cover" className="flex-1">
      {/* Optional overlay for better contrast */}
      <View className="absolute inset-0 bg-black/20" />
      {/* <View className="absolute top-12 left-6">
        <Text className="text-white font-quicksandBold text-lg">Skip</Text>
      </View> */}

      {/* Gradient overlay - only at bottom half */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.95)",
          "rgba(255,255,255,0.7)",
          "transparent",
        ]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        className="absolute bottom-0 left-0 right-0 h-1/2"
      />

      {/* Bottom content (text only) */}
      <View className="flex-1 justify-end px-6 pb-40">
        <View className="items-center">
          <Text className="text-4xl mb-2 text-white font-quicksandBold ">
            {t("step1.title")}
          </Text>
          <Text className="text-lg mt-2 text-center font-quicksandBold text-black ">
            {t("step1.subtitle")}
          </Text>
        </View>
      </View>

      {/* Floating button near bottom */}
      <View className="absolute bottom-12 left-6 right-6 ">
        <Pressable
          className="bg-cyan-700 py-3 rounded-full items-center flex-row justify-between px-3"
          onPress={() => router.push("/welcome/Step2")}
        >
          <Text className="bg-white rounded-full p-2">
            <MaterialCommunityIcons
              name="chevron-double-right"
              size={24}
              color="#00827E"
            />
          </Text>
          <Text className="text-white text-lg font-quicksandBold">
            {t("step1.nextButton")}
          </Text>
          <Text className="bg-white rounded-full p-2">
            <MaterialIcons name="arrow-outward" size={24} color="#00827E" />
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}
