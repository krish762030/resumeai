import { Injectable } from '@angular/core';
import { GeneratedResume, ResumeTemplate } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeBuilderLocalService {
  private readonly templates: ResumeTemplate[] = [
    this.template(1, 'ATS Graduate', 'Fresher', 'Software Developer', 'Fresher', 'Single Column', 'Clean', true, true, 'assets/templates/ats-graduate.svg', 'ats-graduate', 'styles/ats-graduate', '["summary","experience","skills","education","projects"]', '["modern","clean","one-column"]'),
    this.template(2, 'ATS Internship', 'Fresher', 'Software Developer', 'Fresher', 'Single Column', 'Minimal', false, true, 'assets/templates/ats-internship.svg', 'ats-internship', 'styles/ats-internship', '["summary","experience","skills","education","projects"]', '["internship","ATS","student"]'),
    this.template(3, 'Fresher Software Developer', 'Developer', 'Software Developer', 'Fresher', 'Single Column', 'Modern', false, true, 'assets/templates/fresher-software-developer.svg', 'fresher-software-developer', 'styles/fresher-software-developer', '["summary","experience","skills","education","projects","certifications"]', '["developer","simple","ATS"]'),
    this.template(4, 'Java Developer', 'Developer', 'Software Developer', 'Mid Level', 'Single Column', 'Modern', true, true, 'assets/templates/java-developer.svg', 'java-developer', 'styles/java-developer', '["summary","experience","skills","education","projects","certifications"]', '["java","backend","clean"]'),
    this.template(5, 'Backend Developer', 'Developer', 'Software Developer', 'Mid Level', 'Single Column', 'Minimal', true, true, 'assets/templates/backend-developer.svg', 'backend-developer', 'styles/backend-developer', '["summary","experience","skills","education","projects","certifications"]', '["api","microservices","ATS"]'),
    this.template(6, 'Full Stack Developer', 'Developer', 'Software Developer', 'Mid Level', 'Two Column', 'Modern', true, true, 'assets/templates/fullstack-developer.svg', 'fullstack-developer', 'styles/fullstack-developer', '["summary","experience","skills","education","projects","certifications"]', '["modern","two-column","full-stack"]'),
    this.template(7, 'Data Analyst', 'Developer', 'Data Analyst', 'Mid Level', 'Single Column', 'Clean', true, true, 'assets/templates/data-analyst.svg', 'data-analyst', 'styles/data-analyst', '["summary","experience","skills","education","projects","certifications"]', '["analytics","sql","dashboard"]'),
    this.template(8, 'MBA Fresher', 'Professional', 'MBA', 'Fresher', 'Single Column', 'Clean', true, true, 'assets/templates/mba-fresher.svg', 'mba-fresher', 'styles/mba-fresher', '["summary","experience","skills","education","projects"]', '["mba","business","clean"]'),
    this.template(9, 'Professional One Page', 'Professional', 'MBA', 'Mid Level', 'Single Column', 'Compact', false, true, 'assets/templates/professional-one-page.svg', 'professional-one-page', 'styles/professional-one-page', '["summary","experience","skills","education","projects"]', '["compact","one-page","executive"]'),
    this.template(10, 'Two Column Modern', 'Modern', 'Software Developer', 'Mid Level', 'Two Column', 'Modern', true, true, 'assets/templates/two-column-modern.svg', 'two-column-modern', 'styles/two-column-modern', '["summary","experience","skills","education","projects","certifications"]', '["two-column","modern","visual"]'),
    this.template(11, 'Compact Resume', 'Compact', 'Software Developer', 'Mid Level', 'Single Column', 'Compact', true, true, 'assets/templates/compact-resume.svg', 'compact-resume', 'styles/compact-resume', '["summary","experience","skills","education","projects"]', '["compact","one-page","ATS"]'),
    this.template(12, 'Creative Clean', 'Modern', 'Designer', 'Mid Level', 'Two Column', 'Creative', true, true, 'assets/templates/creative-clean.svg', 'creative-clean', 'styles/creative-clean', '["summary","experience","skills","education","projects"]', '["creative","clean","portfolio"]')
  ];

  private readonly storageKey = 'resume_ai_guest_resumes';

  getTemplates(): ResumeTemplate[] {
    return this.templates;
  }

  getTemplate(templateId: number): ResumeTemplate | null {
    return this.templates.find((template) => template.id === templateId) ?? null;
  }

  getResumes(): GeneratedResume[] {
    return this.getStoredResumes();
  }

  getResume(resumeId: number): GeneratedResume | null {
    return this.getStoredResumes().find((resume) => resume.id === resumeId) ?? null;
  }

  createResume(template: ResumeTemplate, title: string, resumeData: Record<string, unknown>): GeneratedResume {
    const now = new Date().toISOString();
    const created = this.toGeneratedResume(Date.now(), template, title, resumeData, 0, 0, now, now);
    const resumes = this.getStoredResumes();
    resumes.unshift(created);
    this.persist(resumes);
    return created;
  }

  updateResume(resumeId: number, template: ResumeTemplate, title: string, resumeData: Record<string, unknown>): GeneratedResume {
    const resumes = this.getStoredResumes();
    const index = resumes.findIndex((resume) => resume.id === resumeId);
    if (index < 0) {
      throw new Error('Resume draft not found.');
    }

    const previous = resumes[index];
    const updated = this.toGeneratedResume(
      previous.id,
      template,
      title,
      resumeData,
      previous.editCount + 1,
      previous.downloadCount,
      previous.createdAt,
      new Date().toISOString()
    );
    resumes[index] = updated;
    this.persist(resumes);
    return updated;
  }

  incrementDownloadCount(resumeId: number): GeneratedResume | null {
    const resumes = this.getStoredResumes();
    const index = resumes.findIndex((resume) => resume.id === resumeId);
    if (index < 0) {
      return null;
    }
    resumes[index] = {
      ...resumes[index],
      downloadCount: resumes[index].downloadCount + 1,
      updatedAt: new Date().toISOString()
    };
    this.persist(resumes);
    return resumes[index];
  }

  downloadHtml(resume: GeneratedResume): void {
    const blob = new Blob([resume.generatedHtml], { type: 'text/html;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${resume.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'resume'}.html`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  private getStoredResumes(): GeneratedResume[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as GeneratedResume[];
    } catch {
      return [];
    }
  }

  private persist(resumes: GeneratedResume[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(resumes));
  }

  private toGeneratedResume(
    id: number,
    template: ResumeTemplate,
    title: string,
    resumeData: Record<string, unknown>,
    editCount: number,
    downloadCount: number,
    createdAt: string,
    updatedAt: string
  ): GeneratedResume {
    return {
      id,
      templateId: template.id,
      templateName: template.name,
      templateHtmlContent: template.htmlTemplateContent,
      title,
      resumeDataJson: JSON.stringify(resumeData),
      generatedHtml: this.renderHtml(title, resumeData, template.htmlTemplateContent),
      generatedPdfUrl: null,
      editCount,
      downloadCount,
      planType: 'GUEST',
      premiumTemplate: template.premium,
      canEdit: true,
      watermarkEnabled: false,
      createdAt,
      updatedAt
    };
  }

  buildPreviewHtml(template: ResumeTemplate, title: string, resumeData: Record<string, unknown>): string {
    return this.renderHtml(title, resumeData, template.htmlTemplateContent);
  }

  private renderHtml(title: string, resumeData: Record<string, unknown>, templateHtmlContent?: string): string {
    const fullName = this.stringValue(resumeData['fullName'], 'Candidate Name');
    const headline = this.stringValue(resumeData['headline'], 'ATS-friendly resume for recruiter screening');
    const email = this.stringValue(resumeData['email']);
    const phone = this.stringValue(resumeData['phone']);
    const links = this.stringValue(resumeData['links']);
    const fontFamily = this.stringValue(resumeData['designFont'], 'Arial, sans-serif');
    const accentColor = this.stringValue(resumeData['designAccent'], '#59707c');
    const textColor = this.stringValue(resumeData['designText'], '#111827');
    const pageFormat = this.stringValue(resumeData['pageFormat'], 'A4');
    const pageWidth = pageFormat === 'Letter' ? '816px' : '794px';

    if (templateHtmlContent && templateHtmlContent.trim().length > 0) {
      const filled = templateHtmlContent
        .replace(/{{fullName}}/g, this.escape(fullName))
        .replace(/{{headline}}/g, this.escape(headline))
        .replace(/{{email}}/g, this.escape(email))
        .replace(/{{phone}}/g, this.escape(phone))
        .replace(/{{links}}/g, this.escape(links))
        .replace(/{{educationSection}}/g, this.section('Education', this.listValues(resumeData['education'])))
        .replace(/{{skillsSection}}/g, this.section('Skills', this.listValues(resumeData['skills'])))
        .replace(/{{projectsSection}}/g, this.section('Projects', this.listValues(resumeData['projects'])))
        .replace(/{{experienceSection}}/g, this.section('Experience / Internship', this.listValues(resumeData['experience'])))
        .replace(/{{certificationsSection}}/g, this.section('Certifications', this.listValues(resumeData['certifications'])))
        .replace(/{{achievementsSection}}/g, this.section('Achievements', this.listValues(resumeData['achievements'])))
        .replace(/{{languagesSection}}/g, this.section('Languages', this.listValues(resumeData['languages'])))
        .replace(/{{title}}/g, this.escape(title))
        .replace(/{{watermark}}/g, '');
      return `
        <html>
          <head>
            <style>
              body { margin: 0; background: #f3f4f6; font-family: ${fontFamily}; color: ${textColor}; }
              h1,h2,h3,h4,strong { color: ${textColor}; }
              .resume-accent, .resume-accent * { color: ${accentColor}; border-color: ${accentColor}; }
            </style>
          </head>
          <body>
            <div style="max-width:${pageWidth};margin:0 auto;">${filled}</div>
          </body>
        </html>
      `;
    }

    return `
      <html>
        <body style="margin:0;background:#f3f4f6;font-family:${fontFamily};color:${textColor}">
          <div style="max-width:${pageWidth};margin:24px auto;background:#ffffff;padding:40px;border:1px solid #e5e7eb">
            <div style="border-bottom:2px solid ${accentColor};padding-bottom:16px;margin-bottom:24px">
              <h1 style="margin:0;font-size:34px">${this.escape(fullName)}</h1>
              <p style="margin:8px 0 0 0;font-size:16px;color:#374151">${this.escape(headline)}</p>
              <p style="margin:12px 0 0 0;font-size:13px;color:#6b7280">${this.escape(email)} | ${this.escape(phone)} | ${this.escape(links)}</p>
            </div>
            ${this.section('Education', this.listValues(resumeData['education']))}
            ${this.section('Skills', this.listValues(resumeData['skills']))}
            ${this.section('Projects', this.listValues(resumeData['projects']))}
            ${this.section('Experience / Internship', this.listValues(resumeData['experience']))}
            ${this.section('Certifications', this.listValues(resumeData['certifications']))}
            ${this.section('Achievements', this.listValues(resumeData['achievements']))}
            ${this.section('Languages', this.listValues(resumeData['languages']))}
            <div style="margin-top:24px;color:#6b7280;font-size:12px">Draft title: ${this.escape(title)}</div>
          </div>
        </body>
      </html>
    `;
  }

  private section(title: string, items: string[]): string {
    if (items.length === 0) {
      return '';
    }
    const rows = items.map((item) => `<li style="margin:0 0 8px 0">${this.escape(item)}</li>`).join('');
    return `
      <section style="margin-top:20px">
        <h2 style="margin:0 0 10px 0;font-size:16px;text-transform:uppercase;letter-spacing:0.08em">${this.escape(title)}</h2>
        <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7">${rows}</ul>
      </section>
    `;
  }

  private listValues(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => {
        if (item && typeof item === 'object' && 'value' in item) {
          return String((item as { value?: unknown }).value ?? '');
        }
        return String(item ?? '');
      })
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private stringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
  }

  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private template(
    id: number,
    name: string,
    category: string,
    roleType: string,
    experienceLevel: string,
    layoutType: string,
    styleType: string,
    premium: boolean,
    atsFriendly: boolean,
    previewImageUrl: string,
    templateKey: string,
    cssTemplatePath: string,
    supportedSectionsJson: string,
    tagsJson: string
  ): ResumeTemplate {
    return {
      id,
      name,
      category,
      roleType,
      experienceLevel,
      layoutType,
      styleType,
      atsFriendly,
      tagsJson,
      previewImageUrl,
      templateKey,
      htmlTemplatePath: `local/${templateKey}`,
      cssTemplatePath,
      supportedSectionsJson,
      premium,
      htmlTemplateContent: undefined
    };
  }
}
