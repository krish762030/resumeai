import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneratedResume } from '../../../core/models/resume.model';
import { AuthService } from '../../../core/services/auth.service';
import { ResumeBuilderLocalService } from '../../../core/services/resume-builder-local.service';

@Component({
  selector: 'app-resume-preview',
  templateUrl: './resume-preview.component.html'
})
export class ResumePreviewComponent implements OnInit {
  resume: GeneratedResume | null = null;
  loading = true;
  downloadMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly resumeBuilderLocalService: ResumeBuilderLocalService
  ) {
  }

  ngOnInit(): void {
    const resumeId = Number(this.route.snapshot.paramMap.get('resumeId'));
    this.resume = this.resumeBuilderLocalService.getResume(resumeId);
    this.loading = false;

    if (this.resume && this.authService.isAuthenticated() && this.route.snapshot.queryParamMap.get('download') === '1') {
      this.downloadResume();
    }
  }

  downloadResume(): void {
    if (!this.resume) {
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: {
          returnUrl: `/resume-builder/preview/${this.resume.id}?download=1`
        }
      });
      return;
    }

    this.resume = this.resumeBuilderLocalService.incrementDownloadCount(this.resume.id) ?? this.resume;
    this.resumeBuilderLocalService.downloadHtml(this.resume);
    this.downloadMessage = 'Download started. You can now save this edited resume.';
  }
}
