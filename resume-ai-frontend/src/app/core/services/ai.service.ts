import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumeAnalysis } from '../models/analysis.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {
  }

  analyzeResume(resumeId: number): Observable<ResumeAnalysis> {
    return this.http.post<ResumeAnalysis>(`${this.apiUrl}/resumes/${resumeId}/analyze`, {});
  }

  improveResume(resumeId: number): Observable<ResumeAnalysis> {
    return this.http.post<ResumeAnalysis>(`${this.apiUrl}/resumes/${resumeId}/improve`, {});
  }
}
