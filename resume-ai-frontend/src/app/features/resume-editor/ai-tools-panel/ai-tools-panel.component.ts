import { Component, Input } from '@angular/core';
import { ResumeEditorResume } from '../../../core/models/resume.model';

@Component({
  selector: 'app-ai-tools-panel',
  templateUrl: './ai-tools-panel.component.html'
})
export class AiToolsPanelComponent {
  @Input() resume: ResumeEditorResume | null = null;
}
