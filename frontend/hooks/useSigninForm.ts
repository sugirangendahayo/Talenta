import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";

export default function useSigninForm() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): { valid: boolean; message: string } => {
    // Check if fields are empty
    if (!formData.email.trim() || !formData.password.trim()) {
      return { valid: false, message: t("validation.fillAllFields") };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { valid: false, message: t("validation.invalidEmail") };
    }

    return { valid: true, message: "" };
  };

  const handleSignin = async () => {
    // Validate form
    const validation = validateForm();
    if (!validation.valid) {
      
      toast.error(validation.message);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error(t("messages.signInFailed"));
      }

      // 2. Get user's role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error(t("messages.profileNotFound"));
      }

      // 3. Navigate based on role
      const role = profileData.role;

         toast.success(t("messages.signInSuccess"), {
               duration: 2000,
             });
             
        // Navigation is handled globally by RootLayoutNav in app/_layout.tsx
        // when AuthContext updates the user and role.
  
    } catch (error: any) {
      console.error("Signin error:", error);
      // ... rest of the error handling

      let errorMessage = t("messages.signInError");

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = t("messages.invalidCredentials");
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = t("messages.emailNotConfirmed");
      } else if (error.message) {
        errorMessage = error.message;
      }

      
        toast.error(errorMessage, {
          duration: 3000,
        });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    isLoading,
    handleInputChange,
    handleSignin,
  };
}
