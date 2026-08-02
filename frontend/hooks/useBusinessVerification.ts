import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  getEmployerVerificationStatus,
  uploadBusinessDocs,
  removeBusinessDoc,
  submitForReview,
} from "@/lib/verificationService";
import { BusinessVerificationStatus } from "@/types/verification.types";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export function useBusinessVerification() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [status, setStatus] = useState<BusinessVerificationStatus>("not_submitted");
  const [docs, setDocs] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const hasLoadedOnceRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    // Offline: don't attempt a request that would just fail/hang. Keep
    // whatever status/docs are already loaded visible.
    if (!isOnline) {
      setLoading(false);
      if (!hasLoadedOnceRef.current) {
        toast.error("You're offline. Connect to the internet to load verification status.");
      }
      return;
    }

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
      hasLoadedOnceRef.current = true;
    } catch (error: any) {
      console.error("Error fetching verification status:", error);
      toast.error(error.message || "Failed to load verification status");
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const handleUploadDoc = useCallback(async () => {
    if (!requireOnline()) return;
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
  }, [docs, requireOnline]);

  const handleRemoveDoc = useCallback(
    async (urlToRemove: string) => {
      if (!requireOnline()) return;
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
    [docs, requireOnline]
  );

  const handleSubmit = useCallback(async () => {
    if (!requireOnline()) return;
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
  }, [docs, requireOnline]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Smart auto-refresh: when connectivity returns, silently refresh the
  // verification status if this screen is active.
  useRefetchOnReconnect(() => fetchStatus());

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
