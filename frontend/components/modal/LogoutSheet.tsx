import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LogoutSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function LogoutSheet({
  visible,
  onClose,
  onConfirm,
  isLoggingOut = false,
  message,
  confirmLabel = "Log Out",
  cancelLabel = "Cancel",
}: LogoutSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 26,
          stiffness: 300,
          mass: 0.9,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8, // Android shadow equivalent
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Animated.View
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 bg-black/35"
        >
          <Pressable className="flex-1" onPress={isLoggingOut ? undefined : onClose} />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            paddingBottom: insets.bottom + 8,
          }}
          className="px-2"
        >
          {/* Primary group: optional caption + destructive action */}
          {/* Shadow lives on this outer wrapper — overflow-hidden on the same
              node as a shadow clips it on iOS, so corners + bg go on the child */}
          <View style={shadowStyle} className="rounded-2xl mb-2">
            <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden">
              {message && (
                <View className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                  <Text className="text-center text-gray-500 dark:text-gray-400 font-quicksandMedium text-[13px] leading-[18px]">
                    {message}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={onConfirm}
                disabled={isLoggingOut}
                activeOpacity={0.6}
                className="py-[15px] items-center justify-center"
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#FF3B30" />
                ) : (
                  <Text
                    className="font-quicksandMedium text-[17px]"
                    style={{ color: "#FF3B30" }}
                  >
                    {confirmLabel}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Isolated cancel group — heavier weight signals the safe default */}
          <View style={shadowStyle} className="rounded-2xl">
            <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={onClose}
                disabled={isLoggingOut}
                activeOpacity={0.6}
                className="py-[15px] items-center justify-center"
              >
                <Text className="text-gray-900 dark:text-gray-100 font-quicksandBold text-[17px]">
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}