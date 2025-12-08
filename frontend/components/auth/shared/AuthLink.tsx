import { View, Text, TouchableOpacity } from "react-native";

interface AuthLinkProps {
  text?: string;
  linkText: string;
  onPress?: () => void;
  align?: "left" | "center" | "right";
  className?: string;
}

export default function AuthLink({
  text,
  linkText,
  onPress,
  align = "center",
  className = "",
}: AuthLinkProps) {
  const alignClass =
    align === "center"
      ? "items-center"
      : align === "right"
        ? "items-end"
        : "items-start";

  return (
    <View className={`${alignClass} mb-8 ${className}`}>
      {text ? (
        <Text className="text-gray-600 font-quicksandMedium">
          {text}{" "}
          <Text className="text-cyan-700 font-quicksandBold" onPress={onPress}>
            {linkText}
          </Text>
        </Text>
      ) : (
        <TouchableOpacity onPress={onPress}>
          <Text className="text-cyan-700 font-quicksandBold">{linkText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
