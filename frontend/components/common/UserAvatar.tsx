// components/common/UserAvatar.tsx
// Reusable avatar component — shows profile image when available, falls back to initials.
import React from "react";
import { Image, Text, View, ViewStyle } from "react-native";

interface UserAvatarProps {
  imageUrl?: string | null;
  name: string; // Used to derive the fallback initial(s)
  size?: number; // Diameter in px, default 44
  style?: ViewStyle;
}

/**
 * Renders a circular avatar.
 * - If `imageUrl` is set: shows the image.
 * - Otherwise: shows the first letter(s) of `name` on a cyan background.
 */
export default function UserAvatar({
  imageUrl,
  name,
  size = 44,
  style,
}: UserAvatarProps) {
  // Build initials: first letter of each word, capped at 2 chars.
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const radius = size / 2;
  const fontSize = Math.round(size * 0.38);

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: "#ECFEFF",
          },
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: "#ECFEFF",
          borderWidth: 1,
          borderColor: "#CFFAFE",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize,
          fontFamily: "Quicksand-Bold",
          color: "#0E7490",
          lineHeight: fontSize * 1.2,
        }}
      >
        {initials || "?"}
      </Text>
    </View>
  );
}
