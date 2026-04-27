import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { TemplateManageComponent } from './features/admin/template-manage/template-manage.component';
import { TemplateUploadComponent } from './features/admin/template-upload/template-upload.component';
import { JobListComponent } from './features/jobs/job-list/job-list.component';
import { JobMatchesComponent } from './features/jobs/job-matches/job-matches.component';
import { PricingComponent } from './features/pricing/pricing.component';
import { ResumeAnalysisComponent } from './features/resume/resume-analysis/resume-analysis.component';
import { ResumeDetailComponent } from './features/resume/resume-detail/resume-detail.component';
import { UploadResumeComponent } from './features/resume/upload-resume/upload-resume.component';
import { ResumeEditorComponent } from './features/resume-builder/resume-editor/resume-editor.component';
import { ResumeFormComponent } from './features/resume-builder/resume-form/resume-form.component';
import { ResumePreviewComponent } from './features/resume-builder/resume-preview/resume-preview.component';
import { TemplateListComponent } from './features/resume-builder/template-list/template-list.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ScoreCardComponent } from './shared/components/score-card/score-card.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { JoinListPipe } from './shared/pipes/join-list.pipe';

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    MainLayoutComponent,
    NavbarComponent,
    SidebarComponent,
    LoaderComponent,
    ScoreCardComponent,
    JoinListPipe,
    LoginComponent,
    RegisterComponent,
    TemplateManageComponent,
    TemplateUploadComponent,
    DashboardComponent,
    UploadResumeComponent,
    ResumeDetailComponent,
    ResumeAnalysisComponent,
    JobListComponent,
    JobMatchesComponent,
    PricingComponent,
    TemplateListComponent,
    ResumeFormComponent,
    ResumePreviewComponent,
    ResumeEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
