import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PremiumSuccessModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center p-6">
        <View className="bg-white dark:bg-[#1e1e1e] rounded-3xl w-full p-6 items-center">
          <View className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={36} color="#059669" />
          </View>
          
          <Text className="text-2xl font-quicksandBold text-gray-900 dark:text-gray-100 text-center mb-2">
            Congratulations!
          </Text>
          
          <Text className="text-base font-quicksandMedium text-gray-500 dark:text-gray-400 text-center mb-8 px-4">
            Welcome to Talenta Premium.{"\n"}Your subscription has been activated successfully.
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="w-full bg-cyan-700 rounded-2xl py-3.5 items-center justify-center"
            activeOpacity={0.85}
          >
            <Text className="text-white font-quicksandBold text-base">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
