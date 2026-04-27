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
  atsFriendly: boolean;
  previewImageUrl: string;
  htmlTemplatePath: string;
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

export interface UsageLimit {
  planType: string;
  freeResumeEditsUsed: number;
  freeDownloadsUsed: number;
  premium: boolean;
}
