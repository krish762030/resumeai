import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resume-editor-preview',
  templateUrl: './resume-preview.component.html'
})
export class ResumeEditorPreviewComponent {
  @Input() html = '';
}
