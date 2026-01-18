import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

/**
 * Secure Storage Adapter for Supabase Auth
 *
 * SECURITY STRATEGY:
 * - Only store the REFRESH TOKEN in SecureStore (small, <200 bytes)
 * - Access tokens and session data stay in memory only
 * - This avoids the 2048-byte limit while maintaining security
 *
 * HOW IT WORKS:
 * - Supabase tries to store the full session (large, >2KB)
 * - We intercept and only persist the refresh token
 * - On app restart, Supabase uses the refresh token to get new session
 * - Access tokens live in memory during the session
 */

// Simple in-memory cache for session data
const memoryStorage: { [key: string]: string } = {};

const SecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // First check memory cache (faster)
      if (memoryStorage[key]) {
        return memoryStorage[key];
      }

      // Then check SecureStore for refresh token
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        memoryStorage[key] = value; // Cache in memory
      }
      return value;
    } catch (error) {
      console.error("Error reading from SecureStore:", error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Always store in memory
      memoryStorage[key] = value;

      // Parse the value to extract only the refresh token
      try {
        const session = JSON.parse(value);

        // Only persist the refresh token to SecureStore (small & secure)
        if (session.refresh_token) {
          const refreshTokenData = {
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          };

          await SecureStore.setItemAsync(key, JSON.stringify(refreshTokenData));
        }
      } catch (parseError) {
        // If it's not JSON, store as-is (shouldn't happen with Supabase)
        const sizeInBytes = new Blob([value]).size;
        if (sizeInBytes < 2048) {
          await SecureStore.setItemAsync(key, value);
        } else {
          console.warn(
            `Skipping SecureStore for large value (${sizeInBytes} bytes)`
          );
        }
      }
    } catch (error) {
      console.error("Error writing to SecureStore:", error);
      // Don't throw - keep session in memory even if persist fails
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      delete memoryStorage[key];
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Error removing from SecureStore:", error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Use shorter token expiry for better security
    flowType: "pkce", // More secure auth flow
  },
});

// Type definitions
export type Role = "jobseeker" | "employer" | "admin";

export interface Profile {
  id: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface JobseekerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  city?: string;
  education_level?: string;
  experience_level?: string;
  skills?: string[];
  id_document_url?: string;
  cv_document_url?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  company_name: string;
  email: string;
  phone?: string;
  company_website?: string;
  company_address?: string;
  country?: string;
  city?: string;
  business_license_url?: string;
  verification_document_url?: string;
  is_verified: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}
