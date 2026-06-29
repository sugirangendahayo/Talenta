import { supabase } from "@/lib/supabase";
import { EmployerCertificate, PremiumPlan } from "@/types/verification.types";
import * as Crypto from "expo-crypto";

export const simulatePaymentAndActivate = async (
  userId: string,
  plan: PremiumPlan
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
    .from("employer_profiles")
    .update({
      premium_plan: plan,
      premium_activated_at: issuedAt,
      premium_expires_at: expiresAtStr,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) throw profileError;

  // Generate certificate number
  const certNumber = `TALENTA-CERT-${Crypto.randomUUID().split("-")[0].toUpperCase()}`;

  // Insert certificate
  const { error: certError } = await supabase
    .from("employer_certificates")
    .insert({
      employer_id: userId,
      certificate_number: certNumber,
      plan: plan,
      issued_at: issuedAt,
      expires_at: expiresAtStr,
      status: "active",
    });

  if (certError) throw certError;
};

export const getEmployerPremiumStatus = async (
  userId: string
): Promise<{
  plan: PremiumPlan;
  certificate: EmployerCertificate | null;
}> => {
  const { data: profileData, error: profileError } = await supabase
    .from("employer_profiles")
    .select("premium_plan")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const { data: certData, error: certError } = await supabase
    .from("employer_certificates")
    .select("*")
    .eq("employer_id", userId)
    .eq("status", "active")
    .order("issued_at", { ascending: false })
    .limit(1)
    .single();

  // Ignore 406 (Not Acceptable) or PGRST116 (No rows found) when checking certificates
  if (certError && certError.code !== "PGRST116") {
      // we only care if it's a real error, no cert is fine
      console.error(certError);
  }

  return {
    plan: profileData?.premium_plan || "free",
    certificate: certData as EmployerCertificate | null,
  };
};
