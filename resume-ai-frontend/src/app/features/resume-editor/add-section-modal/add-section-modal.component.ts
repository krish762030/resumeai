import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeSectionTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-add-section-modal',
  templateUrl: './add-section-modal.component.html'
})
export class AddSectionModalComponent {
  @Input() open = false;
  @Input() templates: ResumeSectionTemplate[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<ResumeSectionTemplate>();
}
