import React from "react";
import { View, Animated } from "react-native";

export function NotificationSkeleton() {
  const [fadeAnim] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className="flex-row p-4 border-b border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#080A08]"
    >
      <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#141414] mr-4" />
      <View className="flex-1 justify-center">
        <View className="h-4 w-3/4 bg-gray-200 dark:bg-[#141414] rounded-md mb-2" />
        <View className="h-3 w-1/2 bg-gray-200 dark:bg-[#141414] rounded-md" />
      </View>
    </Animated.View>
  );
}
