import { Ionicons } from "@expo/vector-icons";
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
  const categories = [
    { id: "it", name: "IT & Software", icon: "laptop-outline" },
    { id: "design", name: "Design", icon: "color-palette-outline" },
    { id: "business", name: "Business", icon: "briefcase-outline" },
    { id: "construction", name: "Construction", icon: "hammer-outline" },
    { id: "finance", name: "Finance", icon: "cash-outline" },
    { id: "healthcare", name: "Healthcare", icon: "medical-outline" },
    { id: "education", name: "Education", icon: "school-outline" },
    { id: "sales", name: "Sales & Marketing", icon: "trending-up-outline" },
    { id: "hospitality", name: "Hospitality", icon: "restaurant-outline" },
    { id: "transport", name: "Transport", icon: "car-outline" },
    { id: "creative", name: "Creative", icon: "bulb-outline" },
    { id: "agriculture", name: "Agriculture", icon: "leaf-outline" },
    {
      id: "security",
      name: "Security & Law",
      icon: "shield-checkmark-outline",
    },
  ];

  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        <Ionicons name="grid-outline" size={16} color="#0E7490" />
        <Text className="text-sm font-quicksandBold text-gray-700">
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
                  ? "bg-cyan-700 border-cyan-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selected === category.id ? "white" : "#0E7490"}
              />
              <Text
                className={`text-xs font-quicksandBold mt-1 ${
                  selected === category.id ? "text-white" : "text-gray-700"
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
