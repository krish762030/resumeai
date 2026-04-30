import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResumeDocument } from '../../../core/models/resume-document.model';
import { createTemplatePreviewDocument } from '../../../core/models/resume-document.utils';
import { ResumeTemplate, UsageLimit } from '../../../core/models/resume.model';
import { AuthService } from '../../../core/services/auth.service';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-template-preview-page',
  templateUrl: './template-preview-page.component.html'
})
export class TemplatePreviewPageComponent implements OnInit {
  readonly favoriteStorageKey = 'resume_ai_template_favorites';
  loading = true;
  error = '';
  template: ResumeTemplate | null = null;
  usageLimit: UsageLimit | null = null;
  favoriteIds = new Set<number>();
  creating = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly resumeService: ResumeService,
    private readonly authService: AuthService
  ) {
  }

  ngOnInit(): void {
    const templateId = Number(this.route.snapshot.paramMap.get('templateId'));
    this.favoriteIds = this.readFavorites();

    if (this.authService.isAuthenticated()) {
      this.resumeService.getUsageLimit().pipe(catchError(() => of(null))).subscribe({
        next: (usageLimit) => {
          this.usageLimit = usageLimit;
        }
      });
    }

    this.resumeService.getTemplateDetail(templateId).subscribe({
      next: (template) => {
        this.template = template;
        this.loading = false;
      },
      error: () => {
        this.error = 'Template preview could not be loaded.';
        this.loading = false;
      }
    });
  }

  get isFavorite(): boolean {
    return !!this.template && this.favoriteIds.has(this.template.id);
  }

  get canUseTemplate(): boolean {
    if (!this.template) {
      return false;
    }
    return !this.template.premium || !!this.usageLimit?.premium;
  }

  get previewDocument(): ResumeDocument | null {
    return createTemplatePreviewDocument(this.template);
  }

  get supportedSections(): string[] {
    if (!this.template) {
      return [];
    }
    try {
      const parsed = JSON.parse(this.template.supportedSectionsJson);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }

  onUseTemplate(): void {
    if (!this.template) {
      return;
    }

    if (this.template.premium && !this.usageLimit?.premium) {
      void this.router.navigate(['/pricing'], {
        queryParams: { templateId: this.template.id, source: 'preview' }
      });
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.creating = true;
      this.resumeService.createEditorResume({
        templateId: this.template.id,
        title: 'Untitled Resume'
      }).subscribe({
        next: (resume) => {
          this.creating = false;
          void this.router.navigate(['/resume-editor', resume.id, 'content']);
        },
        error: () => {
          this.creating = false;
          this.error = 'Template could not be opened in the editor.';
        }
      });
      return;
    }

    void this.router.navigate(['/resume-builder/create', this.template.id]);
  }

  toggleFavorite(): void {
    if (!this.template) {
      return;
    }
    const next = new Set(this.favoriteIds);
    if (next.has(this.template.id)) {
      next.delete(this.template.id);
    } else {
      next.add(this.template.id);
    }
    this.favoriteIds = next;
    localStorage.setItem(this.favoriteStorageKey, JSON.stringify(Array.from(next)));
  }

  private readFavorites(): Set<number> {
    try {
      const raw = localStorage.getItem(this.favoriteStorageKey);
      const parsed = raw ? JSON.parse(raw) as number[] : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set<number>();
    }
  }
}
