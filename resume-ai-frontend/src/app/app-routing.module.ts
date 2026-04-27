import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MyResumesComponent } from './features/resumes/my-resumes/my-resumes.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { TemplateManageComponent } from './features/admin/template-manage/template-manage.component';
import { TemplateUploadComponent } from './features/admin/template-upload/template-upload.component';
import { PricingComponent } from './features/pricing/pricing.component';
import { JobMatchesComponent } from './features/jobs/job-matches/job-matches.component';
import { ResumeAnalysisComponent } from './features/resume/resume-analysis/resume-analysis.component';
import { ResumeDetailComponent } from './features/resume/resume-detail/resume-detail.component';
import { UploadResumeComponent } from './features/resume/upload-resume/upload-resume.component';
import { ResumePreviewComponent } from './features/resume-builder/resume-preview/resume-preview.component';
import { TemplateDashboardComponent } from './features/resume-builder/template-dashboard/template-dashboard.component';
import { TemplatePreviewPageComponent } from './features/resume-builder/template-preview-page/template-preview-page.component';
import { ResumeEditorShellComponent } from './features/resume-editor/resume-editor-shell/resume-editor-shell.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

const routes: Routes = [
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'resumes', component: MyResumesComponent, canActivate: [AuthGuard] },
      { path: 'resume/upload', component: UploadResumeComponent, canActivate: [AuthGuard] },
      { path: 'ats-score', component: UploadResumeComponent, canActivate: [AuthGuard] },
      { path: 'ai-tools', component: MyResumesComponent, canActivate: [AuthGuard] },
      { path: 'account', component: MyResumesComponent, canActivate: [AuthGuard] },
      { path: 'resume/:id', component: ResumeDetailComponent, canActivate: [AuthGuard] },
      { path: 'resume/:id/analysis', component: ResumeAnalysisComponent, canActivate: [AuthGuard] },
      { path: 'resume/:id/jobs', component: JobMatchesComponent, canActivate: [AuthGuard] },
      { path: 'templates', component: TemplateDashboardComponent, canActivate: [AuthGuard] },
      { path: 'templates/:templateId/preview', component: TemplatePreviewPageComponent, canActivate: [AuthGuard] },
      { path: 'resume-builder/create/:templateId', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-builder/preview/:resumeId', component: ResumePreviewComponent, canActivate: [AuthGuard] },
      { path: 'resume-builder/edit/:resumeId', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-editor/:resumeId', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-editor/:resumeId/:tab', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'admin/templates', component: TemplateManageComponent, canActivate: [AuthGuard] },
      { path: 'admin/templates/upload', component: TemplateUploadComponent, canActivate: [AuthGuard] },
      { path: 'pricing', component: PricingComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
