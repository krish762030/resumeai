import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneratedResume, ResumeTemplate } from '../../../core/models/resume.model';
import { ResumeBuilderLocalService } from '../../../core/services/resume-builder-local.service';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-resume-editor',
  templateUrl: './resume-editor.component.html'
})
export class ResumeEditorComponent implements OnInit {
  resume: GeneratedResume | null = null;
  template: ResumeTemplate | null = null;
  activeTab: 'overview' | 'content' | 'customize' | 'ai' = 'content';
  loading = true;
  saving = false;
  error = '';

  readonly form = this.formBuilder.group({
    title: ['', Validators.required],
    fullName: ['', Validators.required],
    headline: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    links: [''],
    education: this.formBuilder.array([]),
    skills: this.formBuilder.array([]),
    projects: this.formBuilder.array([]),
    experience: this.formBuilder.array([]),
    certifications: this.formBuilder.array([]),
    achievements: this.formBuilder.array([]),
    languages: this.formBuilder.array([]),
    designFont: ['Source Sans Pro'],
    designAccent: ['#59707c'],
    designText: ['#111827'],
    pageFormat: ['A4']
  });

  readonly fontOptions = ['Source Sans Pro', 'Karla', 'Mulish', 'Lato', 'Roboto', 'Work Sans'];
  readonly accentOptions = ['#59707c', '#2563eb', '#7c3aed', '#0f766e', '#b45309', '#1f2937'];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly resumeBuilderLocalService: ResumeBuilderLocalService,
    private readonly resumeService: ResumeService
  ) {
  }

  ngOnInit(): void {
    const resumeId = Number(this.route.snapshot.paramMap.get('resumeId'));
    this.resume = this.resumeBuilderLocalService.getResume(resumeId);
    if (!this.resume) {
      this.loading = false;
      return;
    }
    this.resumeService.getTemplateDetail(this.resume.templateId).subscribe({
      next: (template) => {
        this.template = template;
        this.populateForm(this.resume!);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get education(): FormArray {
    return this.form.get('education') as FormArray;
  }

  get skills(): FormArray {
    return this.form.get('skills') as FormArray;
  }

  get projects(): FormArray {
    return this.form.get('projects') as FormArray;
  }

  get experience(): FormArray {
    return this.form.get('experience') as FormArray;
  }

  get certifications(): FormArray {
    return this.form.get('certifications') as FormArray;
  }

  get achievements(): FormArray {
    return this.form.get('achievements') as FormArray;
  }

  get languages(): FormArray {
    return this.form.get('languages') as FormArray;
  }

  get previewHtml(): string {
    if (!this.template) {
      return '';
    }
    return this.resumeBuilderLocalService.buildPreviewHtml(
      this.template,
      (this.form.value.title as string) || this.resume?.title || 'Resume',
      this.form.getRawValue() as Record<string, unknown>
    );
  }

  addItem(array: FormArray): void {
    array.push(this.createLineControl(''));
  }

  removeItem(array: FormArray, index: number): void {
    if (array.length > 1) {
      array.removeAt(index);
    }
  }

  save(): void {
    if (this.form.invalid || !this.resume || !this.template) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      const updated = this.resumeBuilderLocalService.updateResume(
        this.resume.id,
        this.template,
        this.form.value.title as string,
        this.form.getRawValue() as Record<string, unknown>
      );
      this.router.navigate(['/resume-builder/preview', updated.id]);
    } catch (error) {
      this.saving = false;
      this.error = error instanceof Error ? error.message : 'Failed to save resume.';
    }
  }

  private populateForm(resume: GeneratedResume): void {
    const data = JSON.parse(resume.resumeDataJson) as Record<string, unknown>;
    this.form.patchValue({
      title: this.stringValue(data['title'], resume.title),
      fullName: this.stringValue(data['fullName']),
      headline: this.stringValue(data['headline']),
      email: this.stringValue(data['email']),
      phone: this.stringValue(data['phone']),
      links: this.stringValue(data['links'])
    });

    this.resetArray(this.education, data['education']);
    this.resetArray(this.skills, data['skills']);
    this.resetArray(this.projects, data['projects']);
    this.resetArray(this.experience, data['experience']);
    this.resetArray(this.certifications, data['certifications']);
    this.resetArray(this.achievements, data['achievements']);
    this.resetArray(this.languages, data['languages']);
  }

  private resetArray(array: FormArray, value: unknown): void {
    while (array.length) {
      array.removeAt(0);
    }

    const items = Array.isArray(value) ? value as Array<{ value?: string }> : [];
    if (items.length === 0) {
      array.push(this.createLineControl(''));
      return;
    }

    items.forEach((item) => {
      array.push(this.createLineControl(item?.value ?? ''));
    });
  }

  private createLineControl(initialValue = ''): FormGroup {
    return this.formBuilder.group({
      value: [initialValue, Validators.required]
    });
  }

  private stringValue(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
  }
}
