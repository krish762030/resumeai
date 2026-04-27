import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent implements OnInit {
  builderWorkspace = false;
  publicLanding = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.authService.hydrateUser();
    this.syncWorkspaceMode(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.syncWorkspaceMode(event.urlAfterRedirects);
    });
  }

  private syncWorkspaceMode(url: string): void {
    this.builderWorkspace = [
      '/resume-builder/create/',
      '/resume-builder/edit/',
      '/resume-builder/preview/'
    ].some((prefix) => url.startsWith(prefix));

    this.publicLanding = !this.authService.isAuthenticated() && (url === '/dashboard' || url === '/');
  }
}
