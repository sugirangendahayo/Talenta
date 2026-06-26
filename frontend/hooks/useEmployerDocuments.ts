import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";

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

  const fetchDocuments = useCallback(async () => {
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
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      toast.error(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBusinessLicense = useCallback(async () => {
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
  }, []);

  const uploadVerificationDoc = useCallback(async () => {
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
  }, []);

  const deleteBusinessLicense = useCallback(async () => {
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
  }, [fetchDocuments]);

  const deleteVerificationDoc = useCallback(async () => {
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
  }, [fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
