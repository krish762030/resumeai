import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResumeTheme } from '../../../core/models/resume.model';

@Component({
  selector: 'app-customize-panel',
  templateUrl: './customize-panel.component.html'
})
export class CustomizePanelComponent {
  @Input() theme!: ResumeTheme;
  @Input() premium = false;
  @Output() themeChange = new EventEmitter<ResumeTheme>();
  @Output() save = new EventEmitter<void>();

  emit(): void {
    this.themeChange.emit({ ...this.theme });
  }
}
