import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumeAnalysis } from '../models/analysis.model';
import { GeneratedResume, ResumeResponse, ResumeTemplate, UsageLimit } from '../models/resume.model';

@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {
  }

  private readonly assetBaseUrl = environment.apiBaseUrl.replace(/\/api$/, '');

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
    return this.http.get<ResumeTemplate[]>(`${this.apiUrl}/templates`).pipe(
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

  private mapTemplate(template: ResumeTemplate): ResumeTemplate {
    return {
      ...template,
      previewImageUrl: template.previewImageUrl?.startsWith('/')
        ? `${this.assetBaseUrl}${template.previewImageUrl}`
        : template.previewImageUrl
    };
  }
}
