import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobMatch } from '../../../core/models/job.model';
import { JobService } from '../../../core/services/job.service';

@Component({
  selector: 'app-job-matches',
  templateUrl: './job-matches.component.html'
})
export class JobMatchesComponent implements OnInit {
  resumeId = 0;
  loading = true;
  matches: JobMatch[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly jobService: JobService
  ) {
  }

  ngOnInit(): void {
    this.resumeId = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobMatches(this.resumeId).subscribe({
      next: (matches) => {
        this.matches = matches;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
