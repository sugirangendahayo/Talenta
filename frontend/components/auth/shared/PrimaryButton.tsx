import { TouchableOpacity, Text } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  className = "",
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-cyan-700 rounded-2xl py-4 items-center ${className}`}
    >
      <Text className="text-white font-quicksandBold text-base">{title}</Text>
    </TouchableOpacity>
  );
}
