import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-template-customize-before-use',
  templateUrl: './template-customize-before-use.component.html'
})
export class TemplateCustomizeBeforeUseComponent {
  @Input() template: ResumeTemplate | null = null;
  @Input() canUseTemplate = true;
  @Output() useTemplate = new EventEmitter<void>();
  selectedFont = 'Poppins';
  selectedColor = '#284b8f';
}
