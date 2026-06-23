import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface CategorySelectorProps {
  label: string;
  selected: string;
  onSelect: (category: string) => void;
  required?: boolean;
}

export default function CategorySelector({
  label,
  selected,
  onSelect,
  required = false,
}: CategorySelectorProps) {
  const { t } = useTranslation("categories");

  const categories = [
    { id: "it", name: t("categories.it"), icon: "laptop-outline" },
    {
      id: "design",
      name: t("categories.design"),
      icon: "color-palette-outline",
    },
    {
      id: "business",
      name: t("categories.business"),
      icon: "briefcase-outline",
    },
    {
      id: "construction",
      name: t("categories.construction"),
      icon: "hammer-outline",
    },
    { id: "finance", name: t("categories.finance"), icon: "cash-outline" },
    {
      id: "healthcare",
      name: t("categories.healthcare"),
      icon: "medical-outline",
    },
    {
      id: "education",
      name: t("categories.education"),
      icon: "school-outline",
    },
    { id: "sales", name: t("categories.sales"), icon: "trending-up-outline" },
    {
      id: "hospitality",
      name: t("categories.hospitality"),
      icon: "restaurant-outline",
    },
    { id: "transport", name: t("categories.transport"), icon: "car-outline" },
    { id: "creative", name: t("categories.creative"), icon: "bulb-outline" },
    {
      id: "agriculture",
      name: t("categories.agriculture"),
      icon: "leaf-outline",
    },
    {
      id: "security",
      name: t("categories.security"),
      icon: "shield-checkmark-outline",
    },
  ];

  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        <Ionicons name="grid-outline" size={16} color="#0E7490" />
        <Text className="text-sm font-quicksandBold text-gray-700 dark:text-gray-300">
          {label}
        </Text>
        {required && <Text className="text-red-500 font-quicksandBold">*</Text>}
      </View>

      {/* Categories Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <View className="flex flex-row gap-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelect(category.id)}
              className={`flex items-center justify-center px-4 py-3 rounded-xl border ${
                selected === category.id
                  ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-600"
                  : "bg-white dark:bg-[#080A08] border-gray-200 dark:border-[#2a2a2a]"
              }`}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selected === category.id ? "white" : "#0E7490"}
              />
              <Text
                className={`text-xs font-quicksandBold mt-1 ${
                  selected === category.id ? "text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
