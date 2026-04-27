import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-template-preview-modal',
  templateUrl: './template-preview-modal.component.html'
})
export class TemplatePreviewModalComponent {
  @Input() template: ResumeTemplate | null = null;
  @Input() favorite = false;
  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  get tags(): string[] {
    if (!this.template) {
      return [];
    }
    try {
      const parsed = JSON.parse(this.template.tagsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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
}
