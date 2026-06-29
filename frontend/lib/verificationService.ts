import { supabase } from "@/lib/supabase";
import { BusinessVerificationStatus } from "@/types/verification.types";
import { File } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";

export const uploadBusinessDocs = async (
  userId: string,
  existingUrls: string[]
): Promise<string[] | null> => {
  // Allow max 3 files
  if (existingUrls.length >= 3) {
    throw new Error("Maximum 3 files allowed.");
  }

  // Pick PDF or image document
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  const pickedFile = result.assets[0];

  // Validate file size (max 5MB)
  if (pickedFile.size && pickedFile.size > 5 * 1024 * 1024) {
    throw new Error("File must be smaller than 5MB.");
  }

  const file = new File(pickedFile.uri);
  const bytes = await file.bytes();

  const fileExt = pickedFile.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = `${userId}_biz_${timestamp}.${fileExt}`;
  const filePath = `business-docs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, bytes, {
      contentType: pickedFile.mimeType || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("documents").getPublicUrl(filePath);

  const updatedUrls = [...existingUrls, publicUrl];

  const { error: updateError } = await supabase
    .from("employer_profiles")
    .update({
      business_docs_urls: updatedUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw updateError;

  return updatedUrls;
};

export const removeBusinessDoc = async (
  userId: string,
  urlToRemove: string,
  existingUrls: string[]
): Promise<string[]> => {
  const oldPath = urlToRemove.split("/documents/")[1];
  if (oldPath) {
    await supabase.storage.from("documents").remove([oldPath]);
  }

  const updatedUrls = existingUrls.filter((url) => url !== urlToRemove);

  const { error: updateError } = await supabase
    .from("employer_profiles")
    .update({
      business_docs_urls: updatedUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw updateError;

  return updatedUrls;
};

export const submitForReview = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from("employer_profiles")
    .update({
      business_verification_status: "pending_review",
      business_docs_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
};

export const getEmployerVerificationStatus = async (
  userId: string
): Promise<{
  status: BusinessVerificationStatus;
  docs: string[];
  rejectionReason: string | null;
}> => {
  const { data, error } = await supabase
    .from("employer_profiles")
    .select("business_verification_status, business_docs_urls, business_rejection_reason")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return {
    status: data?.business_verification_status || "not_submitted",
    docs: data?.business_docs_urls || [],
    rejectionReason: data?.business_rejection_reason || null,
  };
};

// Admin actions
export const approveBusinessVerification = async (
  employerId: string
): Promise<void> => {
  const { error: updateError } = await supabase
    .from("employer_profiles")
    .update({
      business_verification_status: "approved",
      is_verified: true, // For backward compatibility
      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId);

  if (updateError) throw updateError;

  // Create notification
  await supabase.from("notifications").insert({
    user_id: employerId,
    type: "business_approved",
    title: "🎉 Business Registration Approved",
    message: "Congratulations! Your business registration has been approved. You may now subscribe to Talenta Premium to receive your Verified Employer badge.",
  });
};

export const rejectBusinessVerification = async (
  employerId: string,
  reason: string
): Promise<void> => {
  const { error: updateError } = await supabase
    .from("employer_profiles")
    .update({
      business_verification_status: "rejected",
      business_rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", employerId);

  if (updateError) throw updateError;

  // Create notification
  await supabase.from("notifications").insert({
    user_id: employerId,
    type: "business_rejected",
    title: "Business Registration Rejected",
    message: `Reason: ${reason}\n\nPlease upload corrected documents and submit again.`,
  });
};
