// app/(employer-tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import {
  TabBarVisibilityProvider,
  useTabBarVisibility,
} from "@/contexts/TabBarVisibilityContext";
import PostJobSheet from "@/components/employer/PostJobSheet";

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

// ─── Glossy bar surface colours ───────────────────────────────────────────────
const GLASS_TOP = "rgba(255,255,255,0.98)";
const GLASS_MID = "rgba(252,252,255,0.96)";
const GLASS_BOT = "rgba(240,243,255,0.94)";
const GLASS_SHEEN = "rgba(255,255,255,0.55)";

// ─── Active pill colours (cyan-700) ──────────────────────────────────────────
const ACTIVE_TOP = "rgba(14,116,144,0.95)";
const ACTIVE_MID = "rgba(12,98,122,1)";
const ACTIVE_BOT = "rgba(8,75,96,1)";

// ─── FAB glossy cyan colours ──────────────────────────────────────────────────
const FAB_TOP = "rgba(20,148,184,1)";
const FAB_MID = "rgba(14,116,144,1)";
const FAB_BOT = "rgba(9,88,110,1)";

// ─── PostJobFAB ───────────────────────────────────────────────────────────────
function PostJobFAB({
  slideY,
  onPress,
}: {
  slideY: Animated.SharedValue<number>;
  onPress: () => void;
}) {
  const pressScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideY.value, HIDE_SPRING) }],
    opacity: withTiming(slideY.value === 0 ? 1 : 0, { duration: 200 }),
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.91, { damping: 20, stiffness: 300 });
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 16, stiffness: 280 });
  };

  return (
    <Animated.View style={[styles.fabWrapper, animStyle]}>
      <Animated.View style={pressStyle}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.fabOuter}
        >
          {/* Glossy cyan surface */}
          <LinearGradient
            colors={[FAB_TOP, FAB_MID, FAB_BOT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Top-edge sheen */}
          <LinearGradient
            colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.5 }}
            style={[StyleSheet.absoluteFillObject, styles.fabSheen]}
          />
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Single animated tab button ───────────────────────────────────────────────
function TabButton({
  isFocused,
  options,
  onPress,
  onLongPress,
}: {
  route: any;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
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
            color: isFocused ? "#fff" : "#64748B",
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
  const slideY = useSharedValue(0);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    slideY.value = isVisible ? 0 : 150;
  }, [isVisible]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideY.value, HIDE_SPRING) }],
    opacity: withTiming(slideY.value === 0 ? 1 : 0, { duration: 250 }),
  }));

  return (
    <>
      <Animated.View style={[styles.barWrapper, barStyle]}>
        {/* Glossy bar surface */}
        <LinearGradient
          colors={[GLASS_TOP, GLASS_MID, GLASS_BOT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Top-edge pearl sheen */}
        <LinearGradient
          colors={[GLASS_SHEEN, "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.4 }}
          style={[StyleSheet.absoluteFillObject, styles.barSheen]}
        />
        {/* Iridescent sweep */}
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

        <View style={styles.tabsRow}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
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
              />
            );
          })}
        </View>
      </Animated.View>

      <PostJobFAB slideY={slideY} onPress={() => setSheetVisible(true)} />
      <PostJobSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onSuccess={() => {}} />
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
    right: 88,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
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
    fontSize: 11,
    color: "#fff",
    includeFontPadding: false,
    fontFamily: "Quicksand_700Bold",
  },
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
    shadowColor: "#0E7490",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  fabSheen: {
    borderRadius: 26,
  },
});

// ─── Root ─────────────────────────────────────────────────────────────────────
function TabsContent() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="employers/Dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employers/Jobs"
        options={{
          title: "My Jobs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employers/Applicants"
        options={{
          title: "Applicants",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-full-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employers/Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function EmployerTabLayout() {
  return (
    <TabBarVisibilityProvider>
      <TabsContent />
    </TabBarVisibilityProvider>
  );
}