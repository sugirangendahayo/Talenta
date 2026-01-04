import { Text, TouchableOpacity, View } from "react-native";

interface AuthLinkProps {
  text?: string;
  linkText: string;
  onPress?: () => void;
  className?: string;
  align?: "left" | "center" | "right";
}

export default function AuthLink({
  text,
  linkText,
  onPress,
  className = "",
  align = "center",
}: AuthLinkProps) {
  const alignmentClass =
    align === "left"
      ? "items-start"
      : align === "right"
        ? "items-end"
        : "items-center";

  return (
    <View className={`flex flex-row${alignmentClass} ${className}`}>
      {text && (
        <Text className="text-gray-600 font-quicksandMedium mr-1">{text}</Text>
      )}
      <TouchableOpacity onPress={onPress}>
        <Text className="text-cyan-700 font-quicksandBold">{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}
