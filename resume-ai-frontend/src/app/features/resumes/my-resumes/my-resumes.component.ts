import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResumeEditorResume, ResumeTemplate, UsageLimit } from '../../../core/models/resume.model';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-my-resumes',
  templateUrl: './my-resumes.component.html'
})
export class MyResumesComponent implements OnInit {
  @ViewChild('importFileInput') importFileInput?: ElementRef<HTMLInputElement>;

  loading = true;
  error = '';
  showUpgradeModal = false;
  showStartModal = false;
  importing = false;
  activeMenuResumeId: number | null = null;

  resumes: ResumeEditorResume[] = [];
  usageLimit: UsageLimit | null = null;
  templateMap = new Map<number, ResumeTemplate>();

  constructor(
    private readonly resumeService: ResumeService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.reload();
  }

  get isFreePlan(): boolean {
    return !this.usageLimit?.premium;
  }

  onCreateResume(): void {
    if (this.isFreePlan && this.resumes.length >= 1) {
      this.showUpgradeModal = true;
      return;
    }
    this.showStartModal = true;
  }

  startFromTemplate(): void {
    this.showStartModal = false;
    void this.router.navigate(['/templates']);
  }

  importResumeClick(): void {
    this.importFileInput?.nativeElement.click();
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.importing = true;
    this.error = '';
    this.resumeService.importEditorResume(file).subscribe({
      next: (response) => {
        this.showStartModal = false;
        this.importing = false;
        input.value = '';
        void this.router.navigate(['/resume-editor', response.resumeId, 'content']);
      },
      error: (error) => {
        this.importing = false;
        this.error = error?.error?.message ?? 'Unable to import resume.';
        input.value = '';
      }
    });
  }

  onDuplicate(resume: ResumeEditorResume): void {
    if (this.isFreePlan && this.resumes.length >= 1) {
      this.showUpgradeModal = true;
      this.activeMenuResumeId = null;
      return;
    }

    this.resumeService.duplicateEditorResume(resume.id).subscribe({
      next: (copy) => {
        this.resumes = [copy, ...this.resumes];
        this.activeMenuResumeId = null;
      },
      error: (error) => {
        this.error = error?.error?.message ?? 'Unable to duplicate resume.';
      }
    });
  }

  onDelete(resume: ResumeEditorResume): void {
    if (!confirm(`Delete ${resume.title}?`)) {
      return;
    }
    this.resumeService.deleteEditorResume(resume.id).subscribe({
      next: () => {
        this.resumes = this.resumes.filter((item) => item.id !== resume.id);
        this.activeMenuResumeId = null;
      },
      error: () => this.error = 'Unable to delete resume.'
    });
  }

  onRename(resume: ResumeEditorResume): void {
    const title = prompt('Rename resume', resume.title)?.trim();
    if (!title || title === resume.title) {
      this.activeMenuResumeId = null;
      return;
    }
    this.resumeService.updateEditorResume(resume.id, { templateId: resume.templateId, title }).subscribe({
      next: (updated) => {
        this.resumes = this.resumes.map((item) => item.id === resume.id ? updated : item);
        this.activeMenuResumeId = null;
      },
      error: () => this.error = 'Unable to rename resume.'
    });
  }

  openResume(resumeId: number, tab: 'overview' | 'content' | 'customize' | 'ai' = 'content'): void {
    this.activeMenuResumeId = null;
    void this.router.navigate(['/resume-editor', resumeId, tab]);
  }

  goToPlans(): void {
    this.showUpgradeModal = false;
    void this.router.navigate(['/pricing']);
  }

  templateName(resume: ResumeEditorResume): string {
    return this.templateMap.get(resume.templateId)?.name || resume.templateName;
  }

  lastEdited(resume: ResumeEditorResume): string {
    return new Date(resume.updatedAt).toLocaleDateString();
  }

  private reload(): void {
    forkJoin({
      resumes: this.resumeService.getEditorResumes(),
      usageLimit: this.resumeService.getUsageLimit().pipe(catchError(() => of(null))),
      templates: this.resumeService.getTemplates().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ resumes, usageLimit, templates }) => {
        this.resumes = resumes;
        this.usageLimit = usageLimit;
        this.templateMap = new Map(templates.map((template) => [template.id, template]));
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load resumes right now.';
        this.loading = false;
      }
    });
  }
}
