import { Component, OnInit } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-template-manage',
  templateUrl: './template-manage.component.html'
})
export class TemplateManageComponent implements OnInit {
  templates: ResumeTemplate[] = [];
  loading = true;

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

  isUploadedTemplate(template: ResumeTemplate): boolean {
    return template.previewImageUrl.startsWith('http://localhost:8080/uploads/')
      || template.previewImageUrl.includes('/uploads/');
  }
}
