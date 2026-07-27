import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import FieldWrapper from "@/components/auth/fields/FieldWrapper";
import PasswordField from "@/components/auth/fields/PasswordField";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";

type LinkStatus = "verifying" | "valid" | "invalid";

/**
 * Handles the deep-link from the "reset your password" email.
 *
 * Supabase redirects to talenta://auth/reset-password?code=xxxx after the
 * user taps the recovery link. Because this app runs with
 * `detectSessionInUrl: false` (correct for React Native, which has no
 * browser URL to auto-parse), that `code` is never automatically exchanged
 * for a session — we have to do it ourselves here, the same way
 * `auth/callback.tsx` does for the Google OAuth flow. Without this step,
 * `supabase.auth.updateUser()` below would silently fail with no
 * authenticated session.
 */
export default function ResetPassword() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();

  const [linkStatus, setLinkStatus] = useState<LinkStatus>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verifyRecoveryLink = async () => {
      const { code, error, error_description } = params;

      if (error) {
        console.warn("Password recovery link error:", error, error_description);
        setLinkStatus("invalid");
        return;
      }

      if (!code) {
        // The screen can also be reached with an already-active session
        // (e.g. a hot-reload during development, or a session that survived
        // navigation) — only treat it as invalid if there's truly no way in.
        const { data } = await supabase.auth.getSession();
        setLinkStatus(data.session ? "valid" : "invalid");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.warn("Recovery code exchange error:", exchangeError.message);
        setLinkStatus("invalid");
        return;
      }

      setLinkStatus("valid");
    };

    verifyRecoveryLink();
  }, [params]);

  const validatePassword = (pwd: string): { valid: boolean; message: string } => {
    if (pwd.length < 8) return { valid: false, message: t("validation.passwordTooShort", "Password must be at least 8 characters") };
    if (!/[A-Z]/.test(pwd)) return { valid: false, message: t("validation.passwordUppercase", "Requires uppercase letter") };
    if (!/[a-z]/.test(pwd)) return { valid: false, message: t("validation.passwordLowercase", "Requires lowercase letter") };
    if (!/[0-9]/.test(pwd)) return { valid: false, message: t("validation.passwordNumber", "Requires number") };
    if (!/[!@#$%^&*]/.test(pwd)) return { valid: false, message: t("validation.passwordSpecial", "Requires special character (!@#$%^&*)") };
    return { valid: true, message: "" };
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      toast.error(t("validation.passwordsMatch", "Passwords do not match"));
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast.success(t("messages.passwordUpdated", "Password updated successfully"), {
        duration: 3000,
      });

      // Sign out and redirect to signin so they can log in with the new password
      // or route to Home/Dashboard if session is valid. Let's just sign out to be safe.
      await supabase.auth.signOut();
      router.replace("/auth/signin");
      
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || t("messages.updateError", "Failed to update password"), {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verifying the link ────────────────────────────────────────────────────
  if (linkStatus === "verifying") {
    return (
      <AuthContainer>
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#0E7490" />
          <Text className="text-black dark:text-white font-quicksandMedium text-base mt-4">
            {t("resetPassword.verifying", "Verifying your link…")}
          </Text>
        </View>
      </AuthContainer>
    );
  }

  // ── Expired / invalid / already-used link ─────────────────────────────────
  if (linkStatus === "invalid") {
    return (
      <AuthContainer>
        <AuthHeader
          icon="link-off"
          title={t("resetPassword.invalidTitle", "This link has expired")}
          subtitle={t(
            "resetPassword.invalidSubtitle",
            "Password reset links are only valid for a short time. Please request a new one.",
          )}
          showBackButton
          onBackPress={() => router.replace("/auth/signin")}
        />
        <View className="flex-1 px-6 pt-8">
          <PrimaryButton onPress={() => router.replace("/auth/forgot-password")}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold text-base text-center">
                {t("resetPassword.requestNewLink", "Request a new link")}
              </Text>
            </View>
          </PrimaryButton>
        </View>
      </AuthContainer>
    );
  }

  // ── Valid recovery session — show the form ────────────────────────────────
  return (
    <AuthContainer>
      <AuthHeader
        icon="lock-reset"
        title={t("resetPassword.title", "Create New Password")}
        subtitle={t("resetPassword.subtitle", "Your new password must be different from previous used passwords.")}
      />

      <View className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          <FieldWrapper label={t("fields.newPassword", "New Password")} required icon="lock">
            <PasswordField
              placeholder={t("placeholders.newPassword", "Enter new password")}
              value={password}
              onChangeText={setPassword}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              showStrengthIndicator
              editable={!isLoading}
            />
          </FieldWrapper>

          <FieldWrapper label={t("fields.confirmPassword", "Confirm Password")} required icon="lock-check">
            <PasswordField
              placeholder={t("placeholders.confirmPassword", "Confirm new password")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              editable={!isLoading}
            />
          </FieldWrapper>
        </View>

        <View className="mt-8">
          <PrimaryButton onPress={handleUpdatePassword} disabled={isLoading || !password || !confirmPassword}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold text-base">
                {isLoading 
                  ? t("resetPassword.updating", "Updating...") 
                  : t("resetPassword.updateButton", "Reset Password")}
              </Text>
              {isLoading && (
                <ActivityIndicator className="ml-2" size="small" color="#fff" />
              )}
            </View>
          </PrimaryButton>
        </View>
      </View>
    </AuthContainer>
  );
}
