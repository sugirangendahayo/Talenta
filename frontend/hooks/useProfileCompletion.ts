import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string; // YYYY-MM-DD format
  gender: string;
  country: string;
  city: string;
  education_level: string;
  experience_level: string;
  skills: string[];
}

export interface ProfileCompletionStatus {
  completionPercentage: number;
  missingFields: string[];
  isComplete: boolean;
}

const REQUIRED_FIELDS = [
  { key: "first_name", label: "First Name", weight: 10 },
  { key: "last_name", label: "Last Name", weight: 10 },
  { key: "email", label: "Email", weight: 10 },
  { key: "phone", label: "Phone Number", weight: 10 },
  { key: "date_of_birth", label: "Date of Birth", weight: 10 },
  { key: "gender", label: "Gender", weight: 10 },
  { key: "country", label: "Country", weight: 10 },
  { key: "city", label: "City", weight: 10 },
  { key: "education_level", label: "Education Level", weight: 10 },
  { key: "experience_level", label: "Experience Level", weight: 10 },
  { key: "skills", label: "Skills", weight: 10 },
  { key: "cv_document_url", label: "CV/Resume", weight: 10 },
  { key: "profile_image_url", label: "Profile Photo", weight: 10 },
];

const TOTAL_WEIGHT = REQUIRED_FIELDS.reduce((sum, f) => sum + f.weight, 0);

function computeCompletion(data: Record<string, any>): ProfileCompletionStatus {
  let filledFields = 0;
  const missing: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = data[field.key];
    if (field.key === "skills") {
      if (value && Array.isArray(value) && value.length > 0) {
        filledFields += field.weight;
      } else {
        missing.push(field.label);
      }
    } else if (value && value !== "") {
      filledFields += field.weight;
    } else {
      missing.push(field.label);
    }
  });

  const completionPercentage = Math.round((filledFields / TOTAL_WEIGHT) * 100);
  return { completionPercentage, missingFields: missing, isComplete: completionPercentage === 100 };
}

export function useProfileCompletion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    country: "",
    city: "",
    education_level: "",
    experience_level: "",
    skills: [],
  });
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus>({
    completionPercentage: 0,
    missingFields: [],
    isComplete: false,
  });

  // Ref so we always have the latest values for callbacks without re-creating them
  const cvUrlRef = useRef(cvUrl);
  const profileImageUrlRef = useRef(profileImageUrl);
  cvUrlRef.current = cvUrl;
  profileImageUrlRef.current = profileImageUrl;

  // ─── Reactive completion: recalculate whenever formData, cvUrl, or profileImageUrl changes ───
  useEffect(() => {
    const status = computeCompletion({
      ...formData,
      cv_document_url: cvUrl,
      profile_image_url: profileImageUrl,
    });
    setCompletionStatus(status);
  }, [formData, cvUrl, profileImageUrl]);

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
        .from("jobseeker_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          country: data.country || "",
          city: data.city || "",
          education_level: data.education_level || "",
          experience_level: data.experience_level || "",
          skills: data.skills || [],
        });
        setCvUrl(data.cv_document_url || null);
        setProfileImageUrl(data.profile_image_url || null);
        // completion is recalculated by the useEffect above
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update form field
  const updateField = useCallback((field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Called by the screen after a successful image upload to sync URL into the hook
  const setExternalImageUrl = useCallback((url: string | null) => {
    // Strip cache-bust param so we store the clean URL
    const clean = url ? url.split("?")[0] : null;
    setProfileImageUrl(clean);
  }, []);

  // Add skill
  const addSkill = useCallback((skill: string) => {
    if (skill.trim()) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
    }
  }, []);

  // Remove skill
  const removeSkill = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
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
        cv_document_url: cvUrlRef.current,
        profile_image_url: profileImageUrlRef.current,
      });

      const updateData = {
        ...formData,
        profile_completed: latestStatus.isComplete,
      };

      const { error: updateError } = await supabase
        .from("jobseeker_profiles")
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
      console.error("Error saving profile:", err);
      toast.error(err.message || "Failed to save profile");
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, fetchProfile]);

  // Upload CV (placeholder)
  const uploadCV = useCallback(async (_fileUri: string): Promise<boolean> => {
    try {
      toast.info("CV upload functionality coming soon!");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to upload CV");
      return false;
    }
  }, []);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    loading,
    saving,
    formData,
    cvUrl,
    profileImageUrl,
    completionStatus,
    updateField,
    addSkill,
    removeSkill,
    saveProfile,
    uploadCV,
    setExternalImageUrl,
    refreshProfile: fetchProfile,
  };
}
