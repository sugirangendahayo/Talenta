import { Text, TouchableOpacity, View } from "react-native";

interface MultiSelectFieldProps {
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export default function MultiSelectField({
  options,
  selectedValues,
  onToggle,
}: MultiSelectFieldProps) {
  return (
    <View className="flex flex-row flex-wrap gap-2">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onToggle(option)}
          className={`px-3 py-2 rounded-full border ${
            selectedValues.includes(option)
              ? "bg-cyan-700 dark:bg-cyan-800 border-cyan-700 border"
              : "bg-white dark:bg-[#080A08] border-gray-300 border"
          }`}
        >
          <Text
            className={`font-quicksandMedium text-sm ${
              selectedValues.includes(option) ? "text-white" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
