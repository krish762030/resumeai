import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  CustomSection,
  Education,
  EducationSection,
  Project,
  ProjectsSection,
  ResumeDocumentSection,
  Skill,
  SkillsSection,
  WorkExperience,
  WorkExperienceSection
} from '../../../core/models/resume-document.model';

@Component({
  selector: 'app-resume-section-renderer',
  templateUrl: './resume-section-renderer.component.html'
})
export class ResumeSectionRendererComponent {
  @Input() section: ResumeDocumentSection | null = null;
  @Input() editable = false;
  @Output() readonly sectionChange = new EventEmitter<ResumeDocumentSection>();

  get experienceSection(): WorkExperienceSection | null {
    return this.section?.type === 'experience' ? this.section : null;
  }

  get educationSection(): EducationSection | null {
    return this.section?.type === 'education' ? this.section : null;
  }

  get skillsSection(): SkillsSection | null {
    return this.section?.type === 'skills' ? this.section : null;
  }

  get projectsSection(): ProjectsSection | null {
    return this.section?.type === 'projects' ? this.section : null;
  }

  get customSection(): CustomSection | null {
    return this.section?.type === 'custom' ? this.section : null;
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  updateTitle(title: string): void {
    if (!this.section) {
      return;
    }
    this.sectionChange.emit({ ...this.section, title });
  }

  updateExperience(itemId: string, patch: Partial<WorkExperience>): void {
    const section = this.experienceSection;
    if (!section) {
      return;
    }
    this.sectionChange.emit({
      ...section,
      items: section.items.map((item) => item.id === itemId ? { ...item, ...patch } : item)
    });
  }

  updateExperienceHighlight(itemId: string, highlightIndex: number, value: string): void {
    const section = this.experienceSection;
    if (!section) {
      return;
    }
    this.sectionChange.emit({
      ...section,
      items: section.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const highlights = [...item.highlights];
        highlights[highlightIndex] = value;
        return { ...item, highlights };
      })
    });
  }

  updateExperienceDateRange(itemId: string, value: string): void {
    const [startDate, ...rest] = value.split('-').map((part) => part.trim());
    this.updateExperience(itemId, {
      startDate,
      endDate: rest.join(' - ')
    });
  }

  updateEducation(itemId: string, patch: Partial<Education>): void {
    const section = this.educationSection;
    if (!section) {
      return;
    }
    this.sectionChange.emit({
      ...section,
      items: section.items.map((item) => item.id === itemId ? { ...item, ...patch } : item)
    });
  }

  updateSkill(itemId: string, patch: Partial<Skill>): void {
    const section = this.skillsSection;
    if (!section) {
      return;
    }
    this.sectionChange.emit({
      ...section,
      items: section.items.map((item) => item.id === itemId ? { ...item, ...patch } : item)
    });
  }

  updateProject(itemId: string, patch: Partial<Project>): void {
    const section = this.projectsSection;
    if (!section) {
      return;
    }
    this.sectionChange.emit({
      ...section,
      items: section.items.map((item) => item.id === itemId ? { ...item, ...patch } : item)
    });
  }

  updateProjectTechnologies(itemId: string, value: string): void {
    this.updateProject(itemId, {
      technologies: value
        .split(',')
        .map((technology) => technology.trim())
        .filter((technology) => technology.length > 0)
    });
  }

  updateCustomItem(itemId: string, patch: Partial<CustomSection['items'][number]>): void {
    const section = this.customSection;
    if (!section) {
      return;
    }
    this.sectionChange.emit({
      ...section,
      items: section.items.map((item) => item.id === itemId ? { ...item, ...patch } : item)
    });
  }
}
