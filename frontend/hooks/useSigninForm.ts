import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import { checkAuthProvider } from "@/utils/authPrecheck";

export default function useSigninForm() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
      // 1. Check which auth provider this email is registered with, so we
      //    can guide Google-only accounts instead of attempting (and failing)
      //    password verification against an account that has no password set.
      const precheck = await checkAuthProvider(formData.email, "password");

      if (precheck.status === "google_only") {
        toast.error(t("messages.googleAccountOnly"), { duration: 4000 });
        return;
      }

      if (precheck.status === "not_found") {
        toast.error(t("messages.accountNotFound"), { duration: 3000 });
        return;
      }

      // 2. Sign in with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error(t("messages.signInFailed"));
      }

      // 3. Get user's role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error(t("messages.profileNotFound"));
      }

      // 4. Navigation happens via RootLayoutNav automatically when AuthContext updates
      toast.success(t("messages.signInSuccess"), {
        duration: 2000,
      });
      
    } catch (error: any) {
      console.error("Signin error:", error);

      let errorMessage = t("messages.signInError");

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = t("messages.invalidCredentials");
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = t("messages.emailNotConfirmed");
        toast.error(errorMessage, { duration: 3000 });
        router.replace(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        duration: 3000,
      });
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
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
