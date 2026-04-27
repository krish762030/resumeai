import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly user$ = this.authService.currentUser$;

  readonly links = [
    { label: 'My Resumes', route: '/resumes' },
    { label: 'Resume Templates', route: '/templates' },
    { label: 'Cover Letters', route: '/resumes' },
    { label: 'ATS Score', route: '/ats-score' },
    { label: 'AI Tools', route: '/ai-tools' },
    { label: 'Plans & Pricing', route: '/pricing' },
    { label: 'My Account', route: '/account' }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
