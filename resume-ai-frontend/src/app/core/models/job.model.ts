export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  experienceLevel: string;
  requiredSkills: string[];
  jobUrl: string;
}

export interface JobMatch {
  id: number;
  jobId: number;
  title: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobUrl: string;
  createdAt: string;
}
