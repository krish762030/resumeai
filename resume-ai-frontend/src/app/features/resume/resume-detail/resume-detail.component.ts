import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResumeResponse } from '../../../core/models/resume.model';
import { ResumeService } from '../../../core/services/resume.service';

@Component({
  selector: 'app-resume-detail',
  templateUrl: './resume-detail.component.html'
})
export class ResumeDetailComponent implements OnInit {
  resume: ResumeResponse | null = null;
  loading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly resumeService: ResumeService
  ) {
  }

  ngOnInit(): void {
    const resumeId = Number(this.route.snapshot.paramMap.get('id'));
    this.resumeService.getResume(resumeId).subscribe({
      next: (resume) => {
        this.resume = resume;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
