import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job, JobMatch } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {
  }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`);
  }

  getJobMatches(resumeId: number): Observable<JobMatch[]> {
    return this.http.get<JobMatch[]>(`${this.apiUrl}/resumes/${resumeId}/matches`);
  }
}
