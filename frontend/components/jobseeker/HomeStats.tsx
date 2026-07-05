// components/jobseeker/HomeStats.tsx
import { supabase } from "@/lib/supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type IonIconName = keyof typeof Ionicons.glyphMap;

type StatIcon =
  | { kind: "ionicon"; name: IonIconName }
  | { kind: "fontawesome"; name: keyof typeof FontAwesome.glyphMap };

type StatConfig = {
  key: "activeJobs" | "companies" | "free";
  icon: StatIcon;
  labelKey: string;
  labelDefault: string;
  hero?: boolean;
};

// Static — icons and labels never change render to render, only the values do.
const STAT_CONFIG: StatConfig[] = [
  {
    key: "activeJobs",
    icon: { kind: "ionicon", name: "briefcase-outline" },
    labelKey: "stats.activeJobs",
    labelDefault: "Active Jobs",
    hero: true,
  },
  {
    key: "companies",
    icon: { kind: "fontawesome", name: "handshake-o" },
    labelKey: "stats.companies",
    labelDefault: "Companies",
  },
  {
    key: "free",
    icon: { kind: "ionicon", name: "checkmark-circle-outline" },
    labelKey: "stats.free",
    labelDefault: "Free to use",
  },
];

function StatWatermark({ icon, size }: { icon: StatIcon; size: number }) {
  if (icon.kind === "fontawesome") {
    return <FontAwesome name={icon.name} size={size} color="#0E7490" />;
  }
  return <Ionicons name={icon.name} size={size} color="#0E7490" />;
}

function formatCount(n: number | null) {
  if (n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`;
  return `${n}+`;
}

export default function HomeStats() {
  const { t } = useTranslation("home");
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCounts = async () => {
      try {
        const [{ count: jobs }, { count: companies }] = await Promise.all([
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase
            .from("employer_profiles")
            .select("*", { count: "exact", head: true }),
        ]);
        if (!isMounted) return;
        if (jobs !== null) setJobCount(jobs);
        if (companies !== null) setCompanyCount(companies);
      } catch {
        // Non-critical — the strip just falls back to "—". Surface failures
        // through the app's logging/monitoring util instead of console.
      }
    };

    fetchCounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const values: Record<StatConfig["key"], string> = {
    activeJobs: formatCount(jobCount),
    companies: formatCount(companyCount),
    free: "100%",
  };

  const [heroStat, ...restStats] = STAT_CONFIG;

  return (
    <View
      className="flex-row mx-6 mb-6 bg-white dark:bg-[#0E0E0E] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Hero segment — active jobs is the number that signals the app is alive */}
      <View
        accessible
        accessibilityLabel={`${values[heroStat.key]} ${t(heroStat.labelKey, {
          defaultValue: heroStat.labelDefault,
        })}`}
        className="flex-[1.2] justify-center py-5 pl-5 pr-3 overflow-hidden"
      >
        <View className="absolute -right-2 -bottom-3 opacity-[0.07]">
          <StatWatermark icon={heroStat.icon} size={72} />
        </View>
        <Text className="text-3xl font-quicksandBold text-gray-800 dark:text-gray-100">
          {values[heroStat.key]}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-quicksandMedium text-xs mt-0.5">
          {t(heroStat.labelKey, { defaultValue: heroStat.labelDefault })}
        </Text>
      </View>

      <View className="w-px bg-gray-100 dark:bg-[#222] my-4" />

      {/* Secondary segments — smaller footprint, same watermark language */}
      {restStats.map((stat, i) => {
        const label = t(stat.labelKey, { defaultValue: stat.labelDefault });
        return (
          <View key={stat.key} className="flex-1 flex-row items-center">
            <View
              accessible
              accessibilityLabel={`${values[stat.key]} ${label}`}
              className="flex-1 justify-center py-5 px-3 overflow-hidden"
            >
              <View className="absolute -right-3 -bottom-2 opacity-[0.06]">
                <StatWatermark icon={stat.icon} size={44} />
              </View>
              <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100">
                {values[stat.key]}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs mt-0.5">
                {label}
              </Text>
            </View>
            {i < restStats.length - 1 && (
              <View className="w-px h-8 bg-gray-100 dark:bg-[#222]" />
            )}
          </View>
        );
      })}
    </View>
  );
}