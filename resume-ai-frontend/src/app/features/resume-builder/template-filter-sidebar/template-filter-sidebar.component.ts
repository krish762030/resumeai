import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface TemplateFilterState {
  roleType: string;
  experience: string;
  layout: string;
  style: string;
  category: string;
  isAtsFriendly: boolean | null;
  access: 'all' | 'free' | 'premium';
}

@Component({
  selector: 'app-template-filter-sidebar',
  templateUrl: './template-filter-sidebar.component.html'
})
export class TemplateFilterSidebarComponent {
  @Input() filters!: TemplateFilterState;
  @Output() filtersChange = new EventEmitter<TemplateFilterState>();

  readonly roles = ['Software Developer', 'Designer', 'MBA', 'Data Analyst'];
  readonly experienceLevels = ['Fresher', 'Mid Level', 'Senior'];
  readonly layouts = ['Single Column', 'Two Column'];
  readonly styles = ['Modern', 'Minimal', 'Creative', 'Clean', 'Compact'];
  readonly categories = ['Fresher', 'Developer', 'Professional', 'Modern', 'Compact'];

  update(partial: Partial<TemplateFilterState>): void {
    this.filtersChange.emit({ ...this.filters, ...partial });
  }
}
