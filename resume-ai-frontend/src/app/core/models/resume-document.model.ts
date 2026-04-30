export type ResumeTemplateKey =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'ats'
  | 'developer'
  | 'compact'
  | 'creative'
  | 'professional';

export type ResumeSectionType = 'experience' | 'education' | 'skills' | 'projects' | 'custom';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ResumePageSize = 'A4' | 'Letter';

export interface PersonalDetails {
  fullName: string;
  headline?: string;
  email: string;
  phone: string;
  location?: string;
  links?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  summary?: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export interface ResumeSectionBase {
  id: string;
  type: ResumeSectionType;
  title: string;
  visible: boolean;
  order: number;
}

export interface WorkExperienceSection extends ResumeSectionBase {
  type: 'experience';
  items: WorkExperience[];
}

export interface EducationSection extends ResumeSectionBase {
  type: 'education';
  items: Education[];
}

export interface SkillsSection extends ResumeSectionBase {
  type: 'skills';
  items: Skill[];
}

export interface ProjectsSection extends ResumeSectionBase {
  type: 'projects';
  items: Project[];
}

export interface CustomSection extends ResumeSectionBase {
  type: 'custom';
  items: CustomSectionItem[];
}

export type ResumeDocumentSection =
  | WorkExperienceSection
  | EducationSection
  | SkillsSection
  | ProjectsSection
  | CustomSection;

export interface ResumeThemeConfig {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  sectionSpacing: number;
  pageSize: ResumePageSize;
}

export interface ResumeDocument {
  schemaVersion: 1;
  title: string;
  templateKey: ResumeTemplateKey;
  personal: PersonalDetails;
  sections: ResumeDocumentSection[];
  theme: ResumeThemeConfig;
  customData?: Record<string, unknown>;
  updatedAt?: string;
}
