import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface SkillsInputProps {
  label: string;
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (index: number) => void;
  required?: boolean;
  placeholder?: string;
}

export default function SkillsInput({
  label,
  skills,
  onAdd,
  onRemove,
  required = false,
  placeholder = "e.g., React, TypeScript",
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        <Ionicons name="checkmark-circle-outline" size={16} color="#0E7490" />
        <Text className="text-sm font-quicksandBold text-gray-700 dark:text-gray-300">
          {label}
        </Text>
        {required && <Text className="text-red-500 font-quicksandBold">*</Text>}
      </View>

      {/* Input + Add Button */}
      <View className="flex flex-row gap-2 mb-3">
        <View className="flex-1 bg-white dark:bg-[#080A08] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3">
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            className="text-gray-800 dark:text-gray-200 font-quicksandMedium text-base"
          />
        </View>
        <TouchableOpacity
          onPress={handleAdd}
          className="bg-cyan-700 dark:bg-cyan-800 px-4 rounded-xl items-center justify-center flex"
          disabled={!inputValue.trim()}
          style={{ opacity: inputValue.trim() ? 1 : 0.5 }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Skills List */}
      {skills.length > 0 && (
        <View className="flex flex-row flex-wrap gap-2">
          {skills.map((skill, index) => (
            <View
              key={index}
              className="flex flex-row items-center gap-2 bg-cyan-100 px-3 py-2 rounded-full"
            >
              <Text className="text-sm font-quicksandBold text-cyan-800 dark:text-cyan-300">
                {skill}
              </Text>
              <TouchableOpacity onPress={() => onRemove(index)}>
                <Ionicons name="close-circle" size={18} color="#0E7490" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
