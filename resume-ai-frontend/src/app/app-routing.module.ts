import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { TemplateManageComponent } from './features/admin/template-manage/template-manage.component';
import { TemplateUploadComponent } from './features/admin/template-upload/template-upload.component';
import { PricingComponent } from './features/pricing/pricing.component';
import { UploadResumeComponent } from './features/resume/upload-resume/upload-resume.component';
import { TemplateDashboardComponent } from './features/resume-builder/template-dashboard/template-dashboard.component';
import { ResumeEditorShellComponent } from './features/resume-editor/resume-editor-shell/resume-editor-shell.component';
import { MyResumesComponent } from './features/resumes/my-resumes/my-resumes.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
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
      { path: '', component: DashboardComponent },
      { path: 'pricing', component: PricingComponent },

      { path: 'resumes', component: MyResumesComponent, canActivate: [AuthGuard] },
      { path: 'templates', component: TemplateDashboardComponent, canActivate: [AuthGuard] },
      { path: 'resume-editor/:resumeId/content', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-editor/:resumeId/customize', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-editor/:resumeId/ai-tools', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-editor/:resumeId/:tab', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'resume-builder/create/:templateId', component: ResumeEditorShellComponent, canActivate: [AuthGuard] },
      { path: 'ats-score', component: UploadResumeComponent, canActivate: [AuthGuard] },
      { path: 'ai-tools', component: MyResumesComponent, canActivate: [AuthGuard] },
      { path: 'account', component: MyResumesComponent, canActivate: [AuthGuard] },
      { path: 'admin/templates', component: TemplateManageComponent, canActivate: [AuthGuard] },
      { path: 'admin/templates/upload', component: TemplateUploadComponent, canActivate: [AuthGuard] }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
