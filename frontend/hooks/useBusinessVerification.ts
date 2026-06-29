import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  getEmployerVerificationStatus,
  uploadBusinessDocs,
  removeBusinessDoc,
  submitForReview,
} from "@/lib/verificationService";
import { BusinessVerificationStatus } from "@/types/verification.types";
import { toast } from "sonner-native";

export function useBusinessVerification() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [status, setStatus] = useState<BusinessVerificationStatus>("not_submitted");
  const [docs, setDocs] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("Not authenticated");

      const data = await getEmployerVerificationStatus(user.id);
      setStatus(data.status);
      setDocs(data.docs);
      setRejectionReason(data.rejectionReason);
    } catch (error: any) {
      console.error("Error fetching verification status:", error);
      toast.error(error.message || "Failed to load verification status");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUploadDoc = useCallback(async () => {
    try {
      setUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newDocs = await uploadBusinessDocs(user.id, docs);
      if (newDocs) {
        setDocs(newDocs);
        toast.success("Document uploaded successfully");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  }, [docs]);

  const handleRemoveDoc = useCallback(
    async (urlToRemove: string) => {
      try {
        setUploading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const newDocs = await removeBusinessDoc(user.id, urlToRemove, docs);
        setDocs(newDocs);
        toast.success("Document removed");
      } catch (error: any) {
        console.error("Remove error:", error);
        toast.error(error.message || "Failed to remove document");
      } finally {
        setUploading(false);
      }
    },
    [docs]
  );

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (docs.length === 0) {
        throw new Error("Please upload at least one document");
      }

      await submitForReview(user.id);
      setStatus("pending_review");
      toast.success("Documents submitted for review");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit documents");
    } finally {
      setSubmitting(false);
    }
  }, [docs]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    loading,
    uploading,
    submitting,
    status,
    docs,
    rejectionReason,
    handleUploadDoc,
    handleRemoveDoc,
    handleSubmit,
    refreshStatus: fetchStatus,
  };
}
