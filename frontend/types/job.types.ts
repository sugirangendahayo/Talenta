// types/job.types.ts - FIXED with proper status type

export interface Job {
  id: string | number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string[];
  category: string;
  posted: string;
  description: string;
  requirements: string[];
  logo: string;
  skills: string[];
}

export interface JobsData {
  jobs: Job[];
}

// Application status type
export type ApplicationStatus = "pending" | "shortlisted" | "hired" | "rejected";

// Applicant interface with proper status type
export interface Applicant {
  id: string;
  job_id: string;
  jobseeker_id: string;
  status: ApplicationStatus; 
  created_at: string;
  cover_letter?: string;
  jobseeker_profiles: {
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    experience_level?: string;
    skills?: string[];
    cv_document_url?: string;
    profile_image_url?: string | null;
    premium_plan?: string;
  };
  jobs: {
    title: string;
  };
}