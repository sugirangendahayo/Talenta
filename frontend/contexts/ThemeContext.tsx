// src/contexts/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useColorScheme as useNativeWindScheme } from "nativewind";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  withTiming,
} from "react-native-reanimated";
import { View, StyleSheet } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  /** Call this after sign-in with the logged-in user's id and role */
  loadThemeForUser: (userId: string, role: string) => Promise<void>;
  /** Call this on sign-out to reset to the app default */
  resetTheme: () => void;
  /** Opacity value (0–1) you can read for custom animated components */
  transitionProgress: SharedValue<number>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_THEME: ThemeMode = "light";
const TRANSITION_DURATION = 350;

/** Build a per-user+role storage key so accounts don't bleed into each other */
function storageKey(userId: string, role: string) {
  return `@app_theme_mode:${userId}:${role}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme: nativeWindScheme, setColorScheme } =
    useNativeWindScheme();

  // System preference from the device
  const systemIsDark = nativeWindScheme === "dark";

  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME);
  const [isReady, setIsReady] = useState(false);

  // Keep track of which user+role is currently active so we save to the right key
  const currentKeyRef = useRef<string | null>(null);

  // Derived boolean – what the app is actually showing right now
  const isDark =
    themeMode === "system" ? systemIsDark : themeMode === "dark";

  // Reanimated shared value for the overlay animation
  const transitionProgress = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  // ── Apply a mode (sync NativeWind + state) ────────────────────────────────
  const applyMode = useCallback(
    (mode: ThemeMode, animate: boolean) => {
      if (animate) {
        overlayOpacity.value = withTiming(1, {
          duration: TRANSITION_DURATION / 2,
          easing: Easing.out(Easing.quad),
        });

        setTimeout(() => {
          setThemeModeState(mode);
          setColorScheme(mode === "system" ? "system" : mode);

          overlayOpacity.value = withTiming(0, {
            duration: TRANSITION_DURATION / 2,
            easing: Easing.in(Easing.quad),
          });

          transitionProgress.value = withTiming(mode === "dark" ? 1 : 0, {
            duration: TRANSITION_DURATION,
            easing: Easing.inOut(Easing.quad),
          });
        }, TRANSITION_DURATION / 2);
      } else {
        setThemeModeState(mode);
        setColorScheme(mode === "system" ? "system" : mode);
        transitionProgress.value = mode === "dark" ? 1 : 0;
      }
    },
    [setColorScheme, overlayOpacity, transitionProgress]
  );

  // ── Load on cold-start (no user yet – fall back to app default) ───────────
  useEffect(() => {
    // On first launch with no user, just use DEFAULT_THEME so the app
    // doesn't flash an unexpected dark mode.
    applyMode(DEFAULT_THEME, false);
    setIsReady(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load theme for a specific user+role (call after sign-in) ─────────────
  const loadThemeForUser = useCallback(
    async (userId: string, role: string) => {
      const key = storageKey(userId, role);
      currentKeyRef.current = key;
      const stored = await AsyncStorage.getItem(key);
      const mode: ThemeMode =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : DEFAULT_THEME;
      applyMode(mode, false);
    },
    [applyMode]
  );

  // ── Reset to default on sign-out ──────────────────────────────────────────
  const resetTheme = useCallback(() => {
    currentKeyRef.current = null;
    applyMode(DEFAULT_THEME, false);
  }, [applyMode]);

  // ── Public setThemeMode (persists to the current user's key) ─────────────
  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      applyMode(mode, true);

      // Persist after the animation delay so stored value matches visible state
      setTimeout(() => {
        if (currentKeyRef.current) {
          AsyncStorage.setItem(currentKeyRef.current, mode);
        }
        // Also keep a global fallback (no-user sessions) at the default key
      }, TRANSITION_DURATION / 2);
    },
    [applyMode]
  );

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? "light" : "dark");
  }, [isDark, setThemeMode]);

  // ── Overlay animated style ─────────────────────────────────────────────────
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    backgroundColor: isDark ? "#000000" : "#ffffff",
  }));

  // Don't render until we've applied the initial theme to avoid flash
  if (!isReady) return null;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        setThemeMode,
        toggleTheme,
        loadThemeForUser,
        resetTheme,
        transitionProgress,
      }}
    >
      <View style={styles.root}>
        {children}
        {/* Smooth crossfade overlay — sits on top but is pointer-events-none */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
          pointerEvents="none"
        />
      </View>
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

// ─── ThemeSync (keeps NativeWind in sync when system changes) ─────────────────
// Mount this once near the root, inside ThemeProvider.

export function ThemeSync() {
  const { colorScheme, setColorScheme } = useNativeWindScheme();
  const { themeMode } = useTheme();

  useEffect(() => {
    if (themeMode === "system") {
      setColorScheme("system");
    }
  }, [themeMode, setColorScheme]);

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { zIndex: 9999 },
});