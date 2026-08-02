import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { usePushNotification } from "@/hooks/usePushNotification";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface JobseekerProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  education_level: string | null;
  experience_level: string | null;
  skills: string[] | null;
  id_document_url: string | null;
  cv_document_url: string | null;
  profile_completed: boolean;
}

export interface ProfileRequirements {
  hasProfile: boolean;
  profileCompleted: boolean;
  hasCV: boolean;
  missingFields: string[];
}

export interface ApplyJobParams {
  jobId: string;
  coverLetter?: string;
}

export function useApplyJob() {
  const [applying, setApplying] = useState(false);
  const [checkingRequirements, setCheckingRequirements] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [profile, setProfile] = useState<JobseekerProfile | null>(null);
  const { sendPushToUser } = usePushNotification();
  const { requireOnline } = useRequireOnline();

  // Check if user meets requirements to apply
  const checkRequirements = useCallback(
    async (jobId: string): Promise<ProfileRequirements> => {
      setCheckingRequirements(true);

      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Please sign in to apply");
        }

        // Check if already applied
        const { data: existingApplication } = await supabase
          .from("job_applications")
          .select("id")
          .eq("job_id", jobId)
          .eq("jobseeker_id", user.id)
          .single();

        if (existingApplication) {
          setHasApplied(true);
        }

        // Get jobseeker profile
        const { data: profileData, error: profileError } = await supabase
          .from("jobseeker_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError || !profileData) {
          return {
            hasProfile: false,
            profileCompleted: false,
            hasCV: false,
            missingFields: ["Profile not found"],
          };
        }

        setProfile(profileData);

        // Check required fields
        const missingFields: string[] = [];

        // Required: CV/Resume
        if (!profileData.cv_document_url) {
          missingFields.push("CV/Resume");
        }

        // Check if profile is marked as completed
        // If profile_completed is false, we need to check what's missing
        if (!profileData.profile_completed) {
          // Check essential fields for profile completion
          if (!profileData.date_of_birth) missingFields.push("Date of Birth");
          if (!profileData.gender) missingFields.push("Gender");
          if (!profileData.country) missingFields.push("Country");
          if (!profileData.city) missingFields.push("City");
          if (!profileData.education_level)
            missingFields.push("Education Level");
          if (!profileData.experience_level)
            missingFields.push("Experience Level");
          if (!profileData.skills || profileData.skills.length === 0)
            missingFields.push("Skills");
        }

        return {
          hasProfile: true,
          profileCompleted: profileData.profile_completed,
          hasCV: !!profileData.cv_document_url,
          missingFields,
        };
      } catch (err: any) {
        console.error("Error checking requirements:", err);
        return {
          hasProfile: false,
          profileCompleted: false,
          hasCV: false,
          missingFields: [err.message || "Failed to check requirements"],
        };
      } finally {
        setCheckingRequirements(false);
      }
    },
    []
  );

  // Apply for a job
  const applyForJob = useCallback(
    async ({ jobId, coverLetter }: ApplyJobParams): Promise<boolean> => {
      if (!requireOnline("You're offline. Reconnect to submit your application.")) {
        return false;
      }

      setApplying(true);

      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error("Please sign in to apply");
          return false;
        }

        // Check requirements first
        const requirements = await checkRequirements(jobId);

        if (!requirements.hasProfile) {
          toast.error("Jobseeker profile not found");
          return false;
        }

        if (requirements.missingFields.length > 0) {
          toast.error(
            `Please complete your profile first: ${requirements.missingFields.join(", ")}`
          );
          return false;
        }

        // Insert application
        const { error: insertError } = await supabase
          .from("job_applications")
          .insert({
            job_id: jobId,
            jobseeker_id: user.id,
            cover_letter: coverLetter?.trim() || null,
            status: "pending",
          });

        if (insertError) {
          // Check if it's a duplicate application
          if (insertError.code === "23505") {
            toast.error("You've already applied to this job");
            setHasApplied(true);
            return false;
          }
          throw insertError;
        }

        // ── Send push notification to the employer ──────────────────────────
        // Fetch job details to get employer info for the notification
        try {
          const { data: jobData } = await supabase
            .from("jobs")
            .select("title, employer_id")
            .eq("id", jobId)
            .single();

          if (jobData?.employer_id) {
            const applicantName = profile?.full_name?.trim() || "A candidate";

            await sendPushToUser({
              recipientUserId: jobData.employer_id,
              title: "New Job Application ",
              body: `${applicantName} has applied for your ${jobData.title} position.`,
              data: {
                type: "new_application",
                job_id: jobId,
              },
            });

            // Insert database notification for the employer
            await supabase.from("notifications").insert({
              user_id: jobData.employer_id,
              type: "new_application",
              title: "New Job Application 📋",
              message: `${applicantName} has applied for your ${jobData.title} position.`,
              job_id: jobId,
              data: {
                job_title: jobData.title,
                applicant_name: applicantName,
              },
            });
          }
        } catch (notifErr) {
          // Non-fatal: notification failure should not block the application
          console.warn("[useApplyJob] Push notification failed:", notifErr);
        }
        // ───────────────────────────────────────────────────────────────────

        // Success!
        toast.success("Application submitted successfully! 🎉");
        setHasApplied(true);
        return true;
      } catch (err: any) {
        console.error("Error applying:", err);
        toast.error(err.message || "Failed to submit application");
        return false;
      } finally {
        setApplying(false);
      }
    },
    [checkRequirements, requireOnline]
  );

  // Reset state (useful when navigating away)
  const reset = useCallback(() => {
    setHasApplied(false);
    setProfile(null);
  }, []);

  return {
    applying,
    checkingRequirements,
    hasApplied,
    profile,
    checkRequirements,
    applyForJob,
    reset,
  };
}
