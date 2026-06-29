// types/application.ts

export type ApplicationStatus = "pending" | "shortlisted" | "hired" | "rejected";

/** "all" is a UI-only concept — it's never a value the backend returns */
export type ApplicationFilterId = ApplicationStatus | "all";

export interface ApplicationJobSummary {
  title: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  employer_profiles: {
    company_name: string;
    business_verification_status?: string;
    premium_plan?: string;
  };
}

export interface JobApplication {
  id: string;
  job_id: string;
  status: ApplicationStatus;
  created_at: string;
  jobs: ApplicationJobSummary;
}