import { View } from "react-native";
import { useRouter } from "expo-router";

// Shared Components
import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import AuthLink from "@/components/auth/shared/AuthLink";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";
import FieldWrapper from "@/components/auth/fields/FieldWrapper";
import TextField from "@/components/auth/fields/TextField";
import PasswordField from "@/components/auth/fields/PasswordField";

// Custom Hook
import useSigninForm from "@/app/hooks/useSigninForm";

export default function Signin() {
  const router = useRouter();

  const {
    formData,
    showPassword,
    setShowPassword,
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
            />
          </FieldWrapper>

          {/* Forgot Password Link */}
          <AuthLink linkText="Forgot Password?" align="right" />
        </View>

        {/* Sign In Button */}
        <PrimaryButton
          title="Sign In"
          onPress={handleSignin}
          className="mt-8"
        />

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
