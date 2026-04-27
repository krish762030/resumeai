import { Component, OnInit } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html'
})
export class TemplateListComponent implements OnInit {
  templates: ResumeTemplate[] = [];
  selectedFilter = 'All templates';
  loading = true;

  readonly filters = [
    'All templates',
    'ATS',
    'Software',
    'Internship',
    'Graduate',
    'Premium'
  ];

  constructor(private readonly resumeService: ResumeService) {
  }

  ngOnInit(): void {
    this.resumeService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredTemplates(): ResumeTemplate[] {
    switch (this.selectedFilter) {
      case 'ATS':
        return this.templates.filter((template) => template.atsFriendly);
      case 'Premium':
        return this.templates.filter((template) => template.premium);
      case 'Software':
      case 'Internship':
      case 'Graduate':
        return this.templates.filter((template) => template.category.toLowerCase() === this.selectedFilter.toLowerCase());
      default:
        return this.templates;
    }
  }

  isUploadedTemplate(template: ResumeTemplate): boolean {
    return template.previewImageUrl.startsWith('http://localhost:8080/uploads/')
      || template.previewImageUrl.startsWith('https://') === false && template.previewImageUrl.includes('/uploads/');
  }
}
