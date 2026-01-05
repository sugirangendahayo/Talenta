import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

// Shared Components
import FieldWrapper from "@/components/auth/fields/FieldWrapper";
import PasswordField from "@/components/auth/fields/PasswordField";
import TextField from "@/components/auth/fields/TextField";
import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import AuthLink from "@/components/auth/shared/AuthLink";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";

// Custom Hook
import useSigninForm from "@/app/hooks/useSigninForm";

export default function Signin() {
  const router = useRouter();

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
        title="Welcome Back"
        subtitle="Sign in to continue"
        showBackButton
        onBackPress={() => router.back()}
      />

      {/* Content */}
      <View className="flex-1 px-6 pt-8">
        <View className="space-y-4">
          {/* Email Field */}
          <FieldWrapper label="Email" required icon="email">
            <TextField
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </FieldWrapper>

          {/* Password Field */}
          <FieldWrapper label="Password" required icon="lock">
            <PasswordField
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              editable={!isLoading}
            />
          </FieldWrapper>

          {/* Forgot Password Link */}
          <AuthLink
            linkText="Forgot Password?"
            align="right"
            onPress={() => {
              // TODO: Implement forgot password
              // router.push("/auth/forgot-password");
            }}
          />
        </View>

        {/* Sign In Button */}
        <View className="mt-8 flex justify-between items-center gap-2">
          <PrimaryButton
            title={isLoading ? "Signing In..." : "Sign In"}
            onPress={handleSignin}
            disabled={isLoading}
          />
          {isLoading && (
            <View className="absolute inset-0 items-center justify-center flex">
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        {/* Sign Up Link */}
        <AuthLink
          text="Don't have an account?"
          linkText="Sign Up"
          onPress={() => router.push("/auth/signup")}
          className="mt-8"
        />
      </View>
    </AuthContainer>
  );
}
