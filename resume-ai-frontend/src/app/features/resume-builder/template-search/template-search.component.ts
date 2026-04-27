import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-template-search',
  templateUrl: './template-search.component.html'
})
export class TemplateSearchComponent {
  @Input() search = '';
  @Output() searchChange = new EventEmitter<string>();
}
