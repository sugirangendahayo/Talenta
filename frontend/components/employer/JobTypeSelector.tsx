import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface JobTypeSelectorProps {
  label: string;
  selected: string[];
  onSelect: (type: string) => void;
  required?: boolean;
}

export default function JobTypeSelector({
  label,
  selected,
  onSelect,
  required = false,
}: JobTypeSelectorProps) {
  const types = [
    { id: "Full-time", icon: "briefcase" },
    { id: "Part-time", icon: "time" },
    { id: "Contract", icon: "document-text" },
    { id: "Remote", icon: "home" },
    { id: "On-site", icon: "business" },
    { id: "Hybrid", icon: "git-network" },
  ];

  const isSelected = (type: string) => selected.includes(type);

  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        <Ionicons name="options-outline" size={16} color="#0E7490" />
        <Text className="text-sm font-quicksandBold text-gray-700">
          {label}
        </Text>
        {required && <Text className="text-red-500 font-quicksandBold">*</Text>}
      </View>
      <Text className="text-xs font-quicksandMedium text-gray-500 mb-2">
        Select all that apply
      </Text>

      {/* Types Grid */}
      <View className="flex flex-row flex-wrap gap-2">
        {types.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => onSelect(type.id)}
            className={`flex flex-row items-center gap-2 px-4 py-2 rounded-full border ${
              isSelected(type.id)
                ? "bg-cyan-700 border-cyan-600"
                : "bg-white border-gray-200"
            }`}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={isSelected(type.id) ? "white" : "#6B7280"}
            />
            <Text
              className={`text-sm font-quicksandBold ${
                isSelected(type.id) ? "text-white" : "text-gray-700"
              }`}
            >
              {type.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
