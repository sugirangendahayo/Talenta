import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_W = SCREEN_WIDTH * 0.52;
const CARD_H = SCREEN_WIDTH * 0.72;
const INTERVAL = 3000;
const DURATION = 520;

const IMAGES = [
  { uri: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80" },
  { uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80" },
  { uri: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80" },
];

// slot 0 = back, 1 = middle, 2 = front
const SLOTS = [
  { rotate: "-11deg", tx: -SCREEN_WIDTH * 0.17, ty: 28,  opacity: 0.45, zIndex: 1, scale: 0.93 },
  { rotate:  "7deg",  tx:  SCREEN_WIDTH * 0.15, ty: 12,  opacity: 0.7,  zIndex: 2, scale: 0.96 },
  { rotate: "-2deg",  tx:  SCREEN_WIDTH * 0.01, ty: -10, opacity: 1,    zIndex: 3, scale: 1    },
];

export default function Step1() {
  const router = useRouter();
  const { t } = useTranslation("welcome");
  const [activeDot, setActiveDot] = useState(0);
  const isAnimating = useRef(false);

  // slotOf[cardIndex] = which slot that card currently occupies
  // Use state so rotate (derived from slot) stays fresh on each render
  const [slots, setSlots] = useState([0, 1, 2]); // card 0→back, card 1→mid, card 2→front
  const slotsRef = useRef([0, 1, 2]);             // mirror as ref for access inside callbacks

  // Delta animated values — always relative to the card's current resting position
  const txAnims      = useRef(IMAGES.map(() => new Animated.Value(0))).current;
  const tyAnims      = useRef(IMAGES.map(() => new Animated.Value(0))).current;
  const scaleAnims   = useRef(IMAGES.map((_, i) => new Animated.Value(SLOTS[i].scale))).current;
  const opacityAnims = useRef(IMAGES.map((_, i) => new Animated.Value(SLOTS[i].opacity))).current;

  // FIX 1: Stable base-position animated values — updated in callback, never re-created mid-render
  const baseTxAnims = useRef(IMAGES.map((_, i) => new Animated.Value(SLOTS[i].tx))).current;
  const baseTyAnims = useRef(IMAGES.map((_, i) => new Animated.Value(SLOTS[i].ty))).current;

  const [zIndices, setZIndices] = useState([
    SLOTS[0].zIndex,
    SLOTS[1].zIndex,
    SLOTS[2].zIndex,
  ]);

  const promote = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const currentSlots = slotsRef.current;
    const cardInBack  = currentSlots.indexOf(0);
    const cardInMid   = currentSlots.indexOf(1);
    const cardInFront = currentSlots.indexOf(2);

    // Deltas: from current slot → next slot
    const frontDeltaX = SLOTS[0].tx - SLOTS[2].tx;
    const frontDeltaY = SLOTS[0].ty - SLOTS[2].ty;
    const midDeltaX   = SLOTS[2].tx - SLOTS[1].tx;
    const midDeltaY   = SLOTS[2].ty - SLOTS[1].ty;
    const backDeltaX  = SLOTS[1].tx - SLOTS[0].tx;
    const backDeltaY  = SLOTS[1].ty - SLOTS[0].ty;

    // Raise mid card's zIndex so it layers above front during the transition
    setZIndices(prev => {
      const next = [...prev];
      next[cardInMid] = 4;
      return next;
    });

    Animated.parallel([
      // front → back
      Animated.sequence([
        Animated.timing(scaleAnims[cardInFront], { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnims[cardInFront], { toValue: SLOTS[0].scale, duration: DURATION - 100, useNativeDriver: true }),
      ]),
      Animated.timing(txAnims[cardInFront],      { toValue: frontDeltaX,    duration: DURATION, useNativeDriver: true }),
      Animated.timing(tyAnims[cardInFront],      { toValue: frontDeltaY,    duration: DURATION, useNativeDriver: true }),
      Animated.timing(opacityAnims[cardInFront], { toValue: SLOTS[0].opacity, duration: DURATION, useNativeDriver: true }),

      // mid → front
      Animated.timing(scaleAnims[cardInMid],     { toValue: SLOTS[2].scale,   duration: DURATION, useNativeDriver: true }),
      Animated.timing(txAnims[cardInMid],        { toValue: midDeltaX,        duration: DURATION, useNativeDriver: true }),
      Animated.timing(tyAnims[cardInMid],        { toValue: midDeltaY,        duration: DURATION, useNativeDriver: true }),
      Animated.timing(opacityAnims[cardInMid],   { toValue: SLOTS[2].opacity, duration: DURATION, useNativeDriver: true }),

      // back → mid
      Animated.timing(scaleAnims[cardInBack],    { toValue: SLOTS[1].scale,   duration: DURATION, useNativeDriver: true }),
      Animated.timing(txAnims[cardInBack],       { toValue: backDeltaX,       duration: DURATION, useNativeDriver: true }),
      Animated.timing(tyAnims[cardInBack],       { toValue: backDeltaY,       duration: DURATION, useNativeDriver: true }),
      Animated.timing(opacityAnims[cardInBack],  { toValue: SLOTS[1].opacity, duration: DURATION, useNativeDriver: true }),

    ]).start(() => {
      // Update logical slot assignments
      const nextSlots = [...currentSlots];
      nextSlots[cardInFront] = 0;
      nextSlots[cardInMid]   = 2;
      nextSlots[cardInBack]  = 1;
      slotsRef.current = nextSlots;

      // FIX 2: Snap base positions to the new slot, then reset deltas to 0 atomically.
      // This ensures the card visually stays exactly where the animation left it —
      // no jump, no blink. Order matters: base first, then delta reset.
      IMAGES.forEach((_, i) => {
        const newSlot = SLOTS[nextSlots[i]];
        baseTxAnims[i].setValue(newSlot.tx);
        baseTyAnims[i].setValue(newSlot.ty);
        txAnims[i].setValue(0);
        tyAnims[i].setValue(0);
        // FIX 3: Reset scale to correct per-slot value, not hardcoded 1
        scaleAnims[i].setValue(newSlot.scale);
      });

      // Restore correct zIndices
      setZIndices([
        SLOTS[nextSlots[0]].zIndex,
        SLOTS[nextSlots[1]].zIndex,
        SLOTS[nextSlots[2]].zIndex,
      ]);

      // FIX 4: Drive slots as state so rotate stays fresh on next render
      setSlots(nextSlots);

      setActiveDot(prev => (prev + 1) % 3);
      isAnimating.current = false;
    });
  };

  useEffect(() => {
    const timer = setInterval(promote, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F2F3F5]" edges={["top", "bottom"]}>

      {/* Skip */}
      <View className="flex-row justify-end px-6 pt-2 pb-2">
        <TouchableOpacity onPress={() => router.replace("/welcome/Step3" as any)} activeOpacity={0.7}>
          <Text className="text-cyan-700 font-quicksandBold text-sm">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Stacked cards */}
      <View
        className="items-center justify-center"
        style={{ height: SCREEN_WIDTH * 0.98, marginTop: 4 }}
      >
        {IMAGES.map((image, cardIndex) => {
          // FIX 4: Read rotate from `slots` state (not a stale ref) so it updates each cycle
          const currentSlot = SLOTS[slots[cardIndex]];
          return (
            <Animated.View
              key={cardIndex}
              style={{
                position: "absolute",
                width: CARD_W,
                height: CARD_H,
                borderRadius: 28,
                overflow: "hidden",
                zIndex: zIndices[cardIndex],
                opacity: opacityAnims[cardIndex],
                transform: [
                  { rotate: currentSlot.rotate },
                  // FIX 1: Use stable baseTxAnims/baseTyAnims — no inline `new Animated.Value`
                  { translateX: Animated.add(baseTxAnims[cardIndex], txAnims[cardIndex]) },
                  { translateY: Animated.add(baseTyAnims[cardIndex], tyAnims[cardIndex]) },
                  { scale: scaleAnims[cardIndex] },
                ],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: currentSlot.zIndex * 4 },
                shadowOpacity: 0.08 + currentSlot.zIndex * 0.03,
                shadowRadius: currentSlot.zIndex * 6,
                elevation: currentSlot.zIndex * 3,
              }}
            >
              <Image
                source={image}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </Animated.View>
          );
        })}
      </View>

      {/* Dots */}
      <View className="flex-row items-center justify-center gap-1.5 mt-4 mb-7">
        {[0, 1, 2].map(i => (
          <View
            key={i}
            className="rounded-full"
            style={{
              width: i === activeDot ? 20 : 7,
              height: 7,
              backgroundColor: i === activeDot ? "#0E7490" : "#CBD5E1",
            }}
          />
        ))}
      </View>

      {/* Text */}
      <View className="items-center px-8 mb-8">
        <Text className="text-3xl text-center leading-tight">
          <Text className="font-quicksandMedium text-gray-400">
            {t("step1.titleLight", { defaultValue: "Welcome\nto the " })}
          </Text>
          <Text className="font-quicksandBold text-gray-800">
            {t("step1.titleBold", { defaultValue: "Talenta" })}
          </Text>
        </Text>
        <Text className="text-gray-400 font-quicksandMedium text-sm text-center mt-3 leading-relaxed">
          {t("step1.subtitle", {
            defaultValue: "Your dream job is waiting for you to explore!.",
          })}
        </Text>
      </View>

      {/* Continue button */}
      <View className="px-6 mt-auto mb-2">
        <TouchableOpacity
          onPress={() => router.push("/welcome/Step2")}
          activeOpacity={0.85}
          className="bg-cyan-700 rounded-full py-4 flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-quicksandBold text-base">
            {t("step1.nextButton", { defaultValue: "Continue" })}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}