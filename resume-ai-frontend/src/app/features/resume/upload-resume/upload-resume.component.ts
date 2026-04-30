import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResumeResponse } from '../../../core/models/resume.model';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-upload-resume',
  templateUrl: './upload-resume.component.html'
})
export class UploadResumeComponent {
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploading = false;
  error = '';

  constructor(
    private readonly resumeService: ResumeService,
    private readonly router: Router
  ) {
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error = '';
  }

  upload(): void {
    if (!this.selectedFile) {
      this.error = 'Please choose a PDF resume first.';
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.error = '';

    this.resumeService.uploadResumeWithProgress(this.selectedFile).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        }

        if (event.type === HttpEventType.Response) {
          const resume = event.body as ResumeResponse;
          this.uploading = false;
          void this.router.navigate(['/resume', resume.id, 'analysis']);
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.uploading = false;
        this.error = error.error?.message ?? 'Resume upload failed.';
      }
    });
  }
}
