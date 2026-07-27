import {
  employerSignupFields,
  jobSeekerSignupFields,
} from "@/constants/signupFields";
import { supabase } from "@/lib/supabase";
import {
  generateBaseUsername,
  checkUsernameAvailability,
  type UsernameTable,
  type UsernameColumn,
} from "@/utils/username";
import type { UsernameStatus } from "@/components/common/UsernameInput";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";
import { checkAuthProvider } from "@/utils/authPrecheck";

export default function useSignupForm() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [role, setRole] = useState<"jobseeker" | "employer">("jobseeker");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Jobseeker identity
    fullName: "",
    username: "",

    // Employer identity
    companyName: "",
    companyUsername: "",

    // Common fields
    email: "",
    password: "",
    website: "",
  });

  // ── Username availability status ─────────────────────────────────────────
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [companyUsernameStatus, setCompanyUsernameStatus] = useState<UsernameStatus>("idle");

  // Debounce refs for auto-generation
  const fullNameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const companyNameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flags to know if the user has manually edited their username
  const usernameManuallyEdited = useRef(false);
  const companyUsernameManuallyEdited = useRef(false);

  // ── Auto-generate jobseeker username from fullName ───────────────────────
  useEffect(() => {
    if (!formData.fullName.trim() || usernameManuallyEdited.current) return;

    if (fullNameDebounceRef.current) clearTimeout(fullNameDebounceRef.current);

    fullNameDebounceRef.current = setTimeout(async () => {
      const base = generateBaseUsername(formData.fullName);
      if (!base) return;

      // Check if base is available; if taken, pick base + suffix
      const available = await checkUsernameAvailability(base, "jobseeker_profiles", "username");
      if (available) {
        setFormData((prev) => ({ ...prev, username: base }));
      } else {
        // Try base1, base2, base3 …
        for (let i = 1; i <= 9; i++) {
          const candidate = `${base}${i}`;
          const ok = await checkUsernameAvailability(candidate, "jobseeker_profiles", "username");
          if (ok) {
            setFormData((prev) => ({ ...prev, username: candidate }));
            break;
          }
        }
      }
    }, 350);

    return () => {
      if (fullNameDebounceRef.current) clearTimeout(fullNameDebounceRef.current);
    };
  }, [formData.fullName]);

  // ── Auto-generate employer company_username from companyName ─────────────
  useEffect(() => {
    if (!formData.companyName.trim() || companyUsernameManuallyEdited.current) return;

    if (companyNameDebounceRef.current) clearTimeout(companyNameDebounceRef.current);

    companyNameDebounceRef.current = setTimeout(async () => {
      const base = generateBaseUsername(formData.companyName);
      if (!base) return;

      const available = await checkUsernameAvailability(base, "employer_profiles", "company_username");
      if (available) {
        setFormData((prev) => ({ ...prev, companyUsername: base }));
      } else {
        for (let i = 1; i <= 9; i++) {
          const candidate = `${base}${i}`;
          const ok = await checkUsernameAvailability(candidate, "employer_profiles", "company_username");
          if (ok) {
            setFormData((prev) => ({ ...prev, companyUsername: candidate }));
            break;
          }
        }
      }
    }, 350);

    return () => {
      if (companyNameDebounceRef.current) clearTimeout(companyNameDebounceRef.current);
    };
  }, [formData.companyName]);

  // ── Which fields to render ────────────────────────────────────────────────
  const getCurrentStepFields = () => {
    return role === "jobseeker" ? jobSeekerSignupFields : employerSignupFields;
  };

  // ── Which table/column UsernameInput should check ─────────────────────────
  const getUsernameTable = (): UsernameTable =>
    role === "jobseeker" ? "jobseeker_profiles" : "employer_profiles";

  const getUsernameColumn = (): UsernameColumn =>
    role === "jobseeker" ? "username" : "company_username";

  const getUsernameFullName = () =>
    role === "jobseeker" ? formData.fullName : formData.companyName;

  // ── Input change handler ──────────────────────────────────────────────────
  const handleInputChange = (key: string, value: any) => {
    // Mark manual edit so auto-generation stops overriding
    if (key === "username") usernameManuallyEdited.current = true;
    if (key === "companyUsername") companyUsernameManuallyEdited.current = true;

    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // ── Status change callbacks passed to FormSection → UsernameInput ─────────
  // Routes to the correct state variable based on the active role.
  const handleUsernameStatusChange = (status: UsernameStatus) => {
    if (role === "jobseeker") {
      setUsernameStatus(status);
    } else {
      setCompanyUsernameStatus(status);
    }
  };

  // ── Password validation ───────────────────────────────────────────────────
  const validatePassword = (
    password: string
  ): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: t("validation.passwordTooShort") };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: t("validation.passwordUppercase") };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: t("validation.passwordLowercase") };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: t("validation.passwordNumber") };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: t("validation.passwordSpecial") };
    }
    return { valid: true, message: "" };
  };

  // ── Form validation ───────────────────────────────────────────────────────
  const validateForm = (): { valid: boolean; message: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (role === "jobseeker") {
      if (!formData.fullName.trim()) {
        return { valid: false, message: "Full name is required" };
      }
      if (!formData.username.trim()) {
        return { valid: false, message: "Username is required" };
      }
      if (usernameStatus === "checking") {
        return { valid: false, message: "Please wait while we check your username…" };
      }
      if (usernameStatus === "taken" || usernameStatus === "invalid") {
        return { valid: false, message: "Please choose an available username" };
      }
    } else {
      if (!formData.companyName.trim()) {
        return { valid: false, message: t("validation.companyNameRequired") };
      }
      if (!formData.companyUsername.trim()) {
        return { valid: false, message: "Company username is required" };
      }
      if (companyUsernameStatus === "checking") {
        return { valid: false, message: "Please wait while we check your company username…" };
      }
      if (companyUsernameStatus === "taken" || companyUsernameStatus === "invalid") {
        return { valid: false, message: "Please choose an available company username" };
      }
    }

    if (!emailRegex.test(formData.email)) {
      return { valid: false, message: t("validation.invalidEmail") };
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      return { valid: false, message: passwordValidation.message };
    }

    return { valid: true, message: "" };
  };

  // ── Signup handler ────────────────────────────────────────────────────────
  const handleSignup = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      Alert.alert(t("validation.title"), validation.message);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { role },
          emailRedirectTo: "talenta://auth/signin",
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error(t("messages.userCreationFailed"));

      // 2. Create role-specific profile
      if (role === "jobseeker") {
        const { error: profileError } = await supabase
          .from("jobseeker_profiles")
          .insert({
            id: authData.user.id,
            full_name: formData.fullName.trim(),
            username: formData.username.trim().toLowerCase(),
            email: formData.email,
            profile_completed: false,
          });

        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from("employer_profiles")
          .insert({
            id: authData.user.id,
            company_name: formData.companyName.trim(),
            company_username: formData.companyUsername.trim().toLowerCase(),
            email: formData.email,
            company_website: formData.website || null,
            profile_completed: false,
            is_verified: false,
          });

        if (profileError) throw profileError;
      }

      // 3. Success
      toast.success(t("messages.accountCreated"), { duration: 2000 });

      router.replace(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = t("messages.signupError");
      if (error.message?.includes("already registered")) {
        // Give more specific guidance when the existing account is Google-only.
        const precheck = await checkAuthProvider(formData.email, "password");
        errorMessage =
          precheck.status === "google_only"
            ? t("messages.googleAccountOnly")
            : t("messages.emailAlreadyRegistered");
      } else if (error.message?.includes("duplicate key")) {
        errorMessage = "That username is already taken. Please choose another.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    role,
    setRole,
    formData,
    isLoading,
    usernameStatus,
    companyUsernameStatus,
    getUsernameTable,
    getUsernameColumn,
    getUsernameFullName,
    getCurrentStepFields,
    handleInputChange,
    handleUsernameStatusChange,
    handleSignup,
  };
}
