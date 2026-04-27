import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeSection } from '../../../core/models/resume.model';

@Component({
  selector: 'app-section-sidebar',
  templateUrl: './section-sidebar.component.html'
})
export class SectionSidebarComponent {
  @Input() sections: ResumeSection[] = [];
  @Input() selectedSectionId?: number;
  @Output() selectSection = new EventEmitter<number>();
  @Output() addSection = new EventEmitter<void>();
  @Output() moveUp = new EventEmitter<number>();
  @Output() moveDown = new EventEmitter<number>();
  @Output() toggleVisibility = new EventEmitter<ResumeSection>();
}
