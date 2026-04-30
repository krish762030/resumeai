import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ResumeDocument } from '../../../core/models/resume-document.model';

@Component({
  selector: 'app-resume-template-renderer',
  templateUrl: './resume-template-renderer.component.html',
  styleUrls: ['./resume-template-renderer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResumeTemplateRendererComponent {
  @Input() document: ResumeDocument | null = null;
  @Input() editable = false;
  @Output() readonly documentChange = new EventEmitter<ResumeDocument>();

  cssVariables(document: ResumeDocument): Record<string, string> {
    const page = document.theme.pageSize === 'Letter'
      ? { width: '216mm', minHeight: '279mm' }
      : { width: '210mm', minHeight: '297mm' };

    return {
      '--resume-font': document.theme.fontFamily,
      '--resume-primary': document.theme.primaryColor,
      '--resume-secondary': document.theme.secondaryColor,
      '--resume-text': document.theme.textColor,
      '--resume-section-gap': `${document.theme.sectionSpacing}px`,
      '--resume-page-width': page.width,
      '--resume-page-min-height': page.minHeight
    };
  }
}
