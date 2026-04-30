import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeSection } from '../../../core/models/resume.model';

@Component({
  selector: 'app-section-accordion',
  templateUrl: './section-accordion.component.html'
})
export class SectionAccordionComponent {
  @Input() section: ResumeSection | null = null;
  @Input() content: Record<string, any> = {};
  @Output() contentChange = new EventEmitter<Record<string, any>>();
  @Output() save = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  emit(): void {
    this.contentChange.emit({ ...this.content });
  }

  ensureItems(): any[] {
    if (!Array.isArray(this.content.items)) {
      this.content.items = [];
    }
    return this.content.items;
  }

  ensureGroups(): any[] {
    if (!Array.isArray(this.content.groups)) {
      this.content.groups = [];
    }
    return this.content.groups;
  }

  addItem(factory: () => any): void {
    this.ensureItems().push(factory());
    this.emit();
  }

  addExperienceItem(): void {
    this.addItem(() => ({ company: '', role: '', location: '', startDate: '', endDate: '', description: [''] }));
  }

  addEducationItem(): void {
    this.addItem(() => ({ degree: '', institute: '', location: '', startDate: '', endDate: '' }));
  }

  addGenericItem(): void {
    this.addItem(() => ({ title: '', subtitle: '', issuer: '', year: '', name: '', level: '', description: [''] }));
  }

  removeItem(index: number): void {
    this.ensureItems().splice(index, 1);
    this.emit();
  }

  addDescription(item: Record<string, any>): void {
    if (!Array.isArray(item.description)) {
      item.description = [];
    }
    item.description.push('');
    this.emit();
  }

  removeDescription(item: Record<string, any>, index: number): void {
    if (Array.isArray(item.description)) {
      item.description.splice(index, 1);
      this.emit();
    }
  }

  addGroup(): void {
    this.ensureGroups().push({ title: '', skills: [''] });
    this.emit();
  }

  removeGroup(index: number): void {
    this.ensureGroups().splice(index, 1);
    this.emit();
  }

  addSkill(group: Record<string, any>): void {
    if (!Array.isArray(group.skills)) {
      group.skills = [];
    }
    group.skills.push('');
    this.emit();
  }

  removeSkill(group: Record<string, any>, index: number): void {
    if (Array.isArray(group.skills)) {
      group.skills.splice(index, 1);
      this.emit();
    }
  }
}
