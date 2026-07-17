import { Text, TouchableOpacity } from "react-native";

interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
  variant?: "solid" | "outline";
  children?: React.ReactNode;
}

export default function PrimaryButton({
  title,
  children,
  onPress,
  className = "",
  disabled = false,
  variant = "solid",
}: PrimaryButtonProps) {
  const getVariantStyles = () => {
    if (disabled) return "bg-gray-400";
    if (variant === "outline") return "bg-transparent border border-cyan-700 dark:border-cyan-800";
    return "bg-cyan-700 dark:bg-cyan-800";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`rounded-2xl py-4 items-center justify-center flex flex-row ${getVariantStyles()} ${className}`}
    >
      {children ? (
        children
      ) : (
        <Text className="text-white font-quicksandBold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
