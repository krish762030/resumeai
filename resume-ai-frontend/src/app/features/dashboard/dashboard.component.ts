import { Component, OnInit } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResumeAnalysis } from '../../core/models/analysis.model';
import { JobMatch } from '../../core/models/job.model';
import { GeneratedResume, ResumeResponse, ResumeTemplate, UsageLimit } from '../../core/models/resume.model';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { ResumeBuilderLocalService } from '../../core/services/resume-builder-local.service';
import { ResumeService } from '../../core/services/resume.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  loading = true;
  guestMode = false;
  user: User | null = null;
  resumes: ResumeResponse[] = [];
  generatedResumes: GeneratedResume[] = [];
  publicTemplates: ResumeTemplate[] = [];
  latestResume: ResumeResponse | null = null;
  latestAnalysis: ResumeAnalysis | null = null;
  latestMatches: JobMatch[] = [];
  usageLimit: UsageLimit | null = null;
  readonly landingNavItems = ['Resume Templates', 'Pricing', 'About'];

  constructor(
    private readonly authService: AuthService,
    private readonly resumeService: ResumeService,
    private readonly jobService: JobService,
    private readonly resumeBuilderLocalService: ResumeBuilderLocalService
  ) {
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.guestMode = true;
      this.generatedResumes = this.resumeBuilderLocalService.getResumes();
      this.resumeService.getTemplates().subscribe({
        next: (templates) => {
          this.publicTemplates = templates;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
      return;
    }
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.authService.getProfile().pipe(
      switchMap((user) => {
        this.user = user;
        return forkJoin({
          resumes: this.resumeService.getResumes(),
          generatedResumes: this.resumeService.getGeneratedResumes().pipe(catchError(() => of([]))),
          usageLimit: this.resumeService.getUsageLimit().pipe(catchError(() => of(null)))
        });
      }),
      switchMap(({ resumes, generatedResumes, usageLimit }) => {
        this.resumes = resumes;
        this.generatedResumes = generatedResumes;
        this.usageLimit = usageLimit;
        this.latestResume = resumes[0] ?? null;

        if (!this.latestResume) {
          return of({ analysis: null, matches: [] as JobMatch[] });
        }

        return forkJoin({
          analysis: this.resumeService.getResumeAnalysis(this.latestResume.id).pipe(
            catchError(() => of(null))
          ),
          matches: this.jobService.getJobMatches(this.latestResume.id).pipe(
            catchError(() => of([]))
          )
        });
      })
    ).subscribe({
      next: ({ analysis, matches }) => {
        this.latestAnalysis = analysis;
        this.latestMatches = matches;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
