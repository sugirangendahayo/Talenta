import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  children: ReactNode;
  showIconInside?: boolean;
}

export default function FieldWrapper({
  label,
  required = false,
  icon,
  children,
  showIconInside = true,
}: FieldWrapperProps) {
  return (
    <View>
      <Text className="text-gray-700 dark:text-gray-300 font-quicksandMedium mb-2">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <View className="relative bg-white dark:bg-[#080A08] rounded-2xl border-[1px] border-gray-300">
        {icon && showIconInside && (
          <MaterialIcons
            name={icon}
            size={20}
            color="#6B7280"
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              zIndex: 1,
            }}
          />
        )}
        {children}
      </View>
    </View>
  );
}
