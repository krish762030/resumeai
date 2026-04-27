import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResumeTemplate } from '../../../core/models/resume.model';
import { ResumeBuilderLocalService } from '../../../core/services/resume-builder-local.service';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html'
})
export class ResumeFormComponent implements OnInit {
  template: ResumeTemplate | null = null;
  activeTab: 'overview' | 'content' | 'customize' | 'ai' = 'content';
  loading = true;
  submitting = false;
  error = '';

  readonly form = this.formBuilder.group({
    title: ['My ATS Resume', Validators.required],
    fullName: ['', Validators.required],
    headline: ['Entry-level candidate focused on ATS-friendly recruiter screening'],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    links: ['LinkedIn | GitHub'],
    education: this.formBuilder.array([this.createLineControl('B.Tech / Degree, Institute, Graduation Year')]),
    skills: this.formBuilder.array([this.createLineControl('Java, Spring Boot, MySQL, Angular')]),
    projects: this.formBuilder.array([this.createLineControl('Project title - outcome, stack, measurable impact')]),
    experience: this.formBuilder.array([this.createLineControl('Internship / training / volunteer work with outcomes')]),
    certifications: this.formBuilder.array([this.createLineControl('Certification name - platform / issuer')]),
    achievements: this.formBuilder.array([this.createLineControl('Achievement or competition result')]),
    languages: this.formBuilder.array([this.createLineControl('English')]),
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
    const templateId = Number(this.route.snapshot.paramMap.get('templateId'));
    this.resumeService.getTemplateDetail(templateId).subscribe({
      next: (template) => {
        this.template = template;
        this.loading = false;
      },
      error: () => {
        this.error = 'Template could not be loaded.';
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
      (this.form.value.title as string) || 'My ATS Resume',
      this.form.getRawValue() as Record<string, unknown>
    );
  }

  addItem(array: FormArray, placeholder = ''): void {
    array.push(this.createLineControl(placeholder));
  }

  removeItem(array: FormArray, index: number): void {
    if (array.length > 1) {
      array.removeAt(index);
    }
  }

  submit(): void {
    if (this.form.invalid || !this.template) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';

    try {
      const resume = this.resumeBuilderLocalService.createResume(
        this.template,
        this.form.value.title as string,
        this.form.getRawValue() as Record<string, unknown>
      );
      this.router.navigate(['/resume-builder/preview', resume.id]);
    } catch (error) {
      this.submitting = false;
      this.error = error instanceof Error ? error.message : 'Failed to generate resume.';
    }
  }

  private createLineControl(initialValue = ''): FormGroup {
    return this.formBuilder.group({
      value: [initialValue, Validators.required]
    });
  }
}
