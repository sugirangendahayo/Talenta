import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string | number;
  label: string;
  badge?: string;
}

const StatCard = ({ icon, iconColor, value, label, badge }: StatCardProps) => (
  <TouchableOpacity className="flex-1 bg-white rounded-2xl p-4 border border-gray-200 mx-1">
    <View className="flex items-center">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text className="text-2xl font-quicksandBold text-gray-800">{value}</Text>
      <Text className="text-xs font-quicksandMedium text-gray-500 text-center mt-1">
        {label}
      </Text>
      {badge && (
        <View className="bg-red-100 px-2 py-1 rounded-full mt-2">
          <Text className="text-xs font-quicksandBold text-red-600">
            {badge}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function StatCards() {
  const stats = [
    {
      icon: "briefcase" as keyof typeof Ionicons.glyphMap,
      iconColor: "#0E7490",
      value: 12,
      label: "Active Jobs",
    },
    {
      icon: "people" as keyof typeof Ionicons.glyphMap,
      iconColor: "#10B981",
      value: 156,
      label: "Total Applicants",
    },
    {
      icon: "calendar" as keyof typeof Ionicons.glyphMap,
      iconColor: "#F59E0B",
      value: 8,
      label: "Scheduled",
    },
    {
      icon: "mail" as keyof typeof Ionicons.glyphMap,
      iconColor: "#8B5CF6",
      value: 16,
      label: "Messages",
      badge: "3 new",
    },
  ];

  return (
    <View className="flex flex-row flex-wrap px-3 py-4">
      {stats.map((stat, index) => (
        <View className="w-1/2 mb-3" key={index}>
          <StatCard {...stat} />
        </View>
      ))}
    </View>
  );
}
