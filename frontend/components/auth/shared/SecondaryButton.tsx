import { TouchableOpacity, Text } from "react-native";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  className?: string;
}

export default function SecondaryButton({
  title,
  onPress,
  className = "",
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-gray-200 rounded-2xl py-4 items-center ${className}`}
    >
      <Text className="text-gray-700 font-quicksandBold text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
