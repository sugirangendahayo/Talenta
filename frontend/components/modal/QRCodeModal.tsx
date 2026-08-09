// components/modal/QRCodeModal.tsx
// Shows a scannable QR code that deep-links directly to the user's public
// in-app profile (`talenta://user/<id>`). The profile route supports signed-out
// visitors, so recipients do not need to be logged in to view public details.
import React from "react";
import {
  Modal,
  Pressable,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/common/UserAvatar";

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  role: "jobseeker" | "employer";
  displayName: string;
  username?: string | null;
  avatarUrl?: string | null;
  verified?: boolean;
}

export default function QRCodeModal({
  visible,
  onClose,
  userId,
  role,
  displayName,
  username,
  avatarUrl,
  verified,
}: QRCodeModalProps) {
  const { t } = useTranslation("profile");

  // Deep link handled by expo-router's file-based routing at
  // app/(shared)/user/[id].tsx — the `(shared)` group is dropped from the
  // resolved path, so this resolves to that screen directly.
  const profileLink = `talenta://user/${userId}?role=${role}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: t("qrCode.shareMessage", {
          name: displayName,
          link: profileLink,
          defaultValue: `Check out ${displayName}'s profile on Talenta: ${profileLink}`,
        }),
      });
    } catch {
      // Non-fatal — sharing is a convenience action
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white dark:bg-[#141414] w-full rounded-3xl p-6 items-center max-w-[360px]">
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 items-center justify-center z-10"
          >
            <Ionicons name="close" size={18} color="#6B7280" />
          </TouchableOpacity>

          <Text className="text-lg font-quicksandBold text-gray-900 dark:text-gray-100 mt-1 mb-5">
            {t("qrCode.title", { defaultValue: "My QR Code" })}
          </Text>

          {/* QR code sits on a solid white card regardless of theme — keeps
              scan contrast high and avoids issues with dark backgrounds. */}
          <View
            className="bg-white p-4 rounded-2xl border border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <QRCode
              value={profileLink}
              size={200}
              color="#0F172A"
              backgroundColor="#FFFFFF"
            />
          </View>

          {/* Identity block */}
          <View className="flex-row items-center mt-5" style={{ gap: 10 }}>
            <UserAvatar imageUrl={avatarUrl} name={displayName} size={36} />
            <View>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                <Text
                  className="text-base font-quicksandBold text-gray-900 dark:text-gray-100"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {verified && (
                  <MaterialIcons name="verified" size={14} color="#0E7490" />
                )}
              </View>
              {username ? (
                <Text className="text-xs font-quicksandSemibold text-cyan-600 dark:text-cyan-400">
                  @{username}
                </Text>
              ) : null}
            </View>
          </View>

          <Text className="text-center text-gray-400 dark:text-gray-500 font-quicksandMedium text-xs mt-4 leading-5">
            {t("qrCode.hint", {
              defaultValue:
                "Anyone with Talenta can scan this code to view this public profile.",
            })}
          </Text>

          {/* Share */}
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.85}
            className="flex-row items-center justify-center bg-cyan-700 dark:bg-cyan-800 py-3.5 rounded-2xl mt-5 w-full"
            style={{ gap: 8 }}
          >
            <Ionicons name="share-social-outline" size={18} color="#fff" />
            <Text className="text-white text-center font-quicksandBold text-[15px]">
              {t("qrCode.share", { defaultValue: "Share Profile" })}
            </Text>
          </TouchableOpacity>
        </View>

        <Pressable
          className="absolute inset-0 -z-10"
          onPress={onClose}
          accessible={false}
        />
      </View>
    </Modal>
  );
}
