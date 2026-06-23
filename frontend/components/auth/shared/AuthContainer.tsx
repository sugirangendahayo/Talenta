import { Platform } from "react-native";
import { ReactNode } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTheme } from "@/contexts/ThemeContext";

interface AuthContainerProps {
  children: ReactNode;
  stickyHeaderIndices?: number[];
}

export default function AuthContainer({
  children,
  stickyHeaderIndices,
}: AuthContainerProps) {
  const { isDark } = useTheme();
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#080A08' : 'white' }} // Ensures it fills the screen and has a white background
      contentContainerStyle={{ flexGrow: 1 }} // Allows content to grow/scroll
      enableOnAndroid={true} // Better Android support
      keyboardShouldPersistTaps="handled" // Dismiss on taps outside inputs
      extraScrollHeight={Platform.OS === "ios" ? 0 : 180} // Extra bottom padding for Android (adjust if button/link gets cut off)
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={stickyHeaderIndices} // Keeps your sticky RoleSelector working!
      resetScrollToCoords={{ x: 0, y: 0 }} // Optional: Resets scroll on keyboard hide
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
