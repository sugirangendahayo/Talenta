import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { useNetwork } from "@/contexts/NetworkContext";
import { useRefetchOnReconnect } from "@/hooks/useRefetchOnReconnect";
import { useRequireOnline } from "@/hooks/useRequireOnline";

export interface EmployerDocsInfo {
  businessLicenseUrl: string | null;
  businessLicenseUpdatedAt: string | null;
  verificationDocUrl: string | null;
  verificationDocUpdatedAt: string | null;
}

export function useEmployerDocuments() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ business: boolean; verification: boolean }>({
    business: false,
    verification: false,
  });
  const [deleting, setDeleting] = useState<{ business: boolean; verification: boolean }>({
    business: false,
    verification: false,
  });
  const [docsInfo, setDocsInfo] = useState<EmployerDocsInfo>({
    businessLicenseUrl: null,
    businessLicenseUpdatedAt: null,
    verificationDocUrl: null,
    verificationDocUpdatedAt: null,
  });
  const { isOnline } = useNetwork();
  const { requireOnline } = useRequireOnline();
  const hasLoadedOnceRef = useRef(false);

  const fetchDocuments = useCallback(async () => {
    // Offline: don't attempt a request that would just fail/hang. Keep
    // whatever document info is already loaded visible instead of hanging
    // the spinner or clearing previously fetched data.
    if (!isOnline) {
      setLoading(false);
      if (!hasLoadedOnceRef.current) {
        toast.error("You're offline. Connect to the internet to load documents.");
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
        .select("business_license_url, verification_document_url, updated_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setDocsInfo({
          businessLicenseUrl: data.business_license_url,
          // Since we don't track independent update times yet, we fall back to row updated_at
          businessLicenseUpdatedAt: data.business_license_url ? data.updated_at : null,
          verificationDocUrl: data.verification_document_url,
          verificationDocUpdatedAt: data.verification_document_url ? data.updated_at : null,
        });
      }
      hasLoadedOnceRef.current = true;
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      toast.error(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  const uploadBusinessLicense = useCallback(async () => {
    if (!requireOnline()) return;
    try {
      setUploading((prev) => ({ ...prev, business: true }));
      // Placeholder for actual file picker and Supabase Storage upload
      toast.info("Business license upload functionality coming soon!");

      // Mock update to verify UI logic
      /*
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("employer_profiles").update({
        business_license_url: "https://example.com/license.pdf"
      }).eq("id", user?.id);
      await fetchDocuments();
      */
    } catch (err: any) {
      console.error("Error uploading business license:", err);
      toast.error(err.message || "Failed to upload business license");
    } finally {
      setUploading((prev) => ({ ...prev, business: false }));
    }
  }, [requireOnline]);

  const uploadVerificationDoc = useCallback(async () => {
    if (!requireOnline()) return;
    try {
      setUploading((prev) => ({ ...prev, verification: true }));
      // Placeholder for actual file picker and Supabase Storage upload
      toast.info("Verification document upload functionality coming soon!");
    } catch (err: any) {
      console.error("Error uploading verification document:", err);
      toast.error(err.message || "Failed to upload verification document");
    } finally {
      setUploading((prev) => ({ ...prev, verification: false }));
    }
  }, [requireOnline]);

  const deleteBusinessLicense = useCallback(async () => {
    if (!requireOnline()) return;
    try {
      setDeleting((prev) => ({ ...prev, business: true }));
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("employer_profiles")
        .update({ business_license_url: null })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Business license removed successfully");
      await fetchDocuments();
    } catch (err: any) {
      console.error("Error deleting business license:", err);
      toast.error(err.message || "Failed to delete business license");
    } finally {
      setDeleting((prev) => ({ ...prev, business: false }));
    }
  }, [fetchDocuments, requireOnline]);

  const deleteVerificationDoc = useCallback(async () => {
    if (!requireOnline()) return;
    try {
      setDeleting((prev) => ({ ...prev, verification: true }));
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("employer_profiles")
        .update({ verification_document_url: null })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Verification document removed successfully");
      await fetchDocuments();
    } catch (err: any) {
      console.error("Error deleting verification document:", err);
      toast.error(err.message || "Failed to delete verification document");
    } finally {
      setDeleting((prev) => ({ ...prev, verification: false }));
    }
  }, [fetchDocuments, requireOnline]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Smart auto-refresh: when connectivity returns, silently refresh the
  // document info if this screen is active.
  useRefetchOnReconnect(() => fetchDocuments());

  return {
    loading,
    uploading,
    deleting,
    docsInfo,
    uploadBusinessLicense,
    uploadVerificationDoc,
    deleteBusinessLicense,
    deleteVerificationDoc,
  };
}
