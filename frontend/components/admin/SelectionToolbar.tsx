import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface SelectionToolbarProps {
  count: number;
  allSelected: boolean;
  onToggleAll: () => void;
  onClose: () => void;
}

/** A compact replacement for list headers while multi-select is active. */
export default function SelectionToolbar({
  count,
  allSelected,
  onToggleAll,
  onClose,
}: SelectionToolbarProps) {
  return (
    <View className="bg-white dark:bg-[#080A08] px-6 pt-16 pb-5 flex-row items-center border-b border-gray-100 dark:border-[#2a2a2a]">
      <TouchableOpacity
        onPress={onClose}
        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center mr-3"
        accessibilityRole="button"
        accessibilityLabel="Cancel selection"
      >
        <Ionicons name="close" size={21} color="#0E7490" />
      </TouchableOpacity>
      <Text className="flex-1 text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
        {count} selected
      </Text>
      <TouchableOpacity
        onPress={onToggleAll}
        className="px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/20"
        accessibilityRole="button"
      >
        <Text className="text-xs font-quicksandBold text-cyan-700 dark:text-cyan-400">
          {allSelected ? "Deselect all" : "Select all"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
