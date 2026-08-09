import { useTheme } from "@/contexts/ThemeContext";
import { Image, Text, View } from "react-native";

/** Shared hand-off screen while the app resolves auth and navigation. */
export default function AppLoadingScreen() {
  const { isDark } = useTheme();
  const backgroundColor = isDark ? "#080A08" : "#ffffff";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor,
      }}
    >
      <Image
        source={
          isDark
            ? require("../../assets/images/android-icon-foreground-white-removebg.png")
            : require("../../assets/images/android-icon-foreground.png")
        }
        style={{ width: 120, height: 120, resizeMode: "contain" }}
      />
      <Text
        className="text-black dark:text-white font-quicksandBold text-lg"
        style={{ position: "absolute", bottom: 40, alignSelf: "center" }}
      >
        Talenta
      </Text>
    </View>
  );
}
