import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResumeDocument } from '../../core/models/resume-document.model';
import { createTemplatePreviewDocument } from '../../core/models/resume-document.utils';
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
  readonly dashboardTemplateNames = ['ATS Internship', 'Fresher Software Developer', 'Professional One Page'];
  readonly landingNavItems = [
    { label: 'Resume Templates', route: ['/templates'] },
    { label: 'Pricing', route: ['/pricing'] },
    { label: 'About', route: ['/'], fragment: 'about' }
  ];
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
  private readonly previewDocumentCache = new Map<number, ResumeDocument | null>();
  constructor(
    private readonly authService: AuthService,
    private readonly resumeService: ResumeService,
    private readonly jobService: JobService,
    private readonly resumeBuilderLocalService: ResumeBuilderLocalService,
    private readonly router: Router
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

  get recommendedTemplates(): ResumeTemplate[] {
    return this.dashboardTemplateNames
      .map((name) => this.publicTemplates.find((template) => template.name === name))
      .filter((template): template is ResumeTemplate => !!template);
  }

  get isPremiumUser(): boolean {
    return !!this.usageLimit?.premium;
  }

  get recentGeneratedResumes(): GeneratedResume[] {
    return this.generatedResumes.slice(0, 3);
  }

  get latestGeneratedResume(): GeneratedResume | null {
    return this.generatedResumes[0] ?? null;
  }

  get latestAnalysisRoute(): string[] {
    if (this.latestResume) {
      return ['/resume', String(this.latestResume.id), 'analysis'];
    }
    return ['/resume', 'upload'];
  }

  get dashboardScore(): number {
    return this.latestAnalysis?.atsScore ?? 0;
  }

  get scoreStatus(): string {
    return this.dashboardScore >= 75 ? 'Good' : 'Needs improvement';
  }

  get completionChecklist(): Array<{ label: string; done: boolean }> {
    const payload = this.latestGeneratedResume?.resumeDataJson?.toLowerCase() ?? '';
    return [
      { label: 'Summary added', done: payload.includes('summary') || payload.includes('headline') },
      { label: 'Experience added', done: payload.includes('experience') },
      { label: 'Skills added', done: payload.includes('skills') },
      { label: 'Education added', done: payload.includes('education') },
      { label: 'Projects added', done: payload.includes('projects') },
      { label: 'Certifications added', done: payload.includes('certifications') }
    ];
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }

  templateUseRoute(template: ResumeTemplate): string[] {
    if (template.premium && !this.isPremiumUser) {
      return ['/pricing'];
    }
    return ['/resume-builder/create', String(template.id)];
  }

  previewDocument(template: ResumeTemplate): ResumeDocument | null {
    if (!this.previewDocumentCache.has(template.id)) {
      this.previewDocumentCache.set(template.id, createTemplatePreviewDocument(template));
    }
    return this.previewDocumentCache.get(template.id) ?? null;
  }

  editorRoute(resumeId: number): string[] {
    return ['/resume-editor', String(resumeId), 'content'];
  }

  changeTemplateRoute(resumeId: number): string[] {
    return ['/resume-editor', String(resumeId), 'change-template'];
  }

  private loadDashboard(): void {
    this.loading = true;
    this.authService.getProfile().pipe(
      switchMap((user) => {
        this.user = user;
        return forkJoin({
          resumes: this.resumeService.getResumes(),
          generatedResumes: this.resumeService.getGeneratedResumes().pipe(catchError(() => of([]))),
          usageLimit: this.resumeService.getUsageLimit().pipe(catchError(() => of(null))),
          templates: this.resumeService.getTemplates().pipe(catchError(() => of([])))
        });
      }),
      switchMap(({ resumes, generatedResumes, usageLimit, templates }) => {
        this.resumes = resumes;
        this.generatedResumes = generatedResumes;
        this.usageLimit = usageLimit;
        this.publicTemplates = templates;
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
