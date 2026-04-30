import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ResumeAnalysis } from '../../../core/models/analysis.model';
import { AiService } from '../../../core/services/ai.service';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-resume-analysis',
  templateUrl: './resume-analysis.component.html'
})
export class ResumeAnalysisComponent implements OnInit {
  resumeId = 0;
  analysis: ResumeAnalysis | null = null;
  loading = true;
  refreshing = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly resumeService: ResumeService,
    private readonly aiService: AiService
  ) {
  }

  ngOnInit(): void {
    this.resumeId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrAnalyze();
  }

  runImprove(): void {
    this.refreshing = true;
    this.aiService.improveResume(this.resumeId)
      .pipe(finalize(() => (this.refreshing = false)))
      .subscribe((analysis) => {
        this.analysis = analysis;
      });
  }

  private loadOrAnalyze(): void {
    this.resumeService.getResumeAnalysis(this.resumeId).subscribe({
      next: (analysis) => {
        this.analysis = analysis;
        this.loading = false;
      },
      error: () => {
        this.aiService.analyzeResume(this.resumeId).subscribe((analysis) => {
          this.analysis = analysis;
          this.loading = false;
        });
      }
    });
  }
}
