// components/jobseeker/HomeStats.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";

export default function HomeStats() {
  const { t } = useTranslation("home");
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [companyCount, setCompanyCount] = useState<number | null>(null);

  useEffect(() => {
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
        if (jobs !== null) setJobCount(jobs);
        if (companies !== null) setCompanyCount(companies);
      } catch (error) {
        // Non-critical — the strip just shows "—" — but still worth a trace
        // if the query starts failing for real (RLS change, schema drift).
        console.warn("HomeStats: failed to load counts", error);
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
    },
    {
      icon: "business-outline" as const,
      value: formatCount(companyCount),
      label: t("stats.companies", { defaultValue: "Companies" }),
    },
    {
      icon: "checkmark-circle-outline" as const,
      value: "100%",
      label: t("stats.free", { defaultValue: "Free to use" }),
    },
  ];

  return (
    <View className="flex-row mx-6 mb-6 gap-3">
      {stats.map((stat, i) => (
        <View
          key={i}
          accessible
          accessibilityLabel={`${stat.value} ${stat.label}`}
          className="flex-1 bg-white dark:bg-[#080A08] border border-gray-100 dark:border-[#222] shadow-sm rounded-2xl items-center py-4 px-2"
        >
          <View className="w-9 h-9 rounded-xl items-center justify-center mb-2 bg-cyan-50 border border-cyan-100">
            <Ionicons name={stat.icon} size={17} color="#0E7490" />
          </View>

          <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-200">
            {stat.value}
          </Text>
          <Text className="text-gray-400 font-quicksandMedium text-xs text-center mt-0.5">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}