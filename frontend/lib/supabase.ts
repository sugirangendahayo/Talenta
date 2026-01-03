import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Type definitions for our database
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
