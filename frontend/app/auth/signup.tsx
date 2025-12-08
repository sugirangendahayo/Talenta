import { View } from "react-native";
import { useRouter } from "expo-router";

// Shared Components
import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import AuthLink from "@/components/auth/shared/AuthLink";

// Signup-Specific Components
import RoleSelector from "@/components/auth/signup/RoleSelector";
import ProgressBar from "@/components/auth/signup/ProgressBar";
import FormSection from "@/components/auth/signup/FormSection";
import SignupActions from "@/components/auth/signup/SignupActions";

// Custom Hook
import useSignupForm from "@/app/hooks/useSignupForm";

export default function Signup() {
  const router = useRouter();

  const {
    step,
    role,
    setRole,
    formData,
    getCurrentStepFields,
    handleInputChange,
    toggleSkill,
    handleFileUpload,
    handleNext,
    handleBack,
    getDropdownData,
    skillsList,
  } = useSignupForm();

  return (
    <AuthContainer stickyHeaderIndices={step === 1 ? [1] : undefined}>
      {/* Header - Index 0 */}
      <AuthHeader
        icon="login"
        title="Create Account"
        subtitle={`Step ${step} of 2 • ${role === "jobseeker" ? "Job Seeker" : "Employer"}`}
      />

      {/* Role Selector - Index 1 (Sticky in step 1) */}
      {step === 1 && <RoleSelector role={role} onRoleChange={setRole} />}

      {/* Content - Index 2 */}
      <View className="px-6">
        {/* Progress Bar */}
        <ProgressBar step={step} totalSteps={2} />

        {/* Form Fields */}
        <FormSection
          fields={getCurrentStepFields()}
          formData={formData}
          onInputChange={handleInputChange}
          onToggleSkill={toggleSkill}
          onFileUpload={handleFileUpload}
          getDropdownData={getDropdownData}
          skillsList={skillsList}
        />

        {/* Action Buttons */}
        <SignupActions step={step} onBack={handleBack} onNext={handleNext} />

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
