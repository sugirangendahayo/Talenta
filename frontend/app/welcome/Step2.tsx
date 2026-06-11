import { useAuth } from "@/contexts/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");

// ─── Two-color palette: white + cyan only ────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  surface: "#F5FCFF", // very faint cyan tint for cards
  border: "#CCFBF1", // cyan-tinted border
  cyan: "#0D9488", // primary — all icons, accents, button
  cyanMid: "#257680", // slightly lighter cyan
  cyanLight: "#99F6E4", // pale cyan for glows/orb
  cyanGlow: "rgba(13,148,136,0.08)",
  cyanOrb: "rgba(20,184,166,0.13)",
  ink: "#0F172A", // near-black text
  muted: "#64748B", // secondary text
  hairline: "#E2F8F4", // dividers

  tealMid: "#257680", // slightly lighter tealyh
  tealLight: "#99F6E4", // pale teal for glows/orb
  tealGlow: "rgba(13,148,136,0.08)",
  tealOrb: "rgba(20,184,166,0.13)",
};

const FEATURES = [
  {
    icon: "briefcase-search" as const,
    titleKey: "step2.features.browseJobs.title",
    defaultTitle: "Browse Jobs",
    descKey: "step2.features.browseJobs.description",
    defaultDesc: "Thousands of roles curated to your skills and ambitions.",
  },
  {
    icon: "lightning-bolt" as const,

    titleKey: "step2.features.applyOneClick.title",
    defaultTitle: "One-Click Apply",
    descKey: "step2.features.applyOneClick.description",
    defaultDesc: "Send your application in seconds with your saved profile.",
  },
  {
    icon: "chart-areaspline" as const,
    titleKey: "step2.features.trackApplications.title",
    defaultTitle: "Track Progress",
    descKey: "step2.features.trackApplications.description",
    defaultDesc: "A live dashboard for every application from sent to signed.",
  },
];

const PERKS = [
  { icon: "tune-variant" as const, text: "Personalised recommendations" },
  {
    icon: "bookmark-check-outline" as const,
    text: "Save and revisit jobs anytime",
  },
  {
    icon: "bell-ring-outline" as const,
    text: "Instant alerts for new matches",
  },
];

export default function Step2() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuth();
  const { t } = useTranslation("welcome");
  const insets = useSafeAreaInsets();

  // ── Entrance anim values ──────────────────────────────────────────
  const navO = useRef(new Animated.Value(0)).current;
  const headY = useRef(new Animated.Value(18)).current;
  const headO = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    FEATURES.map(() => ({
      y: new Animated.Value(22),
      o: new Animated.Value(0),
    })),
  ).current;
  const perksY = useRef(new Animated.Value(16)).current;
  const perksO = useRef(new Animated.Value(0)).current;
  const btnO = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  // ── Top orb breathing ────────────────────────────────────────────
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbO = useRef(new Animated.Value(0.55)).current;
  // ── Bottom orb breathing (offset phase) ──────────────────────────
  const orbBScale = useRef(new Animated.Value(1.08)).current;
  const orbBO = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Staggered entrance
    Animated.sequence([
      Animated.timing(navO, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(headY, {
          toValue: 0,
          duration: 440,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(headO, {
          toValue: 1,
          duration: 440,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(
        90,
        cardAnims.map(({ y, o }) =>
          Animated.parallel([
            Animated.timing(y, {
              toValue: 0,
              duration: 360,
              easing: ease,
              useNativeDriver: true,
            }),
            Animated.timing(o, {
              toValue: 1,
              duration: 360,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
      Animated.parallel([
        Animated.timing(perksY, {
          toValue: 0,
          duration: 340,
          easing: ease,
          useNativeDriver: true,
        }),
        Animated.timing(perksO, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
        Animated.timing(btnO, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Top orb pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 1.14,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orbO, {
            toValue: 0.8,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 1,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orbO, {
            toValue: 0.45,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // Bottom orb pulse — offset by 1400ms so they breathe in opposite phase
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbBScale, {
            toValue: 1,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orbBO, {
            toValue: 0.22,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbBScale, {
            toValue: 1.12,
            duration: 2800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orbBO, {
            toValue: 0.48,
            duration: 2800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, []);

  const handleGetStarted = async () => {
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.95,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(btnScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      try {
        await AsyncStorage.setItem("hasSeenOnboarding", "true");
        setHasSeenOnboarding(true);
        router.replace("/auth/signin");
      } catch {
        router.replace("/auth/signin");
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* ── Nav ──────────────────────────────────────────────────── */}
        <Animated.View
          style={{
            opacity: navO,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "rgba(13,148,136,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={18} color="#09556E" />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Scroll area ──────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header */}
          <Animated.View
            style={{
              opacity: headO,
              transform: [{ translateY: headY }],
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 28,
            }}
          >
            {/* Eyebrow */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  
                  borderRadius: 2,
                  backgroundColor: "#09556E",
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  color: "#09556E",
                  fontSize: 11,
                  fontFamily: "Quicksand_700Bold",
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                }}
              >
                Your career, upgraded
              </Text>
            </View>

            <Text
              style={{
                fontSize: 32,
                lineHeight: 40,
                color: C.ink,
                fontFamily: "Quicksand_700Bold",
                marginBottom: 10,
              }}
            >
              {t("step2.title", {
                defaultValue: "Everything you\nneed to get hired",
              })}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: C.muted,
                fontFamily: "Quicksand_500Medium",
                lineHeight: 22,
              }}
            >
              {t("step2.subtitle", {
                defaultValue:
                  "Talenta gives you the tools to move fast and land the role you deserve.",
              })}
            </Text>
          </Animated.View>

          {/* Feature cards */}
          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {FEATURES.map((f, i) => (
              <Animated.View
                key={i}
                style={{
                  opacity: cardAnims[i].o,
                  transform: [{ translateY: cardAnims[i].y }],
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "rgba(13,148,136,0.1)",
                    padding: 18,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {/* Number + icon */}
                  <View
                    style={{ alignItems: "center", marginRight: 16, width: 48 }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: C.tealGlow,
                        borderWidth: 1,
                        borderColor: C.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={f.icon}
                        size={24}
                        color="#09556E"
                      />
                    </View>
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "Quicksand_700Bold",
                        color: C.ink,
                        marginBottom: 4,
                      }}
                    >
                      {t(f.titleKey, { defaultValue: f.defaultTitle })}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: C.muted,
                        fontFamily: "Quicksand_500Medium",
                        lineHeight: 19,
                      }}
                    >
                      {t(f.descKey, { defaultValue: f.defaultDesc })}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#09556E"
                    style={{ marginLeft: 10, opacity: 0.5 }}
                  />
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Perks strip */}
          <Animated.View
            style={{
              opacity: perksO,
              transform: [{ translateY: perksY }],
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: C.surface,

              overflow: "hidden",
            }}
          ></Animated.View>
        </ScrollView>
        {/* ── CTA ─────────────────────────────────────────────── */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom, 20),
            backgroundColor: C.bg,
            borderTopWidth: 1,
            borderTopColor: C.hairline,
          }}
        >
          <Animated.View
            style={{ transform: [{ scale: btnScale }], opacity: btnO }}
          >
            <Pressable
              onPress={handleGetStarted}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#0E7490" : "#0891B2",
                borderRadius: 999,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                shadowColor: "#0891B2",
                shadowOffset: { width: 0, height: pressed ? 2 : 8 },
                shadowOpacity: pressed ? 0.15 : 0.32,
                shadowRadius: pressed ? 4 : 18,
                elevation: pressed ? 2 : 7,
              })}
            >
              <Text
                style={{
                  color: "#09556E",
                  textAlign: "right",
                  fontSize: 16,
                  fontFamily: "Quicksand_700Bold",
                  letterSpacing: 0.2,
                }}
              >
                {t("", { defaultValue: "Get Started" })} 
              </Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
