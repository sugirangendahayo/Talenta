// hooks/useApplicationStatus.ts
// FIXED: Sends emails without auth headers (JWT disabled on function)!
import { InterviewDetails } from "@/components/modal/InterviewDetailsModal";
import { supabase } from "@/lib/supabase";
import { ApplicationStatus } from "@/types/job.types";
import { usePushNotification } from "@/hooks/usePushNotification";
import { useState } from "react";

interface UpdateStatusParams {
  applicationId: string;
  newStatus: ApplicationStatus;
  rejectionReason?: string;
}

export function useApplicationStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendPushToUser } = usePushNotification();

  const updateApplicationStatus = async ({
    applicationId,
    newStatus,
    rejectionReason,
  }: UpdateStatusParams) => {
    setIsUpdating(true);
    setError(null);

    try {
      // Get current session (includes user and access_token)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) throw new Error("Not authenticated");

      const user = session.user;

      // 1. Get application details to verify ownership
      const { data: application, error: appError } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          jobs!inner(
            id,
            employer_id,
            title
          )
        `
        )
        .eq("id", applicationId)
        .single();

      if (appError || !application) {
        throw new Error("Application not found");
      }

      // Verify employer owns this job
      if (application.jobs.employer_id !== user.id) {
        throw new Error("Unauthorized: You don't own this job");
      }

      // Prevent hiring without shortlisting first
      if (newStatus === "hired" && application.status !== "shortlisted") {
        throw new Error("Cannot hire without shortlisting candidate first");
      }

      const oldStatus = application.status;

      // 2. Update application status
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      // 3. Create status history record
      const { error: historyError } = await supabase
        .from("application_status_history")
        .insert({
          application_id: applicationId,
          previous_status: oldStatus,
          new_status: newStatus,
          changed_by: user.id,
          changed_by_role: "employer",
          reason: rejectionReason || null,
        });

      if (historyError) {
        console.error("Failed to create status history:", historyError);
        // Don't throw - this is not critical
      }



      // 6. Send push notification to the job seeker
      try {
        // Fetch company name and verification for richer notification content
        const { data: employerProfile } = await supabase
          .from("employer_profiles")
          .select("company_name, is_verified, premium_plan")
          .eq("id", user.id)
          .single();

        const companyName = employerProfile?.company_name ?? "The employer";
        const isVerified = employerProfile?.is_verified ?? false;
        const premiumPlan = employerProfile?.premium_plan ?? "free";
        const jobTitle = application.jobs.title;
        const jobseekerId = application.jobseeker_id;

        // Build message per status
        const notificationMap: Record<
          string,
          { title: string; body: string }
        > = {
          preselected: {
            title: "Application Preselected ✅",
            body: `Your application for ${jobTitle} has been preselected by ${companyName}. They are reviewing your profile.`,
          },
          shortlisted: {
            title: "Application Shortlisted 🎉",
            body: `Congratulations! Your application for ${jobTitle} has been shortlisted by ${companyName}. The employer will contact you directly for next steps.`,
          },
          hired: {
            title: "You're Hired! 🎊",
            body: `Fantastic news! ${companyName} has officially offered you the ${jobTitle} position. Congratulations!`,
          },
          rejected: {
            title: "Application Update",
            body: `Thank you for applying to ${jobTitle} at ${companyName}. Unfortunately, you were not selected at this time. Keep applying!`,
          },
        };

        const notif = notificationMap[newStatus];
        if (notif && jobseekerId) {
          await sendPushToUser({
            recipientUserId: jobseekerId,
            title: notif.title,
            body: notif.body,
            data: {
              type: "application_status_changed",
              application_id: applicationId,
              status: newStatus,
              job_id: application.job_id,
            },
          });

          // Insert database notification for the jobseeker
          await supabase.from("notifications").insert({
            user_id: jobseekerId,
            type: `application_${newStatus}`,
            title: notif.title,
            message: notif.body,
            application_id: applicationId,
            job_id: application.job_id,
            data: {
              job_title: jobTitle,
              company_name: companyName,
              status: newStatus,
              is_verified: isVerified,
              premium_plan: premiumPlan,
            },
          });
        }
      } catch (pushErr) {
        // Non-fatal: status update already succeeded
        console.warn("[useApplicationStatus] Push notification failed:", pushErr);
      }

      // 7. Send an email to the jobseeker for the most usability-critical
      // status changes (shortlisted, hired, rejected). "pending" is skipped
      // since it's just the application's initial state, not an employer
      // action worth emailing about.
      if (
        newStatus === "shortlisted" ||
        newStatus === "hired" ||
        newStatus === "rejected"
      ) {
        try {
          const { error: emailError } = await supabase.functions.invoke(
            "send-interview-email",
            {
              body: {
                applicationId,
                status: newStatus,
              },
            },
          );
          if (emailError) {
            console.warn("[useApplicationStatus] Status email failed:", emailError);
          }
        } catch (emailErr) {
          // Non-fatal: status update already succeeded
          console.warn("[useApplicationStatus] Status email failed:", emailErr);
        }
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update application status";
      setError(errorMessage);
      console.error("Error updating application status:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  const shortlistApplication = async (
    applicationId: string
  ) => {
    return updateApplicationStatus({
      applicationId,
      newStatus: "shortlisted",
    });
  };

  const rejectApplication = async (applicationId: string, reason?: string) => {
    return updateApplicationStatus({
      applicationId,
      newStatus: "rejected",
      rejectionReason: reason,
    });
  };

  const hireCandidate = async (applicationId: string) => {
    return updateApplicationStatus({
      applicationId,
      newStatus: "hired",
    });
  };

  return {
    isUpdating,
    error,
    updateApplicationStatus,
    shortlistApplication,
    rejectApplication,
    hireCandidate,
  };
}