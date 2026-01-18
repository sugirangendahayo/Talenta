import { supabase } from "@/lib/supabase";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner-native";

export interface CVInfo {
  url: string | null;
  fileName: string | null;
  uploadedAt: string | null;
  fileSize: number | null;
}

export function useCVManagement() {
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
        throw new Error("Not authenticated");
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
      toast.error(err.message || "Failed to load CV information");
    } finally {
      setLoading(false);
    }
  }, []);

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

      const file = result.assets[0];

      // Validate file size (max 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 5MB");
        return false;
      }

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: "base64",
      });

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create unique filename
      const fileExt = file.name.split(".").pop();
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

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, bytes.buffer, {
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
      toast.error(err.message || "Failed to upload CV");
      return false;
    } finally {
      setUploading(false);
    }
  }, [cvInfo.url, fetchCVInfo]);

  // Delete CV
  const deleteCV = useCallback(async (): Promise<boolean> => {
    try {
      setDeleting(true);

      if (!cvInfo.url) {
        toast.error("No CV to delete");
        return false;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Not authenticated");
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

      toast.success("CV deleted successfully");

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
      toast.error(err.message || "Failed to delete CV");
      return false;
    } finally {
      setDeleting(false);
    }
  }, [cvInfo.url]);

  // Download/View CV (opens in browser)
  const viewCV = useCallback(() => {
    if (!cvInfo.url) {
      toast.error("No CV available");
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
