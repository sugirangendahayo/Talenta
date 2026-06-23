import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "email-address";
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  multiline = false,
  required = false,
  keyboardType = "default",
}: FormInputProps) {
  return (
    <View className="mb-4">
      {/* Label */}
      <View className="flex flex-row items-center mb-2 gap-1">
        {icon && <Ionicons name={icon} size={16} color="#0E7490" />}
        <Text className="text-sm font-quicksandBold text-gray-700 dark:text-gray-300">
          {label}
        </Text>
        {required && <Text className="text-red-500 font-quicksandBold">*</Text>}
      </View>

      {/* Input */}
      <View
        className={`bg-white dark:bg-[#080A08] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 ${
          multiline ? "py-3" : "py-3"
        }`}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
          className="text-gray-800 dark:text-gray-200 font-quicksandMedium text-base"
          style={{ includeFontPadding: false }}
        />
      </View>
    </View>
  );
}
