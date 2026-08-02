// components/jobseeker/HeroBanner.tsx
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 200;
const SLIDE_INTERVAL = 5000;
const FADE_DURATION = 700;

interface BannerSlide {
  id: string;
  image: any;
  titleKey: string;
  subtitleKey: string;
  ctaKey: string;
  route: string;
}

// Remote business-context images — swap with local assets if preferred
const SLIDES: BannerSlide[] = [
  {
    id: "1",
    image: {
      uri: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    },
    titleKey: "banner.slide1.title",
    subtitleKey: "banner.slide1.subtitle",
    ctaKey: "banner.slide1.cta",
    route: "/jobseekers/complete-profile",
  },
  {
    id: "2",
    image: {
      uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    },
    titleKey: "banner.slide2.title",
    subtitleKey: "banner.slide2.subtitle",
    ctaKey: "banner.slide2.cta",
    route: "/jobseekers/upload-cv",
  },
  {
    id: "3",
    image: {
      uri: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
    },
    titleKey: "banner.slide3.title",
    subtitleKey: "banner.slide3.subtitle",
    ctaKey: "banner.slide3.cta",
    route: "/jobseekers/jobs",
  },
];

export default function HeroBanner() {
  const router = useRouter();
  const { t } = useTranslation("home");

  // One stable Animated.Value per slide — never recreated, never swapped
  const opacities = useRef(
    SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;

  const currentIndexRef = useRef(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const isAnimating = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const crossFadeTo = (next: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const prev = currentIndexRef.current;
    currentIndexRef.current = next;

    // Fade in the next slide on top; once done, snap the previous to 0
    Animated.timing(opacities[next], {
      toValue: 1,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      opacities[prev].setValue(0);
      setDisplayIndex(next); // only used for dots + CTA text — no image source change
      isAnimating.current = false;
    });
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const next = (currentIndexRef.current + 1) % SLIDES.length;
      crossFadeTo(next);
    }, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // empty — crossFadeTo reads currentIndexRef, not state

  const activeSlide = SLIDES[displayIndex];

  return (
    <View className="mx-6 mb-2">
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => router.push("/(jobseeker-tabs)/jobseekers/Jobs")}
        style={{ borderRadius: 24, overflow: "hidden", height: BANNER_HEIGHT }}
      >
        {/* All slides are permanently mounted; only their opacity animates */}
        {SLIDES.map((slide, i) => (
          <Animated.View
            key={slide.id}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: opacities[i],
            }}
          >
            <ImageBackground
              source={slide.image}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </Animated.View>
        ))}

        {/* Dark overlay — always on top of images, below content */}
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.38)",
          }}
        />

        {/* Content */}
        <View className="absolute inset-0 p-5 justify-end">
          <Text
            className="text-white font-quicksandBold text-xl leading-tight mb-1"
            numberOfLines={2}
          >
            {t(activeSlide.titleKey, { defaultValue: "Find your dream job" })}
          </Text>
          <Text
            className="text-white/80  font-quicksandMedium text-xs mb-4 leading-relaxed"
            numberOfLines={2}
          >
            {t(activeSlide.subtitleKey, {
              defaultValue: "Thousands of opportunities waiting for you",
            })}
          </Text>
          <View className="self-start flex-row items-center bg-white dark:bg-[#080A08]/20 border border-white/30 px-4 py-2 rounded-full">
            <Text className="text-black/80 dark:text-white font-quicksandBold text-xs mr-1.5">
              {t(activeSlide.ctaKey, { defaultValue: "Find job(s)" })}
            </Text>
            <Ionicons name="arrow-forward" size={12} color="black dark:white" />
          </View>
        </View>

        {/* Dot indicators — bottom right */}
        <View className="absolute bottom-4 right-5 flex-row items-center gap-1">
          {SLIDES.map((_, i) => (
            <View
              key={i}
              className="rounded-full bg-white dark:bg-[#080A08]"
              style={{
                width: i === displayIndex ? 16 : 5,
                height: 5,
                opacity: i === displayIndex ? 1 : 0.45,
              }}
            />
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );
}
