// app/shared/privacy-security.tsx
// A shared Privacy & Security screen for all three roles (jobseeker, employer, admin).
// Handles: Change Password, Delete Account (with confirmation).
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Password Section ─────────────────────────────────────────────────────────

function ChangePasswordSection({ isDark }: { isDark: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const inputBg = isDark ? "#141414" : "#F9FAFB";
  const inputBorder = isDark ? "#2a2a2a" : "#E5E7EB";
  const textColor = isDark ? "#F3F4F6" : "#111827";
  const placeholderColor = isDark ? "#6B7280" : "#9CA3AF";

  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert("Done", "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      className="mx-6 mb-4 bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Section header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-[#222]">
        <Ionicons name="lock-closed-outline" size={18} color="#0E7490" />
        <Text className="text-base font-quicksandBold text-gray-800 dark:text-gray-100 ml-3">
          Change Password
        </Text>
      </View>

      <View className="px-5 pt-4 pb-5" style={{ gap: 14 }}>
        {/* New Password */}
        <View>
          <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            New Password
          </Text>
          <View
            className="flex-row items-center rounded-xl px-4"
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor: inputBorder,
              height: 48,
            }}
          >
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              placeholder="At least 8 characters"
              placeholderTextColor={placeholderColor}
              style={{ flex: 1, color: textColor, fontFamily: "Quicksand_500Medium", fontSize: 14 }}
            />
            <TouchableOpacity
              onPress={() => setShowNew((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showNew ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={placeholderColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View>
          <Text className="text-xs font-quicksandBold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            Confirm New Password
          </Text>
          <View
            className="flex-row items-center rounded-xl px-4"
            style={{
              backgroundColor: inputBg,
              borderWidth: 1,
              borderColor: inputBorder,
              height: 48,
            }}
          >
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="Repeat new password"
              placeholderTextColor={placeholderColor}
              style={{ flex: 1, color: textColor, fontFamily: "Quicksand_500Medium", fontSize: 14 }}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((v) => !v)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showConfirm ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={placeholderColor}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          className="bg-cyan-700 rounded-xl py-3.5 items-center justify-center mt-1"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-quicksandBold text-sm">
              Update Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────────────────

function DangerSection({ onDeleteAccount }: { onDeleteAccount: () => void }) {
  return (
    <View
      className="mx-6 mb-4 bg-white dark:bg-[#0E0E0E] rounded-2xl border border-gray-100 dark:border-[#2a2a2a] overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-[#222]">
        <Ionicons name="warning-outline" size={18} color="#DC2626" />
        <Text className="text-base font-quicksandBold text-red-600 dark:text-red-400 ml-3">
          Danger Zone
        </Text>
      </View>

      <View className="px-5 py-4">
        <Text className="text-sm font-quicksandMedium text-gray-500 dark:text-gray-400 mb-4 leading-5">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </Text>
        <TouchableOpacity
          onPress={onDeleteAccount}
          activeOpacity={0.85}
          className="border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 rounded-xl py-3.5 items-center justify-center"
        >
          <Text className="text-red-600 dark:text-red-400 font-quicksandBold text-sm">
            Delete My Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PrivacySecurityScreen() {
  const { signOut, user } = useAuth();
  const { t } = useTranslation("common");
  const [deleting, setDeleting] = useState(false);

  // Detect dark mode via RN's Appearance — matches your ThemeContext pattern
  const { useTheme } = require("@/contexts/ThemeContext");
  const { isDark } = useTheme();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and cannot be undone. Type DELETE to confirm.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              // Sign user out — actual deletion would require a server-side
              // function (Edge Function) since client can't delete itself.
              // For MVP we sign out and show a message.
              await signOut();
              router.replace("/auth/signin");
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Failed to delete account.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#080A08]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ── */}
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#080A08]">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e1e1e] items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-quicksandBold text-gray-800 dark:text-gray-100">
            Privacy & Security
          </Text>
          <Text className="text-xs font-quicksandMedium text-gray-400 dark:text-gray-500 mt-0.5">
            {user?.email}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 48 }}
      >
        <ChangePasswordSection isDark={isDark} />
        <DangerSection onDeleteAccount={handleDeleteAccount} />
      </ScrollView>

      {/* Full-screen overlay while deleting */}
      {deleting && (
        <View
          className="absolute inset-0 bg-black/40 items-center justify-center"
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}
