import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PromptModal } from "@/components/common/PromptModal";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export type BulkAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  style?: "default" | "destructive";
  requiresReason?: boolean;
  requiresDuration?: boolean;
};

interface BulkActionSheetProps {
  visible: boolean;
  count: number;
  actions: BulkAction[];
  onClose: () => void;
  onAction: (actionId: string, reason?: string, duration?: number) => Promise<void> | void;
}

export default function BulkActionSheet({ visible, count, actions, onClose, onAction }: BulkActionSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [duration, setDuration] = useState<number | undefined>();

  useEffect(() => {
    Animated.parallel([
      visible
        ? Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 26, stiffness: 300, mass: 0.9 })
        : Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 180, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: visible ? 1 : 0, duration: visible ? 180 : 140, useNativeDriver: true }),
    ]).start();
  }, [backdropOpacity, translateY, visible]);

  const runAction = async (action: BulkAction, reason?: string, selectedDuration?: number) => {
    setPendingAction(null);
    onClose();
    await onAction(action.id, reason, selectedDuration);
  };

  const selectAction = (action: BulkAction) => {
    if (action.requiresDuration) {
      Alert.alert("Suspension duration", "Choose how long the selected accounts should be suspended.", [
        { text: "24 hours", onPress: () => { setDuration(24); setPendingAction(action); } },
        { text: "72 hours", onPress: () => { setDuration(72); setPendingAction(action); } },
        { text: "7 days", onPress: () => { setDuration(168); setPendingAction(action); } },
        { text: "30 days", onPress: () => { setDuration(720); setPendingAction(action); } },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    if (action.requiresReason) setPendingAction(action);
    else void runAction(action);
  };

  const requiresReason = pendingAction?.requiresReason || pendingAction?.requiresDuration;

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
        <View className="flex-1 justify-end">
          <Animated.View style={{ opacity: backdropOpacity }} className="absolute inset-0 bg-black/35">
            <Pressable className="flex-1" onPress={onClose} />
          </Animated.View>
          <Animated.View style={{ transform: [{ translateY }], paddingBottom: insets.bottom + 8 }} className="px-2">
            <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl overflow-hidden" style={{ elevation: 8 }}>
              <View className="px-5 py-4 border-b border-gray-100 dark:border-white/10">
                <Text className="text-lg font-quicksandBold text-gray-900 dark:text-gray-100">Actions</Text>
                <Text className="mt-1 text-sm font-quicksandMedium text-gray-500 dark:text-gray-400">
                  Apply an action to {count} selected {count === 1 ? "user" : "users"}
                </Text>
              </View>
              {actions.map((action) => {
                const destructive = action.style === "destructive";
                const color = destructive ? "#DC2626" : "#0E7490";
                return (
                  <TouchableOpacity key={action.id} onPress={() => selectAction(action)} className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-white/10" activeOpacity={0.7}>
                    <Ionicons name={action.icon} size={20} color={color} />
                    <Text className={`ml-3 text-base font-quicksandBold ${destructive ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-100"}`}>{action.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={onClose} className="mt-2 py-4 rounded-2xl bg-white dark:bg-[#1c1c1e] items-center" style={{ elevation: 8 }}>
              <Text className="text-base font-quicksandBold text-gray-900 dark:text-gray-100">Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      <PromptModal
        visible={!!pendingAction && !!requiresReason}
        title={pendingAction?.label ?? "Reason"}
        message="Please provide a reason. This will be recorded for each selected account."
        placeholder="Reason…"
        submitText="Continue"
        submitStyle={pendingAction?.style === "destructive" ? "destructive" : "default"}
        onCancel={() => { setPendingAction(null); setDuration(undefined); }}
        onSubmit={(reason) => {
          if (!reason.trim() || !pendingAction) return;
          void runAction(pendingAction, reason.trim(), duration);
          setDuration(undefined);
        }}
      />
    </>
  );
}
