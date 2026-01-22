import {
  employerSignupFields,
  jobSeekerSignupFields,
} from "@/constants/signupFields";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { toast } from "sonner-native";

export default function useSignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<"jobseeker" | "employer">("jobseeker");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Job Seeker fields
    firstName: "",
    lastName: "",

    // Employer fields
    companyName: "",
    website: "",

    // Common fields
    email: "",

    password: "",
  });

  const getCurrentStepFields = () => {
    return role === "jobseeker" ? jobSeekerSignupFields : employerSignupFields;
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Password validation
  const validatePassword = (
    password: string
  ): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return {
        valid: false,
        message:
          "Password must contain at least one special character (!@#$%^&*)",
      };
    }
    return { valid: true, message: "" };
  };

  const validateForm = (): { valid: boolean; message: string } => {
    const currentFields = getCurrentStepFields();

    // Check required fields (non-optional)
    for (const field of currentFields) {
      if (!field.placeholder?.includes("Optional")) {
        const value = formData[field.key as keyof typeof formData];
        if (!value || value.toString().trim() === "") {
          return { valid: false, message: `Please fill in ${field.label}` };
        }
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { valid: false, message: "Please enter a valid email address" };
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      return { valid: false, message: passwordValidation.message };
    }

    // Role-specific validation
    if (role === "jobseeker") {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        return {
          valid: false,
          message: "Please provide both first and last name",
        };
      }
    } else {
      if (!formData.companyName.trim()) {
        return { valid: false, message: "Please provide company name" };
      }
    }

    return { valid: true, message: "" };
  };

  const handleSignup = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert("Validation Error", validation.message);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: role, // This will be used by our trigger to create profile
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // 2. Create role-specific profile
      if (role === "jobseeker") {
        const { error: profileError } = await supabase
          .from("jobseeker_profiles")
          .insert({
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,

            profile_completed: false,
          });

        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from("employer_profiles")
          .insert({
            id: authData.user.id,
            company_name: formData.companyName,
            email: formData.email,

            company_website: formData.website || null,
            profile_completed: false,
            is_verified: false,
          });

        if (profileError) throw profileError;
      }

      // 3. Success!
      
      
      // Show success message
      toast.success("Account created successfully!", {
        duration: 2000,
      });
      
      // Navigate based on role
      if (role === "jobseeker") {
        router.replace("/(jobseeker-tabs)/jobseekers/Home");
      } else {
        router.replace("/(employer-tabs)/employers/Dashboard");
      }
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "An error occurred during signup";
      if (error.message.includes("already registered")) {
        errorMessage =
          "This email is already registered. Please sign in instead!";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 3000,
      });
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    role,
    setRole,
    formData,
    isLoading,
    getCurrentStepFields,
    handleInputChange,
    handleSignup,
  };
}
