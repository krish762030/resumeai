import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly user$ = this.authService.currentUser$;

  readonly links = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'My Resumes', route: '/resume/upload' },
    { label: 'Resume Builder', route: '/resume-builder/templates' },
    { label: 'Pricing', route: '/pricing' }
  ];

  constructor(private readonly authService: AuthService) {
  }
}
