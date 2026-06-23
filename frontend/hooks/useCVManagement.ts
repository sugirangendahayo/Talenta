import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useTranslation } from "react-i18next";

export interface CVInfo {
  url: string | null;
  fileName: string | null;
  uploadedAt: string | null;
  fileSize: number | null;
}

export function useCVManagement() {
  const { t } = useTranslation("profile");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cvInfo, setCvInfo] = useState<CVInfo>({
    url: null,
    fileName: null,
    uploadedAt: null,
    fileSize: null,
  });

  // Fetch current CV info
  const fetchCVInfo = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("cv.messages.notAuthenticated"));
      }

      const { data, error } = await supabase
        .from("jobseeker_profiles")
        .select("cv_document_url, updated_at")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data?.cv_document_url) {
        // Extract filename from URL
        const urlParts = data.cv_document_url.split("/");
        const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);

        setCvInfo({
          url: data.cv_document_url,
          fileName: fileName,
          uploadedAt: data.updated_at,
          fileSize: null,
        });
      } else {
        setCvInfo({
          url: null,
          fileName: null,
          uploadedAt: null,
          fileSize: null,
        });
      }
    } catch (err: any) {
      console.error("Error fetching CV info:", err);
      toast.error(err.message || t("cv.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Pick and upload CV
  const uploadCV = useCallback(async (): Promise<boolean> => {
    try {
      setUploading(true);

      // Pick PDF document
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return false;
      }

      const pickedFile = result.assets[0];

      // Validate file size (max 5MB)
      if (pickedFile.size && pickedFile.size > 5 * 1024 * 1024) {
        toast.error(t("cv.messages.fileTooLarge"));
        return false;
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("cv.messages.notAuthenticated"));
      }

      // Create File instance from URI using the new API
      const file = new File(pickedFile.uri);

      // Read file as bytes (Uint8Array)
      const bytes = await file.bytes();

      // Create unique filename
      const fileExt = pickedFile.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `${user.id}_cv_${timestamp}.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      // Delete old CV from storage if exists
      if (cvInfo.url) {
        const oldPath = cvInfo.url.split("/documents/")[1];
        if (oldPath) {
          await supabase.storage.from("documents").remove([oldPath]);
        }
      }

      // Upload to Supabase Storage using the bytes directly
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, bytes, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      // Update profile with CV URL
      const { error: updateError } = await supabase
        .from("jobseeker_profiles")
        .update({
          cv_document_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("CV uploaded successfully! 🎉");

      // Refresh CV info
      await fetchCVInfo();

      return true;
    } catch (err: any) {
      console.error("Error uploading CV:", err);
      toast.error(err.message || t("cv.messages.uploadFailed"));
      return false;
    } finally {
      setUploading(false);
    }
  }, [cvInfo.url, fetchCVInfo, t]);

  // Delete CV
  const deleteCV = useCallback(async (): Promise<boolean> => {
    try {
      setDeleting(true);

      if (!cvInfo.url) {
        toast.error(t("cv.messages.noCVToDelete"));
        return false;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("cv.messages.notAuthenticated"));
      }

      // Delete from storage
      const oldPath = cvInfo.url.split("/documents/")[1];
      if (oldPath) {
        const { error: deleteError } = await supabase.storage
          .from("documents")
          .remove([oldPath]);

        if (deleteError) {
          console.error("Error deleting from storage:", deleteError);
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from("jobseeker_profiles")
        .update({
          cv_document_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success(t("cv.messages.deleteSuccess"));

      // Clear CV info
      setCvInfo({
        url: null,
        fileName: null,
        uploadedAt: null,
        fileSize: null,
      });

      return true;
    } catch (err: any) {
      console.error("Error deleting CV:", err);
      toast.error(err.message || t("cv.messages.deleteFailed"));
      return false;
    } finally {
      setDeleting(false);
    }
  }, [cvInfo.url, t]);

  // Download/View CV (opens in browser)
  const viewCV = useCallback(() => {
    if (!cvInfo.url) {
      toast.error(t("cv.messages.noCVAvailable"));
      return;
    }

    // Open CV in browser
    const link = document.createElement("a");
    link.href = cvInfo.url;
    link.target = "_blank";
    link.download = cvInfo.fileName || "resume.pdf";
    link.click();
  }, [cvInfo]);

  // Load CV info on mount
  useEffect(() => {
    fetchCVInfo();
  }, [fetchCVInfo]);

  return {
    loading,
    uploading,
    deleting,
    cvInfo,
    uploadCV,
    deleteCV,
    viewCV,
    refreshCV: fetchCVInfo,
  };
}
