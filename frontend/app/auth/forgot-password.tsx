import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { isEmailRateLimitError } from "@/utils/authErrors";
import { AUTH_ACTION_RESET_URL } from "@/constants/authRedirects";

import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import FieldWrapper from "@/components/auth/fields/FieldWrapper";
import TextField from "@/components/auth/fields/TextField";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ForgotPassword() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error(t("validation.invalidEmail", "Please enter a valid email address"));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: AUTH_ACTION_RESET_URL,
      });

      if (error) throw error;
      
      setIsSent(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const message = isEmailRateLimitError(error)
        ? t("messages.emailRateLimitExceeded")
        : error.message || t("messages.resetError", "Failed to send reset link");
      toast.error(message, { duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthContainer>
        <AuthHeader
          icon="email-check-outline"
          title={t("forgotPassword.sentTitle", "Check your email")}
          subtitle={t("forgotPassword.sentSubtitle", "We've sent a password reset link to your email.")}
          showBackButton
          onBackPress={() => router.back()}
        />
        <View className="flex-1 px-6 pt-8 items-center">
          <View className="bg-primary/10 p-6 rounded-full mb-8">
            <MaterialCommunityIcons name="email-check-outline" size={64} color="#22C55E" />
          </View>
          <Text className="text-black dark:text-white font-quicksandMedium text-base text-center mb-8">
            {t("forgotPassword.instruction", "Please click the link in the email we sent to")}
            {"\n"}
            <Text className="font-quicksandBold">{email}</Text>
            {"\n"}
            {t("forgotPassword.instructionEnd", "to reset your password.")}
          </Text>
          <PrimaryButton onPress={() => router.push("/auth/signin")} className="w-full">
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold text-base text-center">
                {t("forgotPassword.backToSignin", "Go to Sign In")}
              </Text>
            </View>
          </PrimaryButton>
        </View>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthHeader
        icon="lock-reset"
        title={t("forgotPassword.title", "Reset Password")}
        subtitle={t("forgotPassword.subtitle", "Enter your email address and we'll send you a link to reset your password.")}
        showBackButton
        onBackPress={() => router.back()}
      />

      <View className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          <FieldWrapper label={t("fields.email", "Email")} required icon="email">
            <TextField
              placeholder={t("placeholders.email", "Enter your email")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </FieldWrapper>
        </View>

        <View className="mt-8">
          <PrimaryButton onPress={handleResetPassword} disabled={isLoading || !email}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold text-base">
                {isLoading 
                  ? t("forgotPassword.sending", "Sending...") 
                  : t("forgotPassword.sendLink", "Send Reset Link")}
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
