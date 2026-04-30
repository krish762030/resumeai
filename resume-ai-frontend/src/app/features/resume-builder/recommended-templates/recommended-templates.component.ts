import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-recommended-templates',
  templateUrl: './recommended-templates.component.html'
})
export class RecommendedTemplatesComponent {
  @Input() templates: ResumeTemplate[] = [];
  @Input() favoriteIds = new Set<number>();
  @Output() preview = new EventEmitter<ResumeTemplate>();
  @Output() useTemplate = new EventEmitter<ResumeTemplate>();
  @Output() toggleFavorite = new EventEmitter<ResumeTemplate>();
}
