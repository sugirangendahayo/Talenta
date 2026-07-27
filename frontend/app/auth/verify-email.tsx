import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { isEmailRateLimitError } from "@/utils/authErrors";

import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function VerifyEmail() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);
  const { isDark } = useTheme();

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: "talenta://auth/signin",
        },
      });

      if (error) throw error;
      
      toast.success(t("messages.verificationResent", "Verification email sent!"), {
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      const message = isEmailRateLimitError(error)
        ? t("messages.emailRateLimitExceeded")
        : error.message || t("messages.resendError", "Failed to resend email");
      toast.error(message, { duration: 4000 });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader
        icon="email-outline"
        title={t("verifyEmail.title", "Check your email")}
        subtitle={t("verifyEmail.subtitle", "We've sent a verification link to your email address.")}
        showBackButton
        onBackPress={() => router.push("/auth/signin")}
      />

      <View className="flex-1 px-6 pt-8 items-center">
        <View className="bg-primary/10 p-6 rounded-full mb-8">
          <MaterialCommunityIcons 
            name="email-fast-outline" 
            size={64} 
            color="#22C55E" 
          />
        </View>

        <Text className="text-black dark:text-white font-quicksandMedium text-base text-center mb-8">
          {t("verifyEmail.instruction", "Please click the link in the email we sent to")}
          {"\n"}
          <Text className="font-quicksandBold">{email}</Text>
          {"\n"}
          {t("verifyEmail.instructionEnd", "to verify your account and sign in.")}
        </Text>

        <View className="w-full space-y-4">
          <PrimaryButton onPress={() => router.push("/auth/signin")}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold text-base text-center">
                {t("verifyEmail.backToSignin", "Go to Sign In")}
              </Text>
            </View>
          </PrimaryButton>

          <PrimaryButton 
            onPress={handleResend} 
            disabled={isResending || !email}
            variant="outline"
          >
            <View className="flex flex-row items-center justify-center">
              <Text className="text-primary font-quicksandBold text-base">
                {isResending 
                  ? t("verifyEmail.resending", "Resending...") 
                  : t("verifyEmail.resendButton", "Resend Email")}
              </Text>
              {isResending && (
                <ActivityIndicator className="ml-2" size="small" color="#22C55E" />
              )}
            </View>
          </PrimaryButton>
        </View>
      </View>
    </AuthContainer>
  );
}
