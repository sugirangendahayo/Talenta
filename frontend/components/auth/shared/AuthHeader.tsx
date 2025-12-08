import { Image, Text, TouchableOpacity, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

interface AuthHeaderProps {
  icon: keyof typeof AntDesign.glyphMap;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function AuthHeader({
  icon,
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
}: AuthHeaderProps) {
  return (
    <View className="h-[250px] items-start relative">
      <Image
        source={require("@/assets/images/header-vector.png")}
        style={{
          height: "100%",
          width: "100%",
          resizeMode: "stretch",
          alignSelf: "flex-start",
        }}
      />
      <TouchableOpacity
        className="absolute top-[20%] left-[20%]"
        onPress={showBackButton ? onBackPress : undefined}
        disabled={!showBackButton}
      >
        <AntDesign name={icon} size={24} color="#fff" />
      </TouchableOpacity>
      <View className="absolute top-[50%] left-[20%]">
        <Text className="text-3xl font-quicksandBold text-white">{title}</Text>
        <Text className="text-white font-quicksandMedium mt-1">{subtitle}</Text>
      </View>
    </View>
  );
}
