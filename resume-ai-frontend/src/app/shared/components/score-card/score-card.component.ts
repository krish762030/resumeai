import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html'
})
export class ScoreCardComponent {
  @Input() title = 'ATS Score';
  @Input() score = 0;

  get tone(): string {
    if (this.score >= 80) {
      return 'text-[#16a34a]';
    }
    if (this.score >= 60) {
      return 'text-[#f59e0b]';
    }
    return 'text-[#ef4444]';
  }
}
