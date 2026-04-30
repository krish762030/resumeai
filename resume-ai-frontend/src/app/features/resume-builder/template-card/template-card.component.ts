import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ResumeDocument } from '../../../core/models/resume-document.model';
import { createTemplatePreviewDocument } from '../../../core/models/resume-document.utils';
import { ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-template-card',
  templateUrl: './template-card.component.html',
  styleUrls: ['./template-card.component.scss']
})
export class TemplateCardComponent implements OnChanges {
  @Input() template!: ResumeTemplate;
  @Input() atsScore = 92;
  @Input() usedCountLabel = '10,000+ students';
  @Input() favorite = false;
  @Output() preview = new EventEmitter<ResumeTemplate>();
  @Output() useTemplate = new EventEmitter<ResumeTemplate>();
  @Output() toggleFavorite = new EventEmitter<ResumeTemplate>();

  previewDocument: ResumeDocument | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['template']) {
      this.previewDocument = createTemplatePreviewDocument(this.template);
    }
  }

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
