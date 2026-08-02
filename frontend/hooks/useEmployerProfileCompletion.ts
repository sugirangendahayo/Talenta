import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface EmployerProfileFormData {
  company_name: string;
  company_username: string;
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
  { key: "company_name",     label: "Company Name",     weight: 15 },
  { key: "company_username", label: "Company Username", weight: 10 },
  { key: "email",            label: "Email",            weight: 10 },
  { key: "phone",            label: "Phone Number",     weight: 15 },
  { key: "country",          label: "Country",          weight: 10 },
  { key: "city",             label: "City",             weight: 10 },
  { key: "company_address",  label: "Company Address",  weight: 15 },
  { key: "company_website",  label: "Company Website",  weight: 10 },
  { key: "profile_image_url",label: "Profile Photo",    weight: 5  },
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
    company_username: "",
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

  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const hasLoadedOnceRef = useRef(false);

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
    // Offline: don't attempt a request that would just fail/hang. Keep
    // whatever profile data is already loaded visible.
    if (!isOnline) {
      setLoading(false);
      if (!hasLoadedOnceRef.current) {
        toast.error("You're offline. Connect to the internet to load your profile.");
      }
      return;
    }

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
          company_username: data.company_username || "",
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
      hasLoadedOnceRef.current = true;
    } catch (err: any) {
      console.error("Error fetching employer profile:", err);
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

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
    if (!requireOnline()) return false;
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
        // Normalise company_username to lowercase before saving
        company_username: formData.company_username.trim().toLowerCase(),
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
  }, [formData, fetchProfile, requireOnline]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Smart auto-refresh: when connectivity returns, silently refresh the
  // profile if this screen is active.
  useRefetchOnReconnect(() => fetchProfile());

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
