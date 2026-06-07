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
      } catch {
        // Silently fail — decorative
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
      value: "Free",
      label: t("stats.free", { defaultValue: "Always Free" }),
    },
  ];

  return (
    <View className="flex-row mx-6 mb-6 gap-3">
      {stats.map((stat, i) => (
        <View
          key={i}
          className="flex-1 rounded-2xl items-center py-4 px-2"
          style={{
            backgroundColor: "#F8FAFC",
            // Inset shadow simulation — outer shadow facing inward via border + bg contrast
            borderWidth: 1,
            borderColor: "#E2E8F0",
            shadowColor: "#94A3B8",
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.08,
            shadowRadius: 0,
          }}
        >
          {/* Icon container with inset-style look */}
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mb-2"
            style={{
              backgroundColor: "#EFF6FF",
              borderWidth: 1,
              borderColor: "#DBEAFE",
              // Inset shadow on the icon box
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 1,
            }}
          >
            <Ionicons name={stat.icon} size={17} color="#0E7490" />
          </View>

          <Text className="text-base font-quicksandBold text-gray-800">
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