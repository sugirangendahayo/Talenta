import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

export interface EmployerProfileFormData {
  company_name: string;
  email: string;
  phone: string;
  company_website: string;
  company_address: string;
  country: string;
  city: string;
}

export interface ProfileCompletionStatus {
  completionPercentage: number;
  missingFields: string[];
  isComplete: boolean;
}

const REQUIRED_FIELDS = [
  { key: "company_name", label: "Company Name", weight: 20 },
  { key: "email", label: "Email", weight: 10 },
  { key: "phone", label: "Phone Number", weight: 15 },
  { key: "country", label: "Country", weight: 10 },
  { key: "city", label: "City", weight: 10 },
  { key: "company_address", label: "Company Address", weight: 15 },
  { key: "company_website", label: "Company Website", weight: 10 },
  { key: "profile_image_url", label: "Profile Photo", weight: 10 },
];

const TOTAL_WEIGHT = REQUIRED_FIELDS.reduce((sum, f) => sum + f.weight, 0);

function computeCompletion(data: Record<string, any>): ProfileCompletionStatus {
  let filledFields = 0;
  const missing: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = data[field.key];
    if (value && value !== "") {
      filledFields += field.weight;
    } else {
      missing.push(field.label);
    }
  });

  const completionPercentage = Math.round((filledFields / TOTAL_WEIGHT) * 100);
  return { completionPercentage, missingFields: missing, isComplete: completionPercentage === 100 };
}

export function useEmployerProfileCompletion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EmployerProfileFormData>({
    company_name: "",
    email: "",
    phone: "",
    company_website: "",
    company_address: "",
    country: "",
    city: "",
  });

  // Profile image managed separately so upload doesn't need to go through formData
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState<string | null>(null);

  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus>({
    completionPercentage: 0,
    missingFields: [],
    isComplete: false,
  });

  // Ref so saveProfile always reads latest image URL without re-creating the callback
  const profileImageUrlRef = useRef(profileImageUrl);
  profileImageUrlRef.current = profileImageUrl;

  // ─── Reactive completion ───────────────────────────────────────────────────
  useEffect(() => {
    const status = computeCompletion({
      ...formData,
      profile_image_url: profileImageUrl,
    });
    setCompletionStatus(status);
  }, [formData, profileImageUrl]);

  // Fetch existing profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("employer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          company_name: data.company_name || "",
          email: data.email || "",
          phone: data.phone || "",
          company_website: data.company_website || "",
          company_address: data.company_address || "",
          country: data.country || "",
          city: data.city || "",
        });
        setProfileImageUrl(data.profile_image_url || null);
        setBusinessLicenseUrl(data.business_license_url || null);
        // completion is recalculated by the useEffect above
      }
    } catch (err: any) {
      console.error("Error fetching employer profile:", err);
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update form field
  const updateField = useCallback(
    (field: keyof EmployerProfileFormData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Called by the screen after a successful image upload to sync URL into the hook
  const setExternalImageUrl = useCallback((url: string | null) => {
    // Strip cache-bust param so we store the clean URL
    const clean = url ? url.split("?")[0] : null;
    setProfileImageUrl(clean);
  }, []);

  // Save profile
  const saveProfile = useCallback(async (): Promise<boolean> => {
    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      const latestStatus = computeCompletion({
        ...formData,
        profile_image_url: profileImageUrlRef.current,
      });

      const updateData = {
        ...formData,
        profile_image_url: profileImageUrlRef.current,
        profile_completed: latestStatus.isComplete,
      };

      const { error: updateError } = await supabase
        .from("employer_profiles")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success(
        latestStatus.isComplete
          ? "Profile completed successfully! 🎉"
          : "Profile updated successfully!"
      );

      // Refresh hook data from DB
      await fetchProfile();

      return true;
    } catch (err: any) {
      console.error("Error saving employer profile:", err);
      toast.error(err.message || "Failed to save profile");
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, fetchProfile]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    loading,
    saving,
    formData,
    profileImageUrl,
    businessLicenseUrl,
    completionStatus,
    updateField,
    saveProfile,
    setExternalImageUrl,
    refreshProfile: fetchProfile,
  };
}
