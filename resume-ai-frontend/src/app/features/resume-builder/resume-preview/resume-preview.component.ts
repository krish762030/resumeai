import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeDocument } from '../../../core/models/resume-document.model';
import { normalizeResumeDocument } from '../../../core/models/resume-document.utils';
import { GeneratedResume } from '../../../core/models/resume.model';
import { AuthService } from '../../../core/services/auth.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { ResumeBuilderLocalService } from '../../../core/services/resume-builder-local.service';

@Component({
  selector: 'app-resume-preview',
  templateUrl: './resume-preview.component.html'
})
export class ResumePreviewComponent implements OnInit {
  @ViewChild('resumePaper') resumePaper?: ElementRef<HTMLElement>;

  resume: GeneratedResume | null = null;
  resumeDocument: ResumeDocument | null = null;
  loading = true;
  error = '';
  downloadMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly pdfExportService: PdfExportService,
    private readonly resumeBuilderLocalService: ResumeBuilderLocalService
  ) {
  }

  ngOnInit(): void {
    const resumeId = Number(this.route.snapshot.paramMap.get('resumeId'));
    this.resume = this.resumeBuilderLocalService.getResume(resumeId);
    if (!this.resume) {
      this.error = 'Saved draft not found.';
    } else {
      this.resumeDocument = this.parseDocument(this.resume);
    }
    this.loading = false;

    if (this.resume && this.authService.isAuthenticated() && this.route.snapshot.queryParamMap.get('download') === '1') {
      window.setTimeout(() => void this.downloadResume());
    }
  }

  async downloadResume(): Promise<void> {
    if (!this.resume || !this.resumeDocument) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/resume-builder/preview/${this.resume.id}?download=1`
        }
      });
      return;
    }

    try {
      if (!this.resumePaper) {
        return;
      }
      const target = this.resumePaper.nativeElement.querySelector('.resume-page') as HTMLElement | null;
      await this.pdfExportService.exportElementWithHtml2Pdf(
        target ?? this.resumePaper.nativeElement,
        `${this.fileName(this.resume.title)}.pdf`,
        this.resumeDocument.theme.pageSize === 'Letter' ? 'letter' : 'a4'
      );
      this.resume = this.resumeBuilderLocalService.incrementDownloadCount(this.resume.id) ?? this.resume;
      this.downloadMessage = 'PDF download started. You can now save this edited resume.';
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to generate PDF.';
    }
  }

  private parseDocument(resume: GeneratedResume): ResumeDocument {
    try {
      return normalizeResumeDocument(JSON.parse(resume.resumeDataJson), resume.title);
    } catch {
      return normalizeResumeDocument({}, resume.title);
    }
  }

  private fileName(title: string): string {
    return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'resume';
  }
}
