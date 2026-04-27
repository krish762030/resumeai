import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-template-upload',
  templateUrl: './template-upload.component.html'
})
export class TemplateUploadComponent {
  previewImage: File | null = null;
  htmlTemplateFile: File | null = null;
  submitting = false;
  error = '';
  success = '';

  readonly form = this.formBuilder.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    atsFriendly: [true, Validators.required],
    premium: [false, Validators.required]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly resumeService: ResumeService
  ) {
  }

  onPreviewImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.previewImage = input.files?.[0] ?? null;
  }

  onTemplateFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.htmlTemplateFile = input.files?.[0] ?? null;
  }

  submit(): void {
    if (this.form.invalid || !this.previewImage) {
      this.form.markAllAsTouched();
      this.error = 'Name, category, and preview image are required.';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.success = '';

    const value = this.form.getRawValue();
    this.resumeService.uploadAdminTemplate({
      name: value.name ?? '',
      category: value.category ?? '',
      atsFriendly: !!value.atsFriendly,
      premium: !!value.premium,
      previewImage: this.previewImage,
      htmlTemplateFile: this.htmlTemplateFile
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'Template uploaded. Users can now pick and edit it.';
        this.form.reset({
          name: '',
          category: '',
          atsFriendly: true,
          premium: false
        });
        this.previewImage = null;
        this.htmlTemplateFile = null;
      },
      error: (error: { error?: { message?: string } }) => {
        this.submitting = false;
        this.error = error.error?.message ?? 'Template upload failed.';
      }
    });
  }
}
