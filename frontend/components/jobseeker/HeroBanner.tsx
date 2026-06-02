// components/jobseeker/HeroBanner.tsx
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_MARGIN = 12;

interface BannerSlide {
  id: string;
  titleKey: string;
  subtitleKey: string;
  ctaKey: string;
  route: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  subtitleColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  decorColor: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: "1",
    titleKey: "banner.slide1.title",
    subtitleKey: "banner.slide1.subtitle",
    ctaKey: "banner.slide1.cta",
    route: "/jobseekers/complete-profile",
    accentColor: "#0E7490",
    bgColor: "#ECFEFF",
    textColor: "#164E63",
    subtitleColor: "#0E7490",
    icon: "rocket-outline",
    iconBg: "#CFFAFE",
    decorColor: "#A5F3FC",
  },
  {
    id: "2",
    titleKey: "banner.slide2.title",
    subtitleKey: "banner.slide2.subtitle",
    ctaKey: "banner.slide2.cta",
    route: "/jobseekers/upload-cv",
    accentColor: "#7C3AED",
    bgColor: "#F5F3FF",
    textColor: "#4C1D95",
    subtitleColor: "#7C3AED",
    icon: "document-text-outline",
    iconBg: "#EDE9FE",
    decorColor: "#DDD6FE",
  },
  {
    id: "3",
    titleKey: "banner.slide3.title",
    subtitleKey: "banner.slide3.subtitle",
    ctaKey: "banner.slide3.cta",
    route: "/jobseekers/jobs",
    accentColor: "#059669",
    bgColor: "#ECFDF5",
    textColor: "#064E3B",
    subtitleColor: "#059669",
    icon: "briefcase-outline",
    iconBg: "#D1FAE5",
    decorColor: "#A7F3D0",
  },
];

export default function HeroBanner() {
  const router = useRouter();
  const { t } = useTranslation("home");
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = () => {
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, []);

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN));
    setActiveIndex(index);
    // Reset timer on manual swipe
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    startAutoScroll();
  };

  const renderSlide = ({ item }: { item: BannerSlide }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(item.route as any)}
      style={{ width: CARD_WIDTH, marginRight: CARD_MARGIN }}
    >
      <View
        className="rounded-3xl p-5 overflow-hidden"
        style={{ backgroundColor: item.bgColor, minHeight: 140 }}
      >
        {/* Decorative circles */}
        <View
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-50"
          style={{ backgroundColor: item.decorColor }}
        />
        <View
          className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full opacity-30"
          style={{ backgroundColor: item.decorColor }}
        />

        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text
              className="text-xl font-quicksandBold leading-tight mb-1"
              style={{ color: item.textColor }}
            >
              {t(item.titleKey, { defaultValue: item.titleKey })}
            </Text>
            <Text
              className="text-sm font-quicksandMedium mb-4 leading-relaxed"
              style={{ color: item.subtitleColor }}
            >
              {t(item.subtitleKey, { defaultValue: item.subtitleKey })}
            </Text>
            <View
              className="self-start flex-row items-center px-4 py-2 rounded-full"
              style={{ backgroundColor: item.accentColor }}
            >
              <Text className="text-white font-quicksandBold text-xs mr-1">
                {t(item.ctaKey, { defaultValue: "Get Started" })}
              </Text>
              <Ionicons name="arrow-forward" size={12} color="white" />
            </View>
          </View>

          {/* Icon */}
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: item.iconBg }}
          >
            <Ionicons name={item.icon} size={28} color={item.accentColor} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="mb-2">
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_MARGIN,
          offset: (CARD_WIDTH + CARD_MARGIN) * index,
          index,
        })}
      />

      {/* Dot indicators */}
      <View className="flex-row justify-center items-center mt-3 gap-1.5">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className="rounded-full"
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              backgroundColor: i === activeIndex ? "#0E7490" : "#CBD5E1",
              transition: "width 0.3s",
            }}
          />
        ))}
      </View>
    </View>
  );
}