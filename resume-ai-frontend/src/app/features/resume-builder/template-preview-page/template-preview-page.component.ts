import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  template: ResumeTemplate | null = null;
  usageLimit: UsageLimit | null = null;
  favoriteIds = new Set<number>();

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

  onUseTemplate(): void {
    if (!this.template) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/resume-builder/create/${this.template.id}` }
      });
      return;
    }

    if (this.template.premium && !this.usageLimit?.premium) {
      void this.router.navigate(['/pricing'], {
        queryParams: { templateId: this.template.id, source: 'preview' }
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
