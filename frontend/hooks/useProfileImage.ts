// hooks/useProfileImage.ts
// Handles picking and uploading a profile photo to the 'profiles' Supabase Storage bucket.
import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner-native";
import { useRequireOnline } from "@/hooks/useRequireOnline";

/**
 * Returns helpers for picking and uploading a profile photo.
 *
 * @param userId   - Auth user ID (used as the path prefix)
 * @param table    - Which profile table to update: "employer_profiles" | "jobseeker_profiles"
 * @param onSuccess - Called with the final public URL after a successful upload
 */
export function useProfileImage(
  userId: string,
  table: "employer_profiles" | "jobseeker_profiles",
  onSuccess?: (url: string) => void
) {
  const [uploading, setUploading] = useState(false);
  const { requireOnline } = useRequireOnline();

  const pickAndUpload = useCallback(async () => {
    if (!requireOnline("You're offline. Reconnect to upload a photo.")) return null;

    try {
      // 1. Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        toast.error("Permission required to access your photo library.");
        return null;
      }

      // 2. Launch picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75, // Good quality, smaller file
      });

      if (result.canceled || !result.assets?.length) return null;

      const asset = result.assets[0];

      // Validate size (max 4 MB)
      if (asset.fileSize && asset.fileSize > 4 * 1024 * 1024) {
        toast.error("Image must be smaller than 4 MB.");
        return null;
      }

      setUploading(true);

      // 3. Read file bytes via fetch (works on both iOS and Android)
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // 4. Build storage path
      const ext = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${userId}/profile.${ext}`;
      const contentType = asset.mimeType ?? `image/${ext}`;

      // 5. Upload (upsert so re-uploads replace the old photo)
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, bytes, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 6. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      // Add cache-bust so React Native Image refreshes immediately
      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      // 7. Persist URL to the profile table
      const { error: updateError } = await supabase
        .from(table)
        .update({ profile_image_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Profile photo updated!");
      onSuccess?.(urlWithBust);
      return urlWithBust;
    } catch (err: any) {
      console.error("[useProfileImage] upload error:", err);
      toast.error(err.message ?? "Failed to upload photo. Please try again.");
      return null;
    } finally {
      setUploading(false);
    }
  }, [userId, table, onSuccess, requireOnline]);

  return { pickAndUpload, uploading };
}
