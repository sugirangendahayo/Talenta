import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress?: () => void;
}

const ActionButton = ({ icon, label, color, onPress }: ActionButtonProps) => (
  <TouchableOpacity
    className="flex-1 items-center mx-1"
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      className="w-full aspect-square rounded-2xl items-center justify-center mb-2 border border-gray-200"
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <Text className="text-xs font-quicksandBold text-gray-700 text-center">
      {label}
    </Text>
  </TouchableOpacity>
);

export default function QuickActions() {
  const { t } = useTranslation("dashboard");

  const actions = [
    {
      icon: "add-circle" as keyof typeof Ionicons.glyphMap,
      label: t("quickActions.postJob"),
      color: "#0E7490",
      onPress: () => console.log("Post Job"),
    },
    {
      icon: "search" as keyof typeof Ionicons.glyphMap,
      label: t("quickActions.findCandidates"),
      color: "#10B981",
      onPress: () => console.log("Find Candidates"),
    },
    {
      icon: "stats-chart" as keyof typeof Ionicons.glyphMap,
      label: t("quickActions.viewStats"),
      color: "#F59E0B",
      onPress: () => console.log("View Stats"),
    },
    {
      icon: "people" as keyof typeof Ionicons.glyphMap,
      label: t("quickActions.teamManage"),
      color: "#8B5CF6",
      onPress: () => console.log("Team Manage"),
    },
  ];

  return (
    <View className="px-4 py-2">
      <View className="flex flex-row">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </View>
    </View>
  );
}
