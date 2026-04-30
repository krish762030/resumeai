export interface ResumeAnalysis {
  id: number;
  resumeId: number;
  atsScore: number;
  summaryFeedback: string;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  extractedSkills: string[];
  improvedSummary: string;
  improvedExperienceBullets: string[];
  createdAt: string;
}
