import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";

// Shared Components
import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import AuthLink from "@/components/auth/shared/AuthLink";

// Signup-Specific Components
import PrimaryButton from "@/components/auth/shared/PrimaryButton";
import GoogleAuthButton from "@/components/auth/shared/GoogleAuthButton";
import FormSection from "@/components/auth/signup/FormSection";
import RoleSelector from "@/components/auth/signup/RoleSelector";

// Custom Hook
import useSignupForm from "@/hooks/useSignupForm";

export default function Signup() {
  const router = useRouter();
  const { t } = useTranslation("auth");

  const {
    role,
    setRole,
    formData,
    isLoading,
    getCurrentStepFields,
    getUsernameTable,
    getUsernameColumn,
    getUsernameFullName,
    handleInputChange,
    handleUsernameStatusChange,
    handleSignup,
  } = useSignupForm();

  return (
    <AuthContainer stickyHeaderIndices={[1]}>
      {/* Header - Index 0 */}
      <AuthHeader
        icon="login"
        title={t("signup.title")}
        subtitle={t("signup.subtitle", { role: t(`signup.roles.${role}`) })}
      />

      {/* Role Selector - Index 1 (Sticky) */}
      <RoleSelector role={role} onRoleChange={setRole} />

      {/* Content - Index 2 */}
      <View className="px-6 ">
        {/* Form Fields */}
        <FormSection
          fields={getCurrentStepFields()}
          formData={formData}
          onInputChange={handleInputChange}
          onToggleSkill={() => {}}
          onFileUpload={() => {}}
          usernameTable={getUsernameTable()}
          usernameColumn={getUsernameColumn()}
          usernameFullName={getUsernameFullName()}
          onUsernameStatusChange={handleUsernameStatusChange}
        />

        {/* Create Account Button */}
        <View className="my-8">
          <PrimaryButton onPress={handleSignup} disabled={isLoading}>
            {/* Inline content inside the button */}
            <View className="flex flex-row items-center justify-center">
              <Text className="text-white font-quicksandBold">
                {isLoading
                  ? t("signup.creatingAccount")
                  : t("signup.createAccountButton")}
              </Text>
              {isLoading && (
                <ActivityIndicator className="ml-2" size="small" color="#fff" />
              )}
            </View>
          </PrimaryButton>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-800" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400 font-quicksandMedium">
              {t("common.or", "OR")}
            </Text>
            <View className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-800" />
          </View>

          <GoogleAuthButton type="signup" />
        </View>

        {/* Login Link */}
        <AuthLink
          text={t("signup.hasAccount")}
          linkText={t("signup.signInLink")}
          onPress={() => router.push("/auth/signin")}
        />
        <View className="mb-6"></View>
      </View>
    </AuthContainer>
  );
}
