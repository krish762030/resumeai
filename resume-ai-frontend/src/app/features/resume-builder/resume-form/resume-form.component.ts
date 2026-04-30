import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CustomSection,
  Education,
  EducationSection,
  Project,
  ProjectsSection,
  ResumeDocument,
  ResumeTemplateKey,
  Skill,
  SkillLevel,
  SkillsSection,
  WorkExperience,
  WorkExperienceSection
} from '../../../core/models/resume-document.model';
import {
  createCustomSection,
  createDefaultResumeDocument,
  createEducationSection,
  createExperienceSection,
  createProjectsSection,
  createResumeId,
  createSkillsSection,
  firstSectionOfType,
  templateKeyFromTemplate
} from '../../../core/models/resume-document.utils';
import { ResumeTemplate } from '../../../core/models/resume.model';
import { ResumeBuilderLocalService } from '../../../core/services/resume-builder-local.service';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-resume-form',
  templateUrl: './resume-form.component.html'
})
export class ResumeFormComponent implements OnInit, OnDestroy {
  template: ResumeTemplate | null = null;
  resumeDocument: ResumeDocument = createDefaultResumeDocument();
  activeTab: 'overview' | 'content' | 'customize' | 'ai' = 'content';
  loading = true;
  submitting = false;
  error = '';

  readonly templateOptions: Array<{ key: ResumeTemplateKey; label: string }> = [
    { key: 'modern', label: 'Modern' },
    { key: 'classic', label: 'Classic' },
    { key: 'minimal', label: 'Minimal' }
  ];
  readonly fontOptions = ['Source Sans Pro', 'Karla', 'Mulish', 'Lato', 'Roboto', 'Work Sans'];
  readonly colorThemes = [
    { name: 'Executive Green', primaryColor: '#1f4f46', secondaryColor: '#d97706' },
    { name: 'Slate Blue', primaryColor: '#1e3a8a', secondaryColor: '#0f766e' },
    { name: 'Charcoal Red', primaryColor: '#1f2937', secondaryColor: '#be123c' },
    { name: 'Deep Teal', primaryColor: '#0f766e', secondaryColor: '#92400e' }
  ];
  readonly skillLevels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

  readonly form = this.formBuilder.group({
    title: ['My Resume', Validators.required],
    templateKey: ['modern', Validators.required],
    personal: this.formBuilder.group({
      fullName: ['', Validators.required],
      headline: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: [''],
      links: ['LinkedIn | GitHub | Portfolio'],
      summary: ['Entry-level candidate focused on ATS-friendly recruiter screening.', Validators.required]
    }),
    experience: this.formBuilder.array([]),
    education: this.formBuilder.array([]),
    skills: this.formBuilder.array([]),
    projects: this.formBuilder.array([]),
    customSections: this.formBuilder.array([]),
    theme: this.formBuilder.group({
      fontFamily: ['Source Sans Pro'],
      primaryColor: ['#1f4f46'],
      secondaryColor: ['#d97706'],
      textColor: ['#111827'],
      sectionSpacing: [18],
      pageSize: ['A4']
    })
  });

  private formChangesSubscription?: Subscription;
  private syncingForm = false;

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
      next: (template) => this.initializeTemplate(template),
      error: () => {
        const localTemplate = this.resumeBuilderLocalService.getTemplate(templateId);
        if (localTemplate) {
          this.initializeTemplate(localTemplate);
          return;
        }
        this.error = 'Template could not be loaded.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe();
  }

  get experience(): FormArray {
    return this.form.get('experience') as FormArray;
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

  get customSections(): FormArray {
    return this.form.get('customSections') as FormArray;
  }

  addExperience(): void {
    this.experience.push(this.createExperienceGroup());
  }

  addEducation(): void {
    this.education.push(this.createEducationGroup());
  }

  addSkill(): void {
    this.skills.push(this.createSkillGroup());
  }

  addProject(): void {
    this.projects.push(this.createProjectGroup());
  }

  addCustomSection(): void {
    this.customSections.push(this.createCustomSectionGroup());
  }

  removeItem(array: FormArray, index: number): void {
    if (array.length > 1 || array === this.customSections) {
      array.removeAt(index);
    }
  }

  applyColorTheme(theme: { primaryColor: string; secondaryColor: string }): void {
    (this.form.get('theme') as FormGroup).patchValue({
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor
    });
  }

  onInlineDocumentChange(document: ResumeDocument): void {
    this.resumeDocument = document;
    this.writeDocumentToForm(document);
  }

  submit(): void {
    if (this.form.invalid || !this.template) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = '';
    this.applyFormToDocument();

    try {
      const resume = this.resumeBuilderLocalService.createResume(
        this.template,
        this.resumeDocument.title,
        this.resumeDocument
      );
      this.router.navigate(['/resume-builder/preview', resume.id]);
    } catch (error) {
      this.submitting = false;
      this.error = error instanceof Error ? error.message : 'Failed to generate resume.';
    }
  }

  private subscribeToForm(): void {
    this.formChangesSubscription?.unsubscribe();
    this.formChangesSubscription = this.form.valueChanges.subscribe(() => {
      if (!this.syncingForm) {
        this.applyFormToDocument();
      }
    });
  }

  private initializeTemplate(template: ResumeTemplate): void {
    this.template = template;
    this.resumeDocument = createDefaultResumeDocument(templateKeyFromTemplate(template), 'My Resume');
    this.writeDocumentToForm(this.resumeDocument);
    this.subscribeToForm();
    this.loading = false;
  }

  private applyFormToDocument(): void {
    const personal = this.form.get('personal')?.getRawValue() as ResumeDocument['personal'];
    const theme = this.form.get('theme')?.getRawValue() as ResumeDocument['theme'];
    const templateKey = this.form.value.templateKey as ResumeTemplateKey;
    const title = (this.form.value.title as string) || 'My Resume';

    this.resumeDocument = {
      schemaVersion: 1,
      title,
      templateKey,
      personal,
      theme: {
        ...theme,
        pageSize: theme.pageSize === 'Letter' ? 'Letter' : 'A4',
        sectionSpacing: Number(theme.sectionSpacing) || 18
      },
      sections: [
        createExperienceSection(this.experience.controls.map((control) => this.formValueToExperience(control as FormGroup))),
        createSkillsSection(this.skills.controls.map((control) => this.formValueToSkill(control as FormGroup))),
        createProjectsSection(this.projects.controls.map((control) => this.formValueToProject(control as FormGroup))),
        createEducationSection(this.education.controls.map((control) => this.formValueToEducation(control as FormGroup))),
        ...this.customSections.controls.map((control, index) => this.formValueToCustomSection(control as FormGroup, index))
      ],
      updatedAt: new Date().toISOString()
    };
  }

  private writeDocumentToForm(document: ResumeDocument): void {
    this.syncingForm = true;
    this.form.patchValue({
      title: document.title,
      templateKey: document.templateKey,
      personal: document.personal,
      theme: document.theme
    }, { emitEvent: false });

    this.resetArray(this.experience, firstSectionOfType<WorkExperienceSection>(document, 'experience')?.items ?? [], (item) => this.createExperienceGroup(item));
    this.resetArray(this.education, firstSectionOfType<EducationSection>(document, 'education')?.items ?? [], (item) => this.createEducationGroup(item));
    this.resetArray(this.skills, firstSectionOfType<SkillsSection>(document, 'skills')?.items ?? [], (item) => this.createSkillGroup(item));
    this.resetArray(this.projects, firstSectionOfType<ProjectsSection>(document, 'projects')?.items ?? [], (item) => this.createProjectGroup(item));
    this.resetArray(
      this.customSections,
      document.sections.filter((section): section is CustomSection => section.type === 'custom'),
      (section) => this.createCustomSectionGroup(section)
    );
    this.syncingForm = false;
  }

  private resetArray<TItem>(array: FormArray, items: TItem[], factory: (item: TItem) => FormGroup): void {
    while (array.length) {
      array.removeAt(0);
    }
    items.forEach((item) => array.push(factory(item)));
  }

  private createExperienceGroup(item?: WorkExperience): FormGroup {
    return this.formBuilder.group({
      id: [item?.id ?? createResumeId('experience')],
      company: [item?.company ?? '', Validators.required],
      position: [item?.position ?? '', Validators.required],
      location: [item?.location ?? ''],
      startDate: [item?.startDate ?? ''],
      endDate: [item?.endDate ?? 'Present'],
      summary: [item?.summary ?? ''],
      highlightsText: [(item?.highlights ?? ['']).join('\n')]
    });
  }

  private createEducationGroup(item?: Education): FormGroup {
    return this.formBuilder.group({
      id: [item?.id ?? createResumeId('education')],
      institution: [item?.institution ?? '', Validators.required],
      degree: [item?.degree ?? '', Validators.required],
      field: [item?.field ?? ''],
      location: [item?.location ?? ''],
      startDate: [item?.startDate ?? ''],
      endDate: [item?.endDate ?? ''],
      score: [item?.score ?? '']
    });
  }

  private createSkillGroup(item?: Skill): FormGroup {
    return this.formBuilder.group({
      id: [item?.id ?? createResumeId('skill')],
      name: [item?.name ?? '', Validators.required],
      level: [item?.level ?? 'intermediate']
    });
  }

  private createProjectGroup(item?: Project): FormGroup {
    return this.formBuilder.group({
      id: [item?.id ?? createResumeId('project')],
      name: [item?.name ?? '', Validators.required],
      role: [item?.role ?? ''],
      url: [item?.url ?? ''],
      startDate: [item?.startDate ?? ''],
      endDate: [item?.endDate ?? ''],
      description: [item?.description ?? '', Validators.required],
      technologiesText: [(item?.technologies ?? []).join(', ')]
    });
  }

  private createCustomSectionGroup(section?: CustomSection): FormGroup {
    return this.formBuilder.group({
      id: [section?.id ?? createResumeId('section-custom')],
      title: [section?.title ?? 'Custom Section', Validators.required],
      itemsText: [(section?.items ?? createCustomSection().items)
        .map((item) => [item.title, item.subtitle, item.description].filter(Boolean).join(' | '))
        .join('\n')]
    });
  }

  private formValueToExperience(group: FormGroup): WorkExperience {
    const value = group.getRawValue() as Record<string, string>;
    return {
      id: value['id'],
      company: value['company'],
      position: value['position'],
      location: value['location'],
      startDate: value['startDate'],
      endDate: value['endDate'],
      summary: value['summary'],
      highlights: this.lines(value['highlightsText'])
    };
  }

  private formValueToEducation(group: FormGroup): Education {
    return group.getRawValue() as Education;
  }

  private formValueToSkill(group: FormGroup): Skill {
    return group.getRawValue() as Skill;
  }

  private formValueToProject(group: FormGroup): Project {
    const value = group.getRawValue() as Record<string, string>;
    return {
      id: value['id'],
      name: value['name'],
      role: value['role'],
      url: value['url'],
      startDate: value['startDate'],
      endDate: value['endDate'],
      description: value['description'],
      technologies: value['technologiesText']
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    };
  }

  private formValueToCustomSection(group: FormGroup, index: number): CustomSection {
    const value = group.getRawValue() as Record<string, string>;
    return {
      id: value['id'],
      type: 'custom',
      title: value['title'],
      visible: true,
      order: 80 + index,
      items: this.lines(value['itemsText']).map((line) => {
        const [title, subtitle, description] = line.split('|').map((part) => part.trim());
        return {
          id: createResumeId('custom-item'),
          title,
          subtitle,
          description
        };
      })
    };
  }

  private lines(value: string): string[] {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
