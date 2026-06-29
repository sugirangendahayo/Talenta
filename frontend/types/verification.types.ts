export type BusinessVerificationStatus =
  | "not_submitted"
  | "pending_review"
  | "approved"
  | "rejected";

export type PremiumPlan = "free" | "professional" | "business" | "enterprise";

export interface EmployerCertificate {
  id: string;
  employer_id: string;
  certificate_number: string;
  plan: PremiumPlan;
  issued_at: string;
  expires_at?: string;
  status: "active" | "revoked" | "expired";
  created_at: string;
}
