import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeEditorResume, ResumeTemplate } from '../../../core/models/resume.model';

@Component({
  selector: 'app-editor-topbar',
  templateUrl: './editor-topbar.component.html'
})
export class EditorTopbarComponent {
  @Input() resume: ResumeEditorResume | null = null;
  @Input() templates: ResumeTemplate[] = [];
  @Input() activeTab: 'overview' | 'content' | 'customize' | 'ai' = 'content';
  @Output() activeTabChange = new EventEmitter<'overview' | 'content' | 'customize' | 'ai'>();
  @Output() openTemplateSwitcher = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
}
