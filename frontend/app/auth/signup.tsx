import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

// Shared Components
import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import AuthLink from "@/components/auth/shared/AuthLink";

// Signup-Specific Components
import PrimaryButton from "@/components/auth/shared/PrimaryButton";
import FormSection from "@/components/auth/signup/FormSection";
import RoleSelector from "@/components/auth/signup/RoleSelector";

// Custom Hook
import useSignupForm from "@/app/hooks/useSignupForm";

export default function Signup() {
  const router = useRouter();

  const {
    role,
    setRole,
    formData,
    isLoading,
    getCurrentStepFields,
    handleInputChange,
    handleSignup,
  } = useSignupForm();

  return (
    <AuthContainer stickyHeaderIndices={[1]}>
      {/* Header - Index 0 */}
      <AuthHeader
        icon="login"
        title="Create Account"
        subtitle={`Join as ${role === "jobseeker" ? "Job Seeker" : "Employer"}`}
      />

      {/* Role Selector - Index 1 (Sticky) */}
      <RoleSelector role={role} onRoleChange={setRole} />

      {/* Content - Index 2 */}
      <View className="px-6">
        {/* Form Fields */}
        <FormSection
          fields={getCurrentStepFields()}
          formData={formData}
          onInputChange={handleInputChange}
          onToggleSkill={() => {}} // Not needed for signup
          onFileUpload={() => {}} // Not needed for signup
        />

        {/* Create Account Button */}
        <View className="my-8">
          <PrimaryButton
            title={isLoading ? "Creating Account..." : "Create Account"}
            onPress={handleSignup}
            disabled={isLoading}
          />
          {isLoading && (
            <View className="absolute inset-0 items-center justify-center flex">
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        {/* Login Link */}
        <AuthLink
          text="Already have an account?"
          linkText="Sign In"
          onPress={() => router.push("/auth/signin")}
        />
      </View>
    </AuthContainer>
  );
}
