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