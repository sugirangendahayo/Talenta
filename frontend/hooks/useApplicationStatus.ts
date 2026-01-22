// hooks/useApplicationStatus.ts
// Updated to use Supabase Edge Functions (no separate backend needed!)
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { InterviewDetails } from "@/components/modal/InterviewDetailsModal";

type ApplicationStatus = "pending" | "shortlisted" | "hired" | "rejected";

interface UpdateStatusParams {
  applicationId: string;
  newStatus: ApplicationStatus;
  interviewDetails?: InterviewDetails;
  rejectionReason?: string;
}

export function useApplicationStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateApplicationStatus = async ({
    applicationId,
    newStatus,
    interviewDetails,
    rejectionReason,
  }: UpdateStatusParams) => {
    setIsUpdating(true);
    setError(null);

    try {
      // Get current user (employer)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
        `,
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
          notes: interviewDetails?.additionalNotes || null,
        });

      if (historyError) {
        console.error("Failed to create status history:", historyError);
        // Don't throw - this is not critical
      }

      // 4. If shortlisted, create interview record and send email
      if (newStatus === "shortlisted" && interviewDetails) {
        const {
          interviewType,
          interviewDate,
          interviewTime,
          location,
          meetingLink,
          additionalNotes,
        } = interviewDetails;

        // Validate interview details
        if (interviewType === "physical" && !location) {
          throw new Error("Location is required for physical interviews");
        }
        if (interviewType === "online" && !meetingLink) {
          throw new Error("Meeting link is required for online interviews");
        }

        // Insert interview record
        const { data: interview, error: interviewError } = await supabase
          .from("interviews")
          .insert({
            application_id: applicationId,
            job_id: application.job_id,
            employer_id: user.id,
            jobseeker_id: application.jobseeker_id,
            interview_type: interviewType,
            interview_date: interviewDate,
            interview_time: interviewTime,
            location: interviewType === "physical" ? location : null,
            meeting_link: interviewType === "online" ? meetingLink : null,
            additional_notes: additionalNotes || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (interviewError) {
          console.error("Failed to create interview:", interviewError);
          throw new Error("Failed to schedule interview");
        }

        // 5. Call Supabase Edge Function to send email
        try {
          const { data: functionData, error: functionError } =
            await supabase.functions.invoke("send-interview-email", {
              body: {
                applicationId,
                interviewDetails,
              },
            });

          if (functionError) {
            console.error("Email sending failed:", functionError);
            // Don't throw - interview is already created
            // The notification will still be sent via trigger
          } else {
            console.log("Email sent successfully:", functionData);
          }
        } catch (emailError) {
          console.error("Email service error:", emailError);
          // Don't throw - interview is already created
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

  const shortlistWithInterview = async (
    applicationId: string,
    interviewDetails: InterviewDetails,
  ) => {
    return updateApplicationStatus({
      applicationId,
      newStatus: "shortlisted",
      interviewDetails,
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
    shortlistWithInterview,
    rejectApplication,
    hireCandidate,
  };
}
