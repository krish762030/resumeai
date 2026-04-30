import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ResumeTemplate, UsageLimit } from '../../../core/models/resume.model';
import { AuthService } from '../../../core/services/auth.service';
import { ResumeService } from '../../../core/services/resume.service';
import { TemplateFilterState } from '../template-filter-sidebar/template-filter-sidebar.component';

@Component({
  selector: 'app-template-dashboard',
  templateUrl: './template-dashboard.component.html'
})
export class TemplateDashboardComponent implements OnInit {
  readonly favoriteStorageKey = 'resume_ai_template_favorites';
  readonly categoryChips = ['All Templates', 'Simple', 'Modern', 'Creative', 'Developer', 'Fresher', 'Professional', 'Compact'];

  templates: ResumeTemplate[] = [];
  loading = true;
  search = '';
  sort = 'recommended';
  favoriteIds = new Set<number>();
  usageLimit: UsageLimit | null = null;
  showUpgradeModal = false;
  upgradeMessage = 'Your free plan includes only one resume. Upgrade to create another.';
  error = '';
  importing = false;
  creatingTemplateId: number | null = null;
  filters: TemplateFilterState = {
    roleType: '',
    experience: '',
    layout: '',
    style: '',
    category: '',
    isAtsFriendly: null,
    access: 'all'
  };

  constructor(
    private readonly resumeService: ResumeService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.favoriteIds = this.readFavorites();
    const usageLimit$ = this.authService.isAuthenticated()
      ? this.resumeService.getUsageLimit().pipe(catchError(() => of(null)))
      : of(null);

    forkJoin({
      templates: this.resumeService.getTemplates(),
      usageLimit: usageLimit$
    }).subscribe({
      next: ({ templates, usageLimit }) => {
        this.templates = templates;
        this.usageLimit = usageLimit;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredTemplates(): ResumeTemplate[] {
    const normalizedSearch = this.search.trim().toLowerCase();
    const filtered = this.templates.filter((template) => {
      const tags = this.parseJsonArray(template.tagsJson).join(' ').toLowerCase();
      const supports = this.parseJsonArray(template.supportedSectionsJson).join(' ').toLowerCase();
      const matchesSearch = !normalizedSearch || [
        template.name,
        template.category,
        template.roleType,
        template.experienceLevel,
        template.layoutType,
        template.styleType,
        tags,
        supports
      ].join(' ').toLowerCase().includes(normalizedSearch);

      const matchesCategory = !this.filters.category || template.category === this.filters.category;
      const matchesRole = !this.filters.roleType || template.roleType === this.filters.roleType;
      const matchesExperience = !this.filters.experience || template.experienceLevel === this.filters.experience;
      const matchesLayout = !this.filters.layout || template.layoutType === this.filters.layout;
      const matchesStyle = !this.filters.style || template.styleType === this.filters.style;
      const matchesAts = this.filters.isAtsFriendly === null || template.atsFriendly === this.filters.isAtsFriendly;
      const matchesAccess = this.filters.access === 'all'
        || (this.filters.access === 'free' && !template.premium)
        || (this.filters.access === 'premium' && template.premium);

      return matchesSearch
        && matchesCategory
        && matchesRole
        && matchesExperience
        && matchesLayout
        && matchesStyle
        && matchesAts
        && matchesAccess;
    });

    return this.sortTemplates(filtered);
  }

  onFiltersChange(filters: TemplateFilterState): void {
    this.filters = filters;
  }

  onSearchChange(search: string): void {
    this.search = search;
  }

  applyCategory(category: string): void {
    this.filters = {
      ...this.filters,
      category: category === 'All Templates' ? '' : category
    };
  }

  onPreview(template: ResumeTemplate): void {
    void this.router.navigate(['/templates', template.id, 'preview']);
  }

  onUseTemplate(template: ResumeTemplate): void {
    this.error = '';

    if (template.premium && !this.usageLimit?.premium) {
      this.upgradeMessage = 'This template is premium. Upgrade to use premium templates.';
      this.showUpgradeModal = true;
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.creatingTemplateId = template.id;
      this.resumeService.createEditorResume({
        templateId: template.id,
        title: 'Untitled Resume'
      }).subscribe({
        next: (resume) => {
          this.creatingTemplateId = null;
          void this.router.navigate(['/resume-editor', resume.id, 'content']);
        },
        error: (error) => {
          this.creatingTemplateId = null;
          this.handleCreateError(error, template);
        }
      });
      return;
    }

    void this.router.navigate(['/resume-builder/create', template.id]);
  }

  private handleCreateError(error: any, template: ResumeTemplate): void {
    const message = String(error?.error?.message ?? '');
    const isPlanLimitError = message.toLowerCase().includes('free plan supports only 1')
      || message.toLowerCase().includes('upgrade for more');
    const isPremiumError = message.toLowerCase().includes('premium');

    if (isPlanLimitError || (template.premium && isPremiumError)) {
      this.upgradeMessage = isPremiumError
        ? 'This template is premium. Upgrade to use premium templates.'
        : 'Your free plan includes only one resume. Upgrade to create another.';
      this.showUpgradeModal = true;
      return;
    }

    this.error = message || 'Unable to open this template. Please try again.';
  }

  onImportResume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.importing = true;
    this.resumeService.importResume(file).subscribe({
      next: ({ resumeId }) => {
        this.importing = false;
        void this.router.navigate(['/resume-editor', resumeId, 'content']);
      },
      error: () => {
        this.importing = false;
      }
    });
    input.value = '';
  }

  toggleFavorite(template: ResumeTemplate): void {
    const next = new Set(this.favoriteIds);
    if (next.has(template.id)) {
      next.delete(template.id);
    } else {
      next.add(template.id);
    }
    this.favoriteIds = next;
    localStorage.setItem(this.favoriteStorageKey, JSON.stringify(Array.from(next)));
  }

  private sortTemplates(templates: ResumeTemplate[]): ResumeTemplate[] {
    const sorted = [...templates];
    switch (this.sort) {
      case 'name':
        return sorted.sort((left, right) => left.name.localeCompare(right.name));
      case 'free-first':
        return sorted.sort((left, right) => Number(left.premium) - Number(right.premium));
      case 'premium-first':
        return sorted.sort((left, right) => Number(right.premium) - Number(left.premium));
      case 'ats-first':
        return sorted.sort((left, right) => Number(right.atsFriendly) - Number(left.atsFriendly));
      default:
        return sorted;
    }
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

  private parseJsonArray(value: string): string[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
}
