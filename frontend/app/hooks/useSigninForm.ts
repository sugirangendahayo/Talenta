import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

export default function useSigninForm() {
  const router = useRouter();
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
      return { valid: false, message: "Please fill in all fields" };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { valid: false, message: "Please enter a valid email address" };
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
        throw new Error("Sign in failed");
      }

      // 2. Get user's role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error("Profile not found");
      }

      // 3. Navigate based on role
      const role = profileData.role;

         toast.success("Signed in successfully!", {
               duration: 2000,
             });
      
        if (role === "jobseeker") {
          router.replace("/(jobseeker-tabs)/jobseekers/Home");
        } else if (role === "employer") {
          router.replace("/(employer-tabs)/employers/Dashboard");
        } else {
          // Admin or unknown role - handle as needed
          toast.error("Invalid user role");
        }
  
    } catch (error: any) {
      console.error("Signin error:", error);
      // ... rest of the error handling

      let errorMessage = "An error occurred during sign in";

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please confirm your email before signing in.";
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
