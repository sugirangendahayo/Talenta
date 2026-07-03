// app/(jobseeker-tabs)/_layout.tsx
import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";
import {
  TabBarVisibilityProvider,
  useTabBarVisibility,
} from "@/contexts/TabBarVisibilityContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Spring configs ───────────────────────────────────────────────────────────
const TAB_SPRING = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: false,
} as const;

const HIDE_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 1,
} as const;

// ─── Light mode: glossy white pill ────────────────────────────────────────────
const GLASS_TOP = "rgba(255,255,255,0.98)";
const GLASS_MID = "rgba(252,252,255,0.96)";
const GLASS_BOT = "rgba(240,243,255,0.94)";
const GLASS_SHEEN = "rgba(255,255,255,0.55)";

// ─── Dark mode: dark glass pill ───────────────────────────────────────────────
const DARK_TOP = "rgba(28,28,28,0.97)";
const DARK_MID = "rgba(20,20,20,0.98)";
const DARK_BOT = "rgba(14,14,14,0.99)";
const DARK_SHEEN = "rgba(255,255,255,0.06)";

// Active tab: cyan-700 (#0E7490) glossy
const ACTIVE_TOP = "rgba(14,116,144,0.95)";
const ACTIVE_MID = "rgba(12,98,122,1)";
const ACTIVE_BOT = "rgba(8,75,96,1)";

// ─── BookmarksFAB ─────────────────────────────────────────────────────────────
function BookmarksFAB({ slideY }: { slideY: SharedValue<number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();

  const isActive = pathname.includes("saved-jobs");

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideY.value, HIDE_SPRING) }],
    opacity: withTiming(slideY.value === 0 ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Animated.View style={[styles.fabWrapper, animStyle]}>
      <TouchableOpacity
        onPress={() => router.push("/jobseekers/saved-jobs" as any)}
        activeOpacity={0.8}
        style={[
          styles.fabOuter,
          isDark
            ? { borderColor: isActive ? "#0E7490" : "rgba(255,255,255,0.08)", borderWidth: isActive ? 2 : 1 }
            : { borderColor: isActive ? "#0E7490" : "rgba(255,255,255,0.9)", borderWidth: isActive ? 2 : 1 },
        ]}
      >
        {/* Surface gradient */}
        <LinearGradient
          colors={
            isActive
              ? [ACTIVE_TOP, ACTIVE_MID, ACTIVE_BOT]
              : isDark
              ? [DARK_TOP, DARK_MID, DARK_BOT]
              : [GLASS_TOP, GLASS_MID, GLASS_BOT]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Top-edge sheen */}
        <LinearGradient
          colors={[isDark ? DARK_SHEEN : GLASS_SHEEN, "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.45 }}
          style={styles.fabSheen}
        />
        <Ionicons
          name={isActive ? "bookmark" : "bookmark-outline"}
          size={22}
          color={isActive ? "#fff" : isDark ? "#9CA3AF" : "#111827"}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Single animated tab button ───────────────────────────────────────────────
function TabButton({
  route,
  isFocused,
  options,
  onPress,
  onLongPress,
  isDark,
}: {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
}) {
  const flex = useSharedValue(isFocused ? 3 : 1);
  const iconScale = useSharedValue(isFocused ? 1 : 0.92);
  const labelOpacity = useSharedValue(isFocused ? 1 : 0);
  const labelWidth = useSharedValue(isFocused ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    flex.value = isFocused ? 3 : 1;
    iconScale.value = withSpring(isFocused ? 1 : 0.88, TAB_SPRING);
    labelOpacity.value = withSpring(isFocused ? 1 : 0, TAB_SPRING);
    labelWidth.value = withSpring(isFocused ? 1 : 0, TAB_SPRING);
  }, [isFocused]);

  const containerStyle = useAnimatedStyle(() => ({
    flex: withSpring(flex.value, TAB_SPRING),
    transform: [{ scale: pressScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    maxWidth: withSpring(labelWidth.value === 1 ? 80 : 0, TAB_SPRING),
    marginLeft: withSpring(labelWidth.value === 1 ? 5 : 0, TAB_SPRING),
    overflow: "hidden",
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.93, { damping: 20, stiffness: 300 });
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 16, stiffness: 280 });
  };

  return (
    <Animated.View style={[styles.tabButtonOuter, containerStyle]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        testID={options.tabBarTestID}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.tabButtonInner}
      >
        {/* Active: glossy cyan pill */}
        {isFocused && (
          <View style={StyleSheet.absoluteFillObject}>
            <LinearGradient
              colors={[ACTIVE_TOP, ACTIVE_MID, ACTIVE_BOT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.activePillGradient}
            />
            <LinearGradient
              colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.5 }}
              style={styles.activePillSheen}
            />
          </View>
        )}
        <Animated.View style={iconStyle}>
          {options.tabBarIcon?.({
            color: isFocused ? "#fff" : isDark ? "#9CA3AF" : "#64748B",
            size: 20,
          })}
        </Animated.View>

        <Animated.Text numberOfLines={1} style={[styles.tabLabel, labelStyle]}>
          {options.title}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Custom tab bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { isVisible } = useTabBarVisibility();
  const { isDark } = useTheme();
  const slideY = useSharedValue(0);

  const VISIBLE_TABS = ["jobseekers/Home", "jobseekers/Jobs", "jobseekers/Applications", "jobseekers/Profile"];
  const visibleRoutes = state.routes.filter((r: any) => VISIBLE_TABS.includes(r.name));
  
console.log("Expo Router gave me:", state.routes.map((r: any) => r.name));
console.log("Filtered down to:", visibleRoutes.map((r: any) => r.name));

  useEffect(() => {
    slideY.value = isVisible ? 0 : 150;
  }, [isVisible]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideY.value, HIDE_SPRING) }],
    opacity: withTiming(slideY.value === 0 ? 1 : 0, { duration: 250 }),
  }));

  const glassTop = isDark ? DARK_TOP : GLASS_TOP;
  const glassMid = isDark ? DARK_MID : GLASS_MID;
  const glassBot = isDark ? DARK_BOT : GLASS_BOT;
  const glassSheen = isDark ? DARK_SHEEN : GLASS_SHEEN;

  return (
    <>
      <Animated.View
        style={[
          styles.barWrapper,
          isDark
            ? { borderColor: "rgba(255,255,255,0.07)", shadowColor: "#000", shadowOpacity: 0.5 }
            : { borderColor: "rgba(255,255,255,0.9)", shadowColor: "#94A3B8" },
          barStyle,
        ]}
      >
        <LinearGradient
          colors={[glassTop, glassMid, glassBot]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[glassSheen, "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.4 }}
          style={[StyleSheet.absoluteFillObject, styles.barSheen]}
        />
        {!isDark && (
          <LinearGradient
            colors={[
              "rgba(200,220,255,0.10)",
              "rgba(255,255,255,0)",
              "rgba(200,230,220,0.08)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={styles.tabsRow}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            if (options.href === null || route.name === "jobseekers/saved-jobs") return null;
            
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            return (
              <TabButton
                key={route.key}
                route={route}
                isFocused={isFocused}
                options={options}
                onPress={onPress}
                onLongPress={onLongPress}
                isDark={isDark}
              />
            );
          })}
        </View>
      </Animated.View>

      <BookmarksFAB slideY={slideY} />
    </>
  );
}
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Bar
  barWrapper: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    left: 40,
    right: 88,
    borderRadius: 50,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    minHeight: 60,
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  barSheen: {
    borderRadius: 50,
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  // Individual tab button
  tabButtonOuter: {
    marginHorizontal: 2,
    borderRadius: 25,
    overflow: "hidden",
  },
  tabButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderRadius: 25,
    minWidth: 40,
  },
  activePillGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
  activePillSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
  tabLabel: {
    marginLeft: 5,
    fontSize: 11,
    color: "#fff",
    includeFontPadding: false,
    fontFamily: "Quicksand_700Bold",
  },

  // FAB
  fabWrapper: {
    position: "absolute",
    bottom: 50,
    right: 24,
  },
  fabOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  fabSheen: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
function TabsContent() {
  const { t } = useTranslation("common");

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="jobseekers/Home"
        options={{
          title: t("navigation.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobseekers/Jobs"
        options={{
          title: t("navigation.jobs"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobseekers/Applications"
        options={{
          title: t("navigation.applications"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobseekers/Profile"
        options={{
          title: t("navigation.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ── Hide saved-jobs from the tab bar ── */}
      <Tabs.Screen
        name="jobseekers/saved-jobs"
        options={{ href: null }}
      />
    </Tabs>
  );
}

export default function JobseekerTabLayout() {
  return (
    <TabBarVisibilityProvider>
      <TabsContent />
    </TabBarVisibilityProvider>
  );
}
