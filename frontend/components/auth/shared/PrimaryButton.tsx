import { Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  className?: string;
  disabled?: boolean;

  children?: React.ReactNode;
}

export default function PrimaryButton({
  title,
  children,
  onPress,
  className = "",
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl py-4 items-center justify-center flex flex-row ${
        disabled ? "bg-gray-400" : "bg-cyan-700"
      } ${className}`}
    >
      {children ? (
        children
      ) : (
        <Text className="text-white font-quicksandBold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
