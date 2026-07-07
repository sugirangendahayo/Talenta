// app/(admin-tabs)/_layout.tsx
import {
  TabBarVisibilityProvider,
  useTabBarVisibility,
} from "@/contexts/TabBarVisibilityContext";
import { useTheme } from "@/contexts/ThemeContext";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from "expo-linear-gradient";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

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

// ─── Light mode glass ─────────────────────────────────────────────────────────
const GLASS_TOP = "rgba(255,255,255,0.98)";
const GLASS_MID = "rgba(252,252,255,0.96)";
const GLASS_BOT = "rgba(240,243,255,0.94)";
const GLASS_SHEEN = "rgba(255,255,255,0.55)";

// ─── Dark mode glass ──────────────────────────────────────────────────────────
const DARK_TOP = "rgba(28,28,28,0.97)";
const DARK_MID = "rgba(20,20,20,0.98)";
const DARK_BOT = "rgba(14,14,14,0.99)";
const DARK_SHEEN = "rgba(255,255,255,0.06)";

// ─── Active pill: cyan-700 (matches employer + jobseeker) ────────────────────
const ACTIVE_TOP = "rgba(14,116,144,0.95)";
const ACTIVE_MID = "rgba(12,98,122,1)";
const ACTIVE_BOT = "rgba(8,75,96,1)";

// ─── Profile FAB ──────────────────────────────────────────────────────────────
function ProfileFAB({ slideY }: { slideY: SharedValue<number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();

  const isActive = pathname.includes("admin/Profile");

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideY.value, HIDE_SPRING) }],
    opacity: withTiming(slideY.value === 0 ? 1 : 0, { duration: 200 }),
  }));

  return (
    <Animated.View style={[styles.fabWrapper, animStyle]}>
      <TouchableOpacity
        onPress={() => router.push("/(admin-tabs)/admin/Profile" as any)}
        activeOpacity={0.8}
        style={[
          styles.fabOuter,
          isDark
            ? {
                borderColor: isActive ? "#0E7490" : "rgba(255,255,255,0.08)",
                borderWidth: isActive ? 2 : 1,
              }
            : {
                borderColor: isActive ? "#0E7490" : "rgba(255,255,255,0.9)",
                borderWidth: isActive ? 2 : 1,
              },
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
          name={isActive ? "person" : "person-outline"}
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
  const iconScale = useSharedValue(isFocused ? 1 : 0.88);
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
        {/* Glossy active pill */}
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
function AdminTabBar({ state, descriptors, navigation }: any) {
  const { isVisible } = useTabBarVisibility();
  const { isDark } = useTheme();
  const slideY = useSharedValue(0);

  const VISIBLE_TABS = [
    "admin/Dashboard",
    "admin/Employers",
    "admin/Jobseekers",
    "admin/Jobs",
  ];
  const visibleRoutes = state.routes.filter((r: any) =>
    VISIBLE_TABS.includes(r.name),
  );

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
            ? {
                borderColor: "rgba(255,255,255,0.07)",
                shadowColor: "#000",
                shadowOpacity: 0.5,
              }
            : {
                borderColor: "rgba(255,255,255,0.9)",
                shadowColor: "#94A3B8",
              },
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
          {visibleRoutes.map((route: any) => {
            const { options } = descriptors[route.key];
            const isFocused = state.routes[state.index]?.name === route.name;

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

      <ProfileFAB slideY={slideY} />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  barWrapper: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    left: 40,
    right: 88, // Space for the floating button
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

// ─── Tabs content ─────────────────────────────────────────────────────────────
function TabsContent() {
  const { t } = useTranslation("common");

  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="admin/Dashboard"
        options={{
          title: t("navigation.home", { defaultValue: "Home" }),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/Employers"
        options={{
          title: t("navigation.employers", { defaultValue: "Employers" }),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="handshake-o" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/Jobseekers"
        options={{
          title: t("navigation.seekers", { defaultValue: "Seekers" }),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin/Jobs"
        options={{
          title: t("navigation.jobs", { defaultValue: "Jobs" }),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      {/* ── Hidden from the main tab bar ── */}
      <Tabs.Screen name="admin/Reports" options={{ href: null }} />
      <Tabs.Screen name="admin/Profile" options={{ href: null }} />
    </Tabs>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminTabLayout() {
  return (
    <TabBarVisibilityProvider>
      <TabsContent />
    </TabBarVisibilityProvider>
  );
}
