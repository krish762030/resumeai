import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { ResumeDocument, ResumeDocumentSection } from '../../../../core/models/resume-document.model';
import { replaceSection, sortedVisibleSections } from '../../../../core/models/resume-document.utils';

@Component({
  selector: 'app-compact-resume-template',
  templateUrl: './compact-resume-template.component.html',
  styleUrls: ['./compact-resume-template.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompactResumeTemplateComponent {
  @Input() document!: ResumeDocument;
  @Input() editable = false;
  @Output() readonly documentChange = new EventEmitter<ResumeDocument>();

  visibleSections(document: ResumeDocument): ResumeDocumentSection[] {
    return sortedVisibleSections(document);
  }

  trackBySectionId(_index: number, section: ResumeDocumentSection): string {
    return section.id;
  }

  updatePersonal(patch: Partial<ResumeDocument['personal']>): void {
    this.documentChange.emit({
      ...this.document,
      personal: {
        ...this.document.personal,
        ...patch
      },
      updatedAt: new Date().toISOString()
    });
  }

  updateSection(section: ResumeDocumentSection): void {
    this.documentChange.emit(replaceSection(this.document, section));
  }
}
