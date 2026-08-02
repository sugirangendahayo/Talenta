// components/common/OfflineBanner.tsx
//
// Single, global floating banner that reflects the app's connectivity state.
// Mounted ONCE near the root of the app (see `app/_layout.tsx`) — every
// screen benefits automatically, nothing to wire up per-screen.
//
// Behavior:
// - Offline: shows a persistent, non-alarming banner explaining that the
//   user is viewing previously loaded content and that some actions are
//   disabled. It does NOT auto-dismiss (it should stay until reconnected).
// - Reconnected: shows a short-lived success banner, then auto-dismisses.
//   Only shown if we actually showed the offline banner first — cold-starting
//   the app while online should never trigger a "back online" message.
// - The component never mounts/unmounts itself; it stays rendered and
//   animates via transform/opacity so enter/exit transitions are always
//   smooth and never flicker or stack duplicates.
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useNetwork } from "@/contexts/NetworkContext";

const SUCCESS_AUTO_HIDE_MS = 2500;

type BannerVariant = "offline" | "online";

export default function OfflineBanner() {
  const { isOnline, isChecking, reconnectedAt } = useNetwork();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<BannerVariant>("offline");

  // Only show the "back online" banner if we've actually shown the offline
  // banner before — otherwise a fresh app launch while online would
  // incorrectly announce a "reconnection".
  const hasShownOfflineRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHandledReconnectRef = useRef<number | null>(null);

  useEffect(() => {
    if (isChecking) return;

    if (!isOnline) {
      hasShownOfflineRef.current = true;
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVariant("offline");
      setVisible(true);
      return;
    }

    // Back online. Only pulse the success banner once per confirmed
    // reconnect event (guards against duplicate NetInfo events).
    if (
      hasShownOfflineRef.current &&
      reconnectedAt &&
      lastHandledReconnectRef.current !== reconnectedAt
    ) {
      lastHandledReconnectRef.current = reconnectedAt;
      hasShownOfflineRef.current = false;

      setVariant("online");
      setVisible(true);

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, SUCCESS_AUTO_HIDE_MS);
    }
  }, [isOnline, isChecking, reconnectedAt]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 190 });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(-120, { duration: 260 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const isOffline = variant === "offline";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          paddingTop: insets.top + 6,
          paddingHorizontal: 12,
        },
        animatedStyle,
      ]}
    >
      <View
        pointerEvents="auto"
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        className={
          isOffline
            ? "flex-row items-start gap-3 rounded-2xl px-4 py-3 bg-zinc-900 dark:bg-zinc-800 shadow-lg"
            : "flex-row items-center gap-3 rounded-2xl px-4 py-3 bg-emerald-600 shadow-lg"
        }
      >
        <View
          className={
            isOffline
              ? "w-8 h-8 rounded-full items-center justify-center bg-white/10 mt-0.5"
              : "w-8 h-8 rounded-full items-center justify-center bg-white/20"
          }
        >
          <Ionicons
            name={isOffline ? "cloud-offline-outline" : "checkmark-circle"}
            size={18}
            color="#ffffff"
          />
        </View>

        <View className="flex-1">
          <Text className="text-white font-quicksandBold text-sm">
            {isOffline ? "No internet connection" : "You're back online"}
          </Text>
          {isOffline ? (
            <Text className="text-white/80 font-quicksandMedium text-xs mt-0.5">
              You&apos;re viewing previously loaded content. Some actions are
              unavailable until you&apos;re back online.
            </Text>
          ) : (
            <Text className="text-white/90 font-quicksandMedium text-xs mt-0.5">
              Connection restored — everything is up to date.
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
