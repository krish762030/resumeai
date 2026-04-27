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
  readonly categoryChips = ['All', 'Developer', 'Fresher', 'Professional', 'Modern', 'Compact'];

  templates: ResumeTemplate[] = [];
  loading = true;
  search = '';
  sort = 'recommended';
  favoriteIds = new Set<number>();
  usageLimit: UsageLimit | null = null;
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

  get recommendedTemplates(): ResumeTemplate[] {
    const priority = ['Java Developer', 'Backend Developer', 'Full Stack Developer'];
    return priority
      .map((name) => this.templates.find((template) => template.name === name))
      .filter((template): template is ResumeTemplate => !!template);
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
      category: category === 'All' ? '' : category
    };
  }

  onPreview(template: ResumeTemplate): void {
    void this.router.navigate(['/templates', template.id, 'preview']);
  }

  onUseTemplate(template: ResumeTemplate): void {
    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/resume-builder/create/${template.id}` }
      });
      return;
    }

    if (template.premium && !this.usageLimit?.premium) {
      void this.router.navigate(['/pricing'], {
        queryParams: { templateId: template.id, source: 'templates' }
      });
      return;
    }

    void this.router.navigate(['/resume-builder/create', template.id]);
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
        return sorted.sort((left, right) => this.recommendationScore(right) - this.recommendationScore(left));
    }
  }

  private recommendationScore(template: ResumeTemplate): number {
    let score = 0;
    if (template.atsFriendly) {
      score += 20;
    }
    if (template.roleType === 'Software Developer') {
      score += 15;
    }
    if (template.experienceLevel === 'Mid Level') {
      score += 10;
    }
    if (this.recommendedTemplates.some((recommended) => recommended.id === template.id)) {
      score += 100;
    }
    if (!template.premium) {
      score += 5;
    }
    return score;
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
