// components/jobseeker/HomeStats.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

interface Stat {
  icon: keyof typeof Ionicons.glyphMap;
  valueKey: string;
  labelKey: string;
  color: string;
  bg: string;
  fetchFn?: () => Promise<number>;
}

export default function HomeStats() {
  const { t } = useTranslation("home");
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [{ count: jobs }, { count: companies }] = await Promise.all([
          supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("employer_profiles").select("*", { count: "exact", head: true }),
        ]);
        if (jobs !== null) setJobCount(jobs);
        if (companies !== null) setCompanyCount(companies);
      } catch {
        // Silently fail — stats are decorative
      }
    };
    fetchCounts();
  }, []);

  const formatCount = (n: number | null) => {
    if (n === null) return "—";
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`;
    return `${n}+`;
  };

  const stats = [
    {
      icon: "briefcase-outline" as const,
      value: formatCount(jobCount),
      label: t("stats.activeJobs", { defaultValue: "Active Jobs" }),
      color: "#0E7490",
      bg: "#ECFEFF",
    },
    {
      icon: "business-outline" as const,
      value: formatCount(companyCount),
      label: t("stats.companies", { defaultValue: "Companies" }),
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
    {
      icon: "checkmark-circle-outline" as const,
      value: "100%",
      label: t("stats.free", { defaultValue: "Free to Use" }),
      color: "#059669",
      bg: "#ECFDF5",
    },
  ];

  return (
    <View className="flex-row mx-6 mb-6 gap-3">
      {stats.map((stat, i) => (
        <View
          key={i}
          className="flex-1 rounded-2xl items-center py-4 px-2"
          style={{ backgroundColor: stat.bg }}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mb-2"
            style={{ backgroundColor: stat.color + "20" }}
          >
            <Ionicons name={stat.icon} size={18} color={stat.color} />
          </View>
          <Text
            className="text-base font-quicksandBold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </Text>
          <Text className="text-gray-500 font-quicksandMedium text-xs text-center mt-0.5">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}