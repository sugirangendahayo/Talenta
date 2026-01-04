import { TouchableOpacity, Text } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  className = "",
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl py-4 items-center ${
        disabled ? "bg-gray-400" : "bg-cyan-700"
      } ${className}`}
    >
      <Text className="text-white font-quicksandBold text-base">{title}</Text>
    </TouchableOpacity>
  );
}
