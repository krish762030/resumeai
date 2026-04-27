export interface ResumeResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  status: 'UPLOADED' | 'PARSED' | 'ANALYZED' | 'FAILED';
  createdAt: string;
}

export interface ResumeTemplate {
  id: number;
  name: string;
  category: string;
  roleType: string;
  experienceLevel: string;
  layoutType: string;
  styleType: string;
  atsFriendly: boolean;
  tagsJson: string;
  previewImageUrl: string;
  templateKey: string;
  htmlTemplatePath: string;
  cssTemplatePath: string;
  supportedSectionsJson: string;
  htmlTemplateContent?: string;
  premium: boolean;
}

export interface GeneratedResume {
  id: number;
  templateId: number;
  templateName: string;
  templateHtmlContent?: string;
  title: string;
  resumeDataJson: string;
  generatedHtml: string;
  generatedPdfUrl: string | null;
  editCount: number;
  downloadCount: number;
  planType: string;
  premiumTemplate: boolean;
  canEdit: boolean;
  watermarkEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSection {
  id: number;
  sectionType: string;
  sectionTitle: string;
  sectionOrder: number;
  isVisible: boolean;
  contentJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeTheme {
  headerColor: string;
  primaryColor: string;
  fontFamily: string;
  headerFontSize: number;
  bodyFontSize: number;
  sectionStyle: string;
  layout: string;
}

export interface ResumeSectionTemplate {
  id: number;
  sectionType: string;
  title: string;
  description: string;
  icon: string;
  isDefault: boolean;
  isPremium: boolean;
  displayOrder: number;
  defaultContentJson: string;
}

export interface ResumeEditorResume {
  id: number;
  templateId: number;
  templateName: string;
  templateKey: string;
  templateLayoutType: string;
  templateStyleType: string;
  templateSupportedSectionsJson: string;
  title: string;
  themeJson: string;
  status: string;
  editCount: number;
  downloadCount: number;
  generatedHtml: string;
  generatedPdfUrl: string | null;
  planType: string;
  premiumTemplate: boolean;
  canEdit: boolean;
  watermarkEnabled: boolean;
  hiddenUnsupportedSectionCount: number;
  hiddenUnsupportedSections: string[];
  sections: ResumeSection[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeEditorState {
  resumeId: number;
  templateId: number;
  activeTab: 'overview' | 'content' | 'customize' | 'ai';
  sections: ResumeSection[];
  theme: ResumeTheme;
  selectedSectionId?: number;
}

export interface UsageLimit {
  planType: string;
  freeResumeEditsUsed: number;
  freeDownloadsUsed: number;
  premium: boolean;
}
