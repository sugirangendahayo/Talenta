import { useTranslation } from "react-i18next";
import { ActivityIndicator, Text, View } from "react-native";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

import AuthContainer from "@/components/auth/shared/AuthContainer";
import AuthHeader from "@/components/auth/shared/AuthHeader";
import RoleSelector from "@/components/auth/signup/RoleSelector";
import PrimaryButton from "@/components/auth/shared/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { generateBaseUsername, checkUsernameAvailability } from "@/utils/username";

export default function CompleteOAuthProfile() {
  const { t } = useTranslation("auth");
  const { user } = useAuth();
  const [role, setRole] = useState<"jobseeker" | "employer">("jobseeker");
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteProfile = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Generate username from Google full name or email prefix
      const rawName = user.user_metadata?.full_name || user.email?.split("@")[0] || "user";
      const base = generateBaseUsername(rawName) || "user";
      let finalUsername = base;

      const table = role === "jobseeker" ? "jobseeker_profiles" : "employer_profiles";
      const column = role === "jobseeker" ? "username" : "company_username";

      const available = await checkUsernameAvailability(base, table, column as any);
      if (!available) {
        for (let i = 1; i <= 99; i++) {
          const candidate = `${base}${i}`;
          const ok = await checkUsernameAvailability(candidate, table, column as any);
          if (ok) {
            finalUsername = candidate;
            break;
          }
        }
      }

      // 2. Insert the role in public.profiles.
      //    (The database auto-trigger fails during OAuth because role is missing, so we must insert it here)
      const { error: profilesError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, role, updated_at: new Date().toISOString() });

      if (profilesError) throw profilesError;

      // 3. Insert into the role-specific table
      if (role === "jobseeker") {
        const { error: profileError } = await supabase
          .from("jobseeker_profiles")
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || "",
            username: finalUsername,
            email: user.email || "",
            profile_completed: false,
          });

        if (profileError && profileError.code !== "23505") throw profileError; // ignore duplicate
      } else {
        const { error: profileError } = await supabase
          .from("employer_profiles")
          .insert({
            id: user.id,
            company_name: user.user_metadata?.full_name || "",
            company_username: finalUsername,
            email: user.email || "",
            profile_completed: false,
            is_verified: false,
          });

        if (profileError && profileError.code !== "23505") throw profileError;
      }

      // 4. Refresh the session — this re-triggers onAuthStateChange in AuthContext,
      //    which re-fetches public.profiles and sets the role, causing _layout to redirect.
      toast.success(t("messages.profileCreated", "Profile created successfully!"), { duration: 2000 });
      await supabase.auth.refreshSession();

    } catch (error: any) {
      console.error("Profile completion error:", error);
      toast.error(error.message || t("messages.profileError", "Failed to create profile"), {
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer stickyHeaderIndices={[1]}>
      <AuthHeader
        icon="account-check-outline"
        title={t("completeProfile.title", "Complete your profile")}
        subtitle={t("completeProfile.subtitle", "Please select how you want to use Talenta.")}
      />

      <RoleSelector role={role} onRoleChange={setRole} />

      <View className="px-6 mt-8">
        <PrimaryButton onPress={handleCompleteProfile} disabled={isLoading}>
          <View className="flex flex-row items-center justify-center">
            <Text className="text-white font-quicksandBold">
              {isLoading 
                ? t("completeProfile.saving", "Saving...") 
                : t("completeProfile.continueButton", "Continue")}
            </Text>
            {isLoading && (
              <ActivityIndicator className="ml-2" size="small" color="#fff" />
            )}
          </View>
        </PrimaryButton>
      </View>
    </AuthContainer>
  );
}
