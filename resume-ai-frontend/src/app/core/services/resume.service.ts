import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumeAnalysis } from '../models/analysis.model';
import {
  GeneratedResume,
  ResumeEditorResume,
  ResumeResponse,
  ResumeSection,
  ResumeSectionTemplate,
  ResumeTemplate,
  UsageLimit
} from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly apiUrl = environment.apiBaseUrl;
  private readonly editorBaseUrl = `${environment.apiBaseUrl}/resume-builder/editor/resumes`;
  private readonly assetBaseUrl = environment.apiBaseUrl.replace(/\/api$/, '');

  constructor(private readonly http: HttpClient) {
  }

  getResumes(): Observable<ResumeResponse[]> {
    return this.http.get<ResumeResponse[]>(`${this.apiUrl}/resumes`);
  }

  getResume(resumeId: number): Observable<ResumeResponse> {
    return this.http.get<ResumeResponse>(`${this.apiUrl}/resumes/${resumeId}`);
  }

  uploadResume(file: File): Observable<ResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ResumeResponse>(`${this.apiUrl}/resumes/upload`, formData);
  }

  uploadResumeWithProgress(file: File): Observable<HttpEvent<ResumeResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ResumeResponse>(`${this.apiUrl}/resumes/upload`, formData, {
      observe: 'events',
      reportProgress: true
    });
  }

  getResumeAnalysis(resumeId: number): Observable<ResumeAnalysis> {
    return this.http.get<ResumeAnalysis>(`${this.apiUrl}/resumes/${resumeId}/analysis`);
  }

  getTemplates(): Observable<ResumeTemplate[]> {
    return this.getTemplatesFiltered({}).pipe(
      map((templates) => templates.map((template) => this.mapTemplate(template)))
    );
  }

  getTemplatesFiltered(filters: {
    search?: string;
    roleType?: string;
    experience?: string;
    layout?: string;
    style?: string;
    isAtsFriendly?: boolean;
    isPremium?: boolean;
    category?: string;
  }): Observable<ResumeTemplate[]> {
    const params = new URLSearchParams();
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.roleType) {
      params.set('roleType', filters.roleType);
    }
    if (filters.experience) {
      params.set('experience', filters.experience);
    }
    if (filters.layout) {
      params.set('layout', filters.layout);
    }
    if (filters.style) {
      params.set('style', filters.style);
    }
    if (filters.isAtsFriendly !== undefined) {
      params.set('isAtsFriendly', String(filters.isAtsFriendly));
    }
    if (filters.isPremium !== undefined) {
      params.set('isPremium', String(filters.isPremium));
    }
    if (filters.category) {
      params.set('category', filters.category);
    }

    const query = params.toString();
    return this.http.get<ResumeTemplate[]>(`${this.apiUrl}/templates${query ? `?${query}` : ''}`).pipe(
      map((templates) => templates.map((template) => this.mapTemplate(template)))
    );
  }

  getTemplateDetail(templateId: number): Observable<ResumeTemplate> {
    return this.http.get<ResumeTemplate>(`${this.apiUrl}/templates/${templateId}`).pipe(
      map((template) => this.mapTemplate(template))
    );
  }

  uploadAdminTemplate(payload: {
    name: string;
    category: string;
    atsFriendly: boolean;
    premium: boolean;
    previewImage: File;
    htmlTemplateFile: File | null;
  }): Observable<ResumeTemplate> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('category', payload.category);
    formData.append('atsFriendly', String(payload.atsFriendly));
    formData.append('premium', String(payload.premium));
    formData.append('previewImage', payload.previewImage);
    if (payload.htmlTemplateFile) {
      formData.append('htmlTemplateFile', payload.htmlTemplateFile);
    }
    return this.http.post<ResumeTemplate>(`${this.apiUrl}/templates/admin/upload`, formData).pipe(
      map((template) => this.mapTemplate(template))
    );
  }

  getGeneratedResumes(): Observable<GeneratedResume[]> {
    return this.http.get<GeneratedResume[]>(`${this.apiUrl}/resume-builder/resumes`);
  }

  getGeneratedResume(resumeId: number): Observable<GeneratedResume> {
    return this.http.get<GeneratedResume>(`${this.apiUrl}/resume-builder/resumes/${resumeId}`);
  }

  createGeneratedResume(payload: { templateId: number; title: string; resumeDataJson: string; }): Observable<GeneratedResume> {
    return this.http.post<GeneratedResume>(`${this.apiUrl}/resume-builder/resumes`, payload);
  }

  updateGeneratedResume(resumeId: number, payload: { templateId: number; title: string; resumeDataJson: string; }): Observable<GeneratedResume> {
    return this.http.put<GeneratedResume>(`${this.apiUrl}/resume-builder/resumes/${resumeId}`, payload);
  }

  getUsageLimit(): Observable<UsageLimit> {
    return this.http.get<UsageLimit>(`${this.apiUrl}/usage-limit/me`);
  }

  getEditorResumes(): Observable<ResumeEditorResume[]> {
    return this.http.get<ResumeEditorResume[]>(this.editorBaseUrl);
  }

  createEditorResume(payload: { templateId: number; title: string; }): Observable<ResumeEditorResume> {
    return this.http.post<ResumeEditorResume>(this.editorBaseUrl, payload);
  }

  getEditorResume(resumeId: number): Observable<ResumeEditorResume> {
    return this.http.get<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}`);
  }

  updateEditorResume(resumeId: number, payload: { templateId: number; title: string; }): Observable<ResumeEditorResume> {
    return this.http.put<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}`, payload);
  }

  switchEditorTemplate(resumeId: number, templateId: number): Observable<ResumeEditorResume> {
    return this.http.put<ResumeEditorResume>(`${this.apiUrl}/resumes/${resumeId}/template`, { templateId });
  }

  deleteEditorResume(resumeId: number): Observable<void> {
    return this.http.delete<void>(`${this.editorBaseUrl}/${resumeId}`);
  }

  duplicateEditorResume(resumeId: number): Observable<ResumeEditorResume> {
    return this.http.post<ResumeEditorResume>(`${this.apiUrl}/resumes/${resumeId}/duplicate`, {});
  }


  importEditorResume(file: File, templateId?: number): Observable<{ resumeId: number }> {
    const formData = new FormData();
    formData.append('file', file);
    if (templateId) {
      formData.append('templateId', String(templateId));
    }
    return this.http.post<{ resumeId: number }>(`${this.apiUrl}/resumes/import`, formData);
  }

  addEditorSection(resumeId: number, payload: { sectionType: string; sectionTitle: string; isVisible: boolean; contentJson: string; }): Observable<ResumeEditorResume> {
    return this.http.post<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/sections`, payload);
  }

  updateEditorSection(resumeId: number, sectionId: number, payload: { sectionType: string; sectionTitle: string; isVisible: boolean; contentJson: string; }): Observable<ResumeEditorResume> {
    return this.http.put<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/sections/${sectionId}`, payload);
  }

  deleteEditorSection(resumeId: number, sectionId: number): Observable<ResumeEditorResume> {
    return this.http.delete<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/sections/${sectionId}`);
  }

  reorderEditorSections(resumeId: number, items: Array<{ sectionId: number; sectionOrder: number }>): Observable<ResumeEditorResume> {
    return this.http.patch<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/sections/reorder`, { items });
  }

  updateEditorSectionVisibility(resumeId: number, sectionId: number, isVisible: boolean): Observable<ResumeEditorResume> {
    return this.http.patch<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/sections/${sectionId}/visibility`, { isVisible });
  }

  getEditorTheme(resumeId: number): Observable<{ themeJson: string }> {
    return this.http.get<{ themeJson: string }>(`${this.editorBaseUrl}/${resumeId}/theme`);
  }

  updateEditorTheme(resumeId: number, themeJson: string): Observable<ResumeEditorResume> {
    return this.http.put<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/theme`, { themeJson });
  }

  previewEditorResume(resumeId: number): Observable<ResumeEditorResume> {
    return this.http.post<ResumeEditorResume>(`${this.editorBaseUrl}/${resumeId}/preview`, {});
  }

  getSectionTemplates(): Observable<ResumeSectionTemplate[]> {
    return this.http.get<ResumeSectionTemplate[]>(`${this.apiUrl}/section-templates`);
  }

  parseSectionContent(section: ResumeSection): Record<string, unknown> {
    try {
      return JSON.parse(section.contentJson) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private mapTemplate(template: ResumeTemplate): ResumeTemplate {
    return {
      ...template,
      previewImageUrl: template.previewImageUrl?.startsWith('/')
        ? `${this.assetBaseUrl}${template.previewImageUrl}`
        : template.previewImageUrl
    };
  }
}
