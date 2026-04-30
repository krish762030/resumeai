import { Injectable } from '@angular/core';
import { GeneratedResume, ResumeTemplate } from '../models/resume.model';
import { ResumeDocument, ResumeDocumentSection } from '../models/resume-document.model';
import {
  normalizeResumeDocument,
  sortedVisibleSections,
  templateKeyFromTemplate
} from '../models/resume-document.utils';

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

  createResume(template: ResumeTemplate, title: string, resumeData: ResumeDocument | Record<string, unknown>): GeneratedResume {
    const now = new Date().toISOString();
    const created = this.toGeneratedResume(Date.now(), template, title, resumeData, 0, 0, now, now);
    const resumes = this.getStoredResumes();
    resumes.unshift(created);
    this.persist(resumes);
    return created;
  }

  updateResume(resumeId: number, template: ResumeTemplate, title: string, resumeData: ResumeDocument | Record<string, unknown>): GeneratedResume {
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
    resumeData: ResumeDocument | Record<string, unknown>,
    editCount: number,
    downloadCount: number,
    createdAt: string,
    updatedAt: string
  ): GeneratedResume {
    const document = this.toResumeDocument(template, title, resumeData);
    return {
      id,
      templateId: template.id,
      templateName: template.name,
      templateHtmlContent: template.htmlTemplateContent,
      title,
      resumeDataJson: JSON.stringify(document),
      generatedHtml: this.renderDocumentHtml(document),
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

  buildPreviewHtml(template: ResumeTemplate, title: string, resumeData: ResumeDocument | Record<string, unknown>): string {
    return this.renderDocumentHtml(this.toResumeDocument(template, title, resumeData));
  }

  private toResumeDocument(
    template: ResumeTemplate,
    title: string,
    resumeData: ResumeDocument | Record<string, unknown>
  ): ResumeDocument {
    const document = normalizeResumeDocument(resumeData, title, templateKeyFromTemplate(template));
    return {
      ...document,
      title: title || document.title,
      updatedAt: new Date().toISOString()
    };
  }

  private renderDocumentHtml(document: ResumeDocument): string {
    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${this.escape(document.title)}</title>
          <style>${this.documentCss(document)}</style>
        </head>
        <body>
          <div class="resume-stage">
            ${this.renderTemplate(document)}
          </div>
        </body>
      </html>
    `;
  }

  private documentCss(document: ResumeDocument): string {
    const width = document.theme.pageSize === 'Letter' ? '216mm' : '210mm';
    const minHeight = document.theme.pageSize === 'Letter' ? '279mm' : '297mm';
    const pageSize = document.theme.pageSize;

    return `
      @page { size: ${pageSize}; margin: 0; }
      :root {
        --resume-font: ${this.cssValue(document.theme.fontFamily)};
        --resume-primary: ${this.cssValue(document.theme.primaryColor)};
        --resume-secondary: ${this.cssValue(document.theme.secondaryColor)};
        --resume-text: ${this.cssValue(document.theme.textColor)};
        --resume-section-gap: ${document.theme.sectionSpacing}px;
        --resume-page-width: ${width};
        --resume-page-min-height: ${minHeight};
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: #f3f4f6; color: var(--resume-text); font-family: var(--resume-font), "Segoe UI", Arial, sans-serif; }
      .resume-stage { display: flex; justify-content: center; padding: 24px; min-width: min-content; }
      .resume-page { width: var(--resume-page-width); min-height: var(--resume-page-min-height); background: #fff; box-shadow: 0 24px 60px rgba(15,23,42,.16); overflow: hidden; }
      .resume-page h1,.resume-page h2,.resume-page h3,.resume-page p { margin: 0; }
      .resume-hero { display: grid; grid-template-columns: 1fr 230px; gap: 28px; padding: 34px 38px; background: var(--resume-primary); color: #fff; }
      .resume-hero h1,.resume-classic-header h1,.resume-minimal-header h1 { font-size: 34px; font-weight: 800; line-height: 1.08; letter-spacing: 0; }
      .resume-summary { line-height: 1.58; color: #374151; }
      .resume-hero .resume-summary { margin-top: 12px; color: rgba(255,255,255,.88); }
      .resume-headline { margin-top: 7px; color: var(--resume-secondary); font-size: 13px; font-weight: 800; line-height: 1.35; }
      .resume-hero .resume-headline { color: rgba(255,255,255,.94); }
      .resume-contact { display: grid; gap: 8px; align-content: start; font-size: 12px; line-height: 1.45; }
      .resume-modern-grid { display: grid; grid-template-columns: 1fr 238px; gap: 28px; padding: 30px 38px 38px; }
      .resume-modern-grid main,.resume-modern-grid aside,.resume-template-classic,.resume-template-minimal { display: grid; align-content: start; gap: var(--resume-section-gap); }
      .resume-modern-grid aside { border-left: 1px solid #e5e7eb; padding-left: 22px; }
      .resume-template-classic { padding: 38px 44px; }
      .resume-classic-header { display: grid; gap: 10px; border-bottom: 2px solid var(--resume-primary); padding-bottom: 18px; }
      .resume-template-minimal { padding: 34px 40px; }
      .resume-minimal-header { display: grid; grid-template-columns: 1fr 190px; gap: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 16px; }
      .resume-contact-line { display: flex; flex-wrap: wrap; gap: 7px 12px; color: #4b5563; font-size: 12px; line-height: 1.4; }
      .resume-contact-line span:not(:last-child)::after { content: "/"; margin-left: 12px; color: #9ca3af; }
      .resume-document-section { break-inside: avoid; }
      .resume-section-title { color: var(--resume-primary); font-size: 13px; font-weight: 800; letter-spacing: .08em; line-height: 1.3; margin-bottom: 10px; padding-bottom: 7px; text-transform: uppercase; border-bottom: 1px solid #d1d5db; }
      .resume-template-minimal .resume-section-title { border-bottom: 0; color: var(--resume-secondary); padding-bottom: 0; }
      .resume-section-body { font-size: 12px; line-height: 1.55; }
      .resume-list { display: grid; gap: 13px; }
      .resume-entry { break-inside: avoid; }
      .resume-entry-heading { display: grid; gap: 3px; }
      .resume-entry-heading strong { color: #111827; font-size: 13px; font-weight: 800; }
      .resume-entry-heading span { color: var(--resume-secondary); font-size: 12px; font-weight: 700; }
      .resume-entry-meta { display: flex; flex-wrap: wrap; gap: 5px 10px; margin-top: 4px; color: #6b7280; font-size: 11px; }
      .resume-entry-summary { margin-top: 6px; color: #374151; }
      .resume-entry ul { margin: 7px 0 0 16px; padding: 0; color: #374151; }
      .resume-entry li + li { margin-top: 4px; }
      .resume-skills { display: flex; flex-wrap: wrap; gap: 8px; }
      .resume-skill { display: inline-flex; align-items: center; gap: 7px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 8px; background: #f9fafb; }
      .resume-skill small { color: var(--resume-secondary); font-size: 10px; font-weight: 800; text-transform: uppercase; }
      .resume-tech-list { margin-top: 6px; color: var(--resume-secondary); font-size: 11px; font-weight: 700; }
      @media print { body { background: #fff; } .resume-stage { padding: 0; } .resume-page { box-shadow: none; } }
    `;
  }

  private renderTemplate(document: ResumeDocument): string {
    if (document.templateKey === 'classic') {
      return `
        <article class="resume-page resume-template-classic">
          <header class="resume-classic-header">
            <h1>${this.escape(document.personal.fullName)}</h1>
            <p class="resume-headline">${this.escape(document.personal.headline ?? '')}</p>
            ${this.contactLine([document.personal.email, document.personal.phone, document.personal.links])}
            <p class="resume-summary">${this.escape(document.personal.summary)}</p>
          </header>
          ${sortedVisibleSections(document).map((section) => this.renderSection(section)).join('')}
        </article>
      `;
    }

    if (document.templateKey === 'minimal') {
      return `
        <article class="resume-page resume-template-minimal">
          <header class="resume-minimal-header">
            <div>
              <h1>${this.escape(document.personal.fullName)}</h1>
              <p class="resume-headline">${this.escape(document.personal.headline ?? '')}</p>
              <p class="resume-summary">${this.escape(document.personal.summary)}</p>
            </div>
            ${this.contactLine([document.personal.email, document.personal.phone])}
          </header>
          ${sortedVisibleSections(document).map((section) => this.renderSection(section)).join('')}
        </article>
      `;
    }

    const mainSections = sortedVisibleSections(document)
      .filter((section) => section.type !== 'skills' && section.type !== 'education')
      .map((section) => this.renderSection(section))
      .join('');
    const sidebarSections = sortedVisibleSections(document)
      .filter((section) => section.type === 'skills' || section.type === 'education')
      .map((section) => this.renderSection(section))
      .join('');

    return `
      <article class="resume-page resume-template-modern">
        <header class="resume-hero">
          <div>
            <h1>${this.escape(document.personal.fullName)}</h1>
            <p class="resume-headline">${this.escape(document.personal.headline ?? '')}</p>
            <p class="resume-summary">${this.escape(document.personal.summary)}</p>
          </div>
          <div class="resume-contact">
            ${[document.personal.email, document.personal.phone, document.personal.location, document.personal.links]
              .filter((item): item is string => !!item)
              .map((item) => `<span>${this.escape(item)}</span>`)
              .join('')}
          </div>
        </header>
        <div class="resume-modern-grid">
          <main>${mainSections}</main>
          <aside>${sidebarSections}</aside>
        </div>
      </article>
    `;
  }

  private renderSection(section: ResumeDocumentSection): string {
    const body = this.renderSectionBody(section);
    if (!body.trim()) {
      return '';
    }
    return `
      <section class="resume-document-section">
        <h2 class="resume-section-title">${this.escape(section.title)}</h2>
        ${body}
      </section>
    `;
  }

  private renderSectionBody(section: ResumeDocumentSection): string {
    if (section.type === 'experience') {
      return `
        <div class="resume-section-body resume-list">
          ${section.items.map((item) => `
            <article class="resume-entry">
              <div class="resume-entry-heading">
                <strong>${this.escape(item.position)}</strong>
                <span>${this.escape(item.company)}</span>
              </div>
              <div class="resume-entry-meta">
                ${this.compactSpans([item.location, this.dateRange(item.startDate, item.endDate)])}
              </div>
              ${item.summary ? `<p class="resume-entry-summary">${this.escape(item.summary)}</p>` : ''}
              ${item.highlights.length ? `<ul>${item.highlights.map((highlight) => `<li>${this.escape(highlight)}</li>`).join('')}</ul>` : ''}
            </article>
          `).join('')}
        </div>
      `;
    }

    if (section.type === 'education') {
      return `
        <div class="resume-section-body resume-list">
          ${section.items.map((item) => `
            <article class="resume-entry">
              <div class="resume-entry-heading">
                <strong>${this.escape(item.degree)}</strong>
                <span>${this.escape(item.institution)}</span>
              </div>
              <div class="resume-entry-meta">
                ${this.compactSpans([item.field, item.endDate, item.score])}
              </div>
            </article>
          `).join('')}
        </div>
      `;
    }

    if (section.type === 'skills') {
      return `
        <div class="resume-section-body resume-skills">
          ${section.items.map((item) => `
            <div class="resume-skill">
              <span>${this.escape(item.name)}</span>
              <small>${this.escape(item.level)}</small>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (section.type === 'projects') {
      return `
        <div class="resume-section-body resume-list">
          ${section.items.map((item) => `
            <article class="resume-entry">
              <div class="resume-entry-heading">
                <strong>${this.escape(item.name)}</strong>
                ${item.role ? `<span>${this.escape(item.role)}</span>` : ''}
              </div>
              <p class="resume-entry-summary">${this.escape(item.description)}</p>
              ${item.technologies.length ? `<p class="resume-tech-list">${this.escape(item.technologies.join(', '))}</p>` : ''}
            </article>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="resume-section-body resume-list">
        ${section.items.map((item) => `
          <article class="resume-entry">
            <div class="resume-entry-heading">
              <strong>${this.escape(item.title)}</strong>
              ${item.subtitle ? `<span>${this.escape(item.subtitle)}</span>` : ''}
            </div>
            ${item.description ? `<p class="resume-entry-summary">${this.escape(item.description)}</p>` : ''}
          </article>
        `).join('')}
      </div>
    `;
  }

  private contactLine(values: Array<string | undefined>): string {
    return `<p class="resume-contact-line">${this.compactSpans(values)}</p>`;
  }

  private compactSpans(values: Array<string | undefined>): string {
    return values
      .filter((value): value is string => !!value && value.trim().length > 0)
      .map((value) => `<span>${this.escape(value)}</span>`)
      .join('');
  }

  private dateRange(startDate: string | undefined, endDate: string | undefined): string {
    return [startDate, endDate]
      .filter((value): value is string => !!value && value.trim().length > 0)
      .join(' - ');
  }

  private cssValue(value: string): string {
    return value.replace(/[;{}<>]/g, '');
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
