import { supabase } from "@/lib/supabase";
import * as Crypto from "expo-crypto";

export type JobseekerPremiumPlan = "free" | "professional";

export interface JobseekerCertificate {
  id: string;
  jobseeker_id: string;
  certificate_number: string;
  plan: JobseekerPremiumPlan;
  issued_at: string;
  expires_at: string;
  status: "active" | "revoked" | "expired";
}

export const simulateJobseekerPaymentAndActivate = async (
  userId: string,
  plan: JobseekerPremiumPlan
): Promise<void> => {
  if (plan === "free") return;

  // Fake payment delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const issuedAt = new Date().toISOString();
  // 1 year expiration
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  const expiresAtStr = expiresAt.toISOString();

  // Update profile
  const { error: profileError } = await supabase
    .from("jobseeker_profiles")
    .update({
      premium_plan: plan,
      premium_activated_at: issuedAt,
      premium_expires_at: expiresAtStr,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw profileError;

  // Generate certificate number
  const certNumber = `TALENTA-JS-${Crypto.randomUUID().split("-")[0].toUpperCase()}`;

  // Insert certificate
  const { error: certError } = await supabase
    .from("jobseeker_certificates")
    .insert({
      jobseeker_id: userId,
      certificate_number: certNumber,
      plan: plan,
      issued_at: issuedAt,
      expires_at: expiresAtStr,
      status: "active",
    });

  if (certError) throw certError;
};

export const getJobseekerPremiumStatus = async (
  userId: string
): Promise<{
  plan: JobseekerPremiumPlan;
  certificate: JobseekerCertificate | null;
}> => {
  const { data: profileData, error: profileError } = await supabase
    .from("jobseeker_profiles")
    .select("premium_plan")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const { data: certData, error: certError } = await supabase
    .from("jobseeker_certificates")
    .select("*")
    .eq("jobseeker_id", userId)
    .eq("status", "active")
    .order("issued_at", { ascending: false })
    .limit(1)
    .single();

  // Ignore 406 (Not Acceptable) or PGRST116 (No rows found) when checking certificates
  if (certError && certError.code !== "PGRST116") {
      console.error(certError);
  }

  return {
    plan: (profileData?.premium_plan as JobseekerPremiumPlan) || "free",
    certificate: certData as JobseekerCertificate | null,
  };
};
