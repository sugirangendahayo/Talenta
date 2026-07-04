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
};

// Static — icons and labels never change render to render, only the values do.
const STAT_CONFIG: StatConfig[] = [
  {
    key: "activeJobs",
    icon: { kind: "ionicon", name: "briefcase-outline" },
    labelKey: "stats.activeJobs",
    labelDefault: "Active Jobs",
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

function StatIconGlyph({ icon }: { icon: StatIcon }) {
  if (icon.kind === "fontawesome") {
    return <FontAwesome name={icon.name} size={17} color="#0E7490" />;
  }
  return <Ionicons name={icon.name} size={17} color="#0E7490" />;
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

  return (
    <View className="flex-row mx-6 mb-6 gap-3">
      {STAT_CONFIG.map((stat) => {
        const value = values[stat.key];
        const label = t(stat.labelKey, { defaultValue: stat.labelDefault });

        return (
          <View
            key={stat.key}
            accessible
            accessibilityLabel={`${value} ${label}`}
            className="flex-1 bg-white dark:bg-[#0E0E0E] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl items-center py-4 px-2"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="w-9 h-9 rounded-xl items-center justify-center mb-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800">
              <StatIconGlyph icon={stat.icon} />
            </View>

            <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100">
              {value}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs text-center mt-0.5">
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}