import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-template-grid',
  templateUrl: './template-grid.component.html'
})
export class TemplateGridComponent {
  @Input() templates: ResumeTemplate[] = [];
  @Input() favoriteIds = new Set<number>();
  @Output() preview = new EventEmitter<ResumeTemplate>();
  @Output() useTemplate = new EventEmitter<ResumeTemplate>();
  @Output() toggleFavorite = new EventEmitter<ResumeTemplate>();
}
