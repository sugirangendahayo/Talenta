import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

// Shared Components
import FieldWrapper from "@/components/auth/fields/FieldWrapper";
import PasswordField from "@/components/auth/fields/PasswordField";
import TextField from "@/components/auth/fields/TextField";
import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import AuthLink from "@/components/auth/shared/AuthLink";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";

// Custom Hook
import useSigninForm from "@/hooks/useSigninForm";

export default function Signin() {
  const router = useRouter();
  const { t } = useTranslation("auth");

  const {
    formData,
    showPassword,
    setShowPassword,
    isLoading,
    handleInputChange,
    handleSignin,
  } = useSigninForm();

  return (
    <AuthContainer>
      {/* Header */}
      <AuthHeader
        icon="login"
        title={t("signin.title")}
        subtitle={t("signin.subtitle")}
        showBackButton
        onBackPress={() => router.back()}
      />

      {/* Content */}
      <View className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          {/* Email Field */}
          <FieldWrapper label={t("fields.email")} required icon="email">
            <TextField
              placeholder={t("placeholders.email")}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              
              autoComplete="email"
              editable={!isLoading}
            />
          </FieldWrapper>

          {/* Password Field */}
          <FieldWrapper label={t("fields.password")} required icon="lock">
            <PasswordField
              placeholder={t("placeholders.password")}
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              editable={!isLoading}
            />
          </FieldWrapper>

          {/* Forgot Password Link */}
          <AuthLink
            linkText={t("signin.forgotPassword")}
            align="right"
            onPress={() => {
              // TODO: Implement forgot password
              // router.push("/auth/forgot-password");
            }}
          />
        </View>

        {/* Sign In Button */}
        <View className="mt-8">
          <PrimaryButton onPress={handleSignin} disabled={isLoading}>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold text-base">
                {isLoading ? t("signin.signingIn") : t("signin.signInButton")}
              </Text>

              {isLoading && (
                <ActivityIndicator className="ml-2" size="small" color="#fff" />
              )}
            </View>
          </PrimaryButton>
        </View>

        {/* Sign Up Link */}
        <AuthLink
          text={t("signin.noAccount")}
          linkText={t("signin.signUpLink")}
          onPress={() => router.push("/auth/signup")}
          className="mt-8"
        />
      </View>
    </AuthContainer>
  );
}
