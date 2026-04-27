import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-template-card',
  templateUrl: './template-card.component.html'
})
export class TemplateCardComponent {
  @Input() template!: ResumeTemplate;
  @Input() atsScore = 92;
  @Input() usedCountLabel = '10,000+ students';
  @Input() favorite = false;
  @Output() preview = new EventEmitter<ResumeTemplate>();
  @Output() useTemplate = new EventEmitter<ResumeTemplate>();
  @Output() toggleFavorite = new EventEmitter<ResumeTemplate>();

  get tags(): string[] {
    try {
      const parsed = JSON.parse(this.template.tagsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  onPreview(): void {
    this.preview.emit(this.template);
  }

  onUseTemplate(): void {
    this.useTemplate.emit(this.template);
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.template);
  }
}
