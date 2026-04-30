import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ResumeEditorResume,
  ResumeEditorState,
  ResumeSection,
  ResumeSectionTemplate,
  ResumeTemplate,
  ResumeTheme
} from '../../../core/models/resume.model';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-resume-editor-shell',
  templateUrl: './resume-editor-shell.component.html'
})
export class ResumeEditorShellComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  successMessage = '';
  showAddSection = false;
  showTemplateSwitcher = false;
  pendingTemplateId: number | null = null;
  resume: ResumeEditorResume | null = null;
  templates: ResumeTemplate[] = [];
  sectionTemplates: ResumeSectionTemplate[] = [];
  sectionDraft: Record<string, any> = {};
  state: ResumeEditorState = {
    resumeId: 0,
    templateId: 0,
    activeTab: 'content',
    sections: [],
    theme: {
      headerColor: '#284b8f',
      primaryColor: '#1E3A5F',
      fontFamily: 'Poppins',
      headerFontSize: 22,
      bodyFontSize: 12,
      sectionStyle: 'underline',
      layout: 'single-column'
    }
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly pdfExportService: PdfExportService,
    private readonly resumeService: ResumeService
  ) {
  }

  ngOnInit(): void {
    const resumeId = Number(this.route.snapshot.paramMap.get('resumeId'));
    const templateId = Number(this.route.snapshot.paramMap.get('templateId'));
    const tabParam = this.route.snapshot.paramMap.get('tab');
    if (tabParam === 'overview' || tabParam === 'content' || tabParam === 'customize' || tabParam === 'ai' || tabParam === 'ai-tools') {
      this.state = { ...this.state, activeTab: tabParam === 'ai-tools' ? 'ai' : tabParam };
    }

    this.resumeService.getTemplates().subscribe({
      next: (templates) => this.templates = templates,
      error: () => this.templates = []
    });

    this.resumeService.getSectionTemplates().subscribe({
      next: (templates) => this.sectionTemplates = templates,
      error: () => this.sectionTemplates = []
    });

    if (resumeId) {
      this.loadResume(resumeId);
      return;
    }

    if (templateId) {
      this.createResume(templateId);
      return;
    }

    this.loading = false;
    this.error = 'Resume editor route is missing a template or resume id.';
  }

  get selectedSection(): ResumeSection | null {
    return this.state.sections.find((section) => section.id === this.state.selectedSectionId) ?? null;
  }

  onActiveTabChange(tab: 'overview' | 'content' | 'customize' | 'ai'): void {
    this.state = { ...this.state, activeTab: tab };
    if (this.resume) {
      const routeTab = tab === 'ai' ? 'ai-tools' : tab;
      void this.router.navigate(['/resume-editor', this.resume.id, routeTab]);
    }
  }

  openTemplateSwitcher(): void {
    this.pendingTemplateId = this.resume?.templateId ?? null;
    this.showTemplateSwitcher = true;
  }

  cancelTemplateSwitch(): void {
    this.showTemplateSwitcher = false;
    this.pendingTemplateId = null;
  }

  applyTemplateSwitch(): void {
    if (!this.resume) {
      return;
    }
    if (!this.pendingTemplateId || this.pendingTemplateId === this.resume.templateId) {
      this.cancelTemplateSwitch();
      return;
    }
    if (!confirm('Your content will remain safe. Only the design will change.')) {
      return;
    }
    this.saving = true;
    this.resumeService.switchEditorTemplate(this.resume.id, this.pendingTemplateId).subscribe({
      next: (resume) => {
        this.applyResume(resume);
        this.successMessage = 'Template changed successfully. Your content is preserved.';
        this.cancelTemplateSwitch();
      },
      error: (error) => this.handleError(error, 'Failed to switch template.')
    });
  }

  async onDownload(): Promise<void> {
    if (!this.resume?.generatedHtml) {
      return;
    }
    try {
      await this.pdfExportService.exportHtmlWithHtml2Pdf(
        this.resume.generatedHtml,
        `${this.fileName(this.resume.title)}.pdf`
      );
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unable to generate PDF.';
    }
  }

  selectSection(sectionId: number): void {
    this.state = { ...this.state, selectedSectionId: sectionId };
    this.syncSectionDraft();
  }

  addSection(template: ResumeSectionTemplate): void {
    if (!this.resume) {
      return;
    }
    this.saving = true;
    this.resumeService.addEditorSection(this.resume.id, {
      sectionType: template.sectionType,
      sectionTitle: template.title,
      isVisible: true,
      contentJson: template.defaultContentJson
    }).subscribe({
      next: (resume) => {
        this.showAddSection = false;
        this.applyResume(resume);
      },
      error: (error) => this.handleError(error, 'Failed to add section.')
    });
  }

  saveSelectedSection(): void {
    if (!this.resume || !this.selectedSection) {
      return;
    }
    this.saving = true;
    this.resumeService.updateEditorSection(this.resume.id, this.selectedSection.id, {
      sectionType: this.selectedSection.sectionType,
      sectionTitle: this.selectedSection.sectionTitle,
      isVisible: this.selectedSection.isVisible,
      contentJson: JSON.stringify(this.sectionDraft)
    }).subscribe({
      next: (resume) => this.applyResume(resume),
      error: (error) => this.handleError(error, 'Failed to save section.')
    });
  }

  removeSelectedSection(): void {
    if (!this.resume || !this.selectedSection) {
      return;
    }
    this.saving = true;
    this.resumeService.deleteEditorSection(this.resume.id, this.selectedSection.id).subscribe({
      next: (resume) => this.applyResume(resume),
      error: (error) => this.handleError(error, 'Failed to remove section.')
    });
  }

  toggleVisibility(section: ResumeSection): void {
    if (!this.resume) {
      return;
    }
    this.saving = true;
    this.resumeService.updateEditorSectionVisibility(this.resume.id, section.id, !section.isVisible).subscribe({
      next: (resume) => this.applyResume(resume),
      error: (error) => this.handleError(error, 'Failed to update section visibility.')
    });
  }

  moveSection(sectionId: number, direction: -1 | 1): void {
    if (!this.resume) {
      return;
    }
    const ordered = [...this.state.sections].sort((a, b) => a.sectionOrder - b.sectionOrder);
    const index = ordered.findIndex((section) => section.id === sectionId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }
    const current = ordered[index];
    ordered[index] = ordered[targetIndex];
    ordered[targetIndex] = current;
    this.saving = true;
    this.resumeService.reorderEditorSections(this.resume.id, ordered.map((section, idx) => ({
      sectionId: section.id,
      sectionOrder: idx + 1
    }))).subscribe({
      next: (resume) => this.applyResume(resume),
      error: (error) => this.handleError(error, 'Failed to reorder sections.')
    });
  }

  onThemeChange(theme: ResumeTheme): void {
    this.state = { ...this.state, theme: { ...theme } };
  }

  saveTheme(): void {
    if (!this.resume) {
      return;
    }
    this.saving = true;
    this.resumeService.updateEditorTheme(this.resume.id, JSON.stringify(this.state.theme)).subscribe({
      next: (resume) => this.applyResume(resume),
      error: (error) => this.handleError(error, 'Failed to save theme.')
    });
  }

  private createResume(templateId: number): void {
    this.resumeService.getTemplateDetail(templateId).subscribe({
      next: (template) => {
        this.resumeService.createEditorResume({
          templateId,
          title: 'Untitled Resume'
        }).subscribe({
          next: (resume) => this.router.navigate(['/resume-editor', resume.id, 'content']),
          error: (error) => this.handleError(error, 'Failed to create editor resume.')
        });
      },
      error: (error) => this.handleError(error, 'Failed to load template.')
    });
  }

  private loadResume(resumeId: number): void {
    this.resumeService.getEditorResume(resumeId).subscribe({
      next: (resume) => this.applyResume(resume),
      error: (error) => this.handleError(error, 'Failed to load editor resume.')
    });
  }

  private applyResume(resume: ResumeEditorResume): void {
    this.resume = resume;
    this.state = {
      resumeId: resume.id,
      templateId: resume.templateId,
      activeTab: this.state.activeTab,
      sections: [...resume.sections].sort((a, b) => a.sectionOrder - b.sectionOrder),
      theme: this.parseTheme(resume.themeJson),
      selectedSectionId: this.pickSelectedSectionId(resume)
    };
    this.syncSectionDraft();
    this.loading = false;
    this.saving = false;
    this.error = '';
  }

  private pickSelectedSectionId(resume: ResumeEditorResume): number | undefined {
    const current = this.state.selectedSectionId;
    if (current && resume.sections.some((section) => section.id === current)) {
      return current;
    }
    return resume.sections[0]?.id;
  }

  private syncSectionDraft(): void {
    const section = this.selectedSection;
    this.sectionDraft = section ? this.resumeService.parseSectionContent(section) : {};
  }

  private parseTheme(themeJson: string): ResumeTheme {
    try {
      return JSON.parse(themeJson) as ResumeTheme;
    } catch {
      return {
        headerColor: '#284b8f',
        primaryColor: '#1E3A5F',
        fontFamily: 'Poppins',
        headerFontSize: 22,
        bodyFontSize: 12,
        sectionStyle: 'underline',
        layout: 'single-column'
      };
    }
  }

  private handleError(error: any, fallback: string): void {
    this.loading = false;
    this.saving = false;
    this.successMessage = '';
    this.error = error?.error?.message ?? fallback;
  }

  private fileName(title: string): string {
    return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'resume';
  }
}
