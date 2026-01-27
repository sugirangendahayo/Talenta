// hooks/useApplicationStatus.ts
// FIXED: Sends emails without auth headers (JWT disabled on function)!
import { InterviewDetails } from "@/components/modal/InterviewDetailsModal";
import { supabase } from "@/lib/supabase";
import { ApplicationStatus } from "@/types/job.types";
import { useState } from "react";

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
          notes: interviewDetails?.additionalNotes || null,
        });

      if (historyError) {
        console.error("Failed to create status history:", historyError);
        // Don't throw - this is not critical
      }

      // 4. If shortlisted, create interview record
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
      }

      // 5. Send email for shortlisted, rejected, or hired
      // ✅ No headers needed (JWT disabled on function)!
      if (newStatus === "shortlisted" || newStatus === "rejected" || newStatus === "hired") {
        try {
          console.log(`Sending ${newStatus} email for application ${applicationId}`);
          
          const { data: functionData, error: functionError } =
            await supabase.functions.invoke("send-interview-email", {
              body: {
                applicationId,
                status: newStatus,
                recipientEmail: "sugiraelisha@gmail.com"  ,
                ...(newStatus === "shortlisted" && { interviewDetails }),
              },
            });

          if (functionError) {
            console.error("Email sending failed:", functionError);
            
            // Try to get more error details
            if (functionError.context) {
              try {
                const errorResponse = await functionError.context.json();
                console.error("Server error details:", errorResponse);
              } catch (e) {
                // Ignore if can't parse error
                console.error(e);
                
                
              }
            }
            
            // Don't throw - notification will still be sent via trigger
            console.warn("Email failed but continuing with status update");
          } else {
            console.log("Email sent successfully:", functionData);
          }
        } catch (emailError) {
          console.error("Email service error:", emailError);
          // Don't throw - notification will still be sent via trigger
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
    interviewDetails: InterviewDetails
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