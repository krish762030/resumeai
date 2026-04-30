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
import { MyResumesComponent } from './features/resumes/my-resumes/my-resumes.component';
import { ResumeDetailComponent } from './features/resume/resume-detail/resume-detail.component';
import { UploadResumeComponent } from './features/resume/upload-resume/upload-resume.component';
import { ResumeEditorComponent } from './features/resume-builder/resume-editor/resume-editor.component';
import { ResumeFormComponent } from './features/resume-builder/resume-form/resume-form.component';
import { ResumePreviewComponent } from './features/resume-builder/resume-preview/resume-preview.component';
import { RecommendedTemplatesComponent } from './features/resume-builder/recommended-templates/recommended-templates.component';
import { TemplateCardComponent } from './features/resume-builder/template-card/template-card.component';
import { TemplateCustomizeBeforeUseComponent } from './features/resume-builder/template-customize-before-use/template-customize-before-use.component';
import { TemplateFilterSidebarComponent } from './features/resume-builder/template-filter-sidebar/template-filter-sidebar.component';
import { TemplateGridComponent } from './features/resume-builder/template-grid/template-grid.component';
import { TemplateDashboardComponent } from './features/resume-builder/template-dashboard/template-dashboard.component';
import { TemplateListComponent } from './features/resume-builder/template-list/template-list.component';
import { TemplatePreviewModalComponent } from './features/resume-builder/template-preview-modal/template-preview-modal.component';
import { TemplatePreviewPageComponent } from './features/resume-builder/template-preview-page/template-preview-page.component';
import { TemplateSearchComponent } from './features/resume-builder/template-search/template-search.component';
import { ResumeSectionRendererComponent } from './features/resume-builder/resume-section-renderer/resume-section-renderer.component';
import { ResumeTemplateRendererComponent } from './features/resume-builder/resume-template-renderer/resume-template-renderer.component';
import { ClassicResumeTemplateComponent } from './features/resume-builder/templates/classic-resume-template/classic-resume-template.component';
import { MinimalResumeTemplateComponent } from './features/resume-builder/templates/minimal-resume-template/minimal-resume-template.component';
import { ModernResumeTemplateComponent } from './features/resume-builder/templates/modern-resume-template/modern-resume-template.component';
import { AddSectionModalComponent } from './features/resume-editor/add-section-modal/add-section-modal.component';
import { AiToolsPanelComponent } from './features/resume-editor/ai-tools-panel/ai-tools-panel.component';
import { CustomizePanelComponent } from './features/resume-editor/customize-panel/customize-panel.component';
import { EditorTopbarComponent } from './features/resume-editor/editor-topbar/editor-topbar.component';
import { ResumeEditorShellComponent } from './features/resume-editor/resume-editor-shell/resume-editor-shell.component';
import { ResumeEditorPreviewComponent } from './features/resume-editor/resume-preview/resume-preview.component';
import { SectionAccordionComponent } from './features/resume-editor/section-accordion/section-accordion.component';
import { SectionSidebarComponent } from './features/resume-editor/section-sidebar/section-sidebar.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ScoreCardComponent } from './shared/components/score-card/score-card.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ContenteditableModelDirective } from './shared/directives/contenteditable-model.directive';
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
    ContenteditableModelDirective,
    JoinListPipe,
    LoginComponent,
    RegisterComponent,
    TemplateManageComponent,
    TemplateUploadComponent,
    DashboardComponent,
    UploadResumeComponent,
    ResumeDetailComponent,
    ResumeAnalysisComponent,
    MyResumesComponent,
    JobListComponent,
    JobMatchesComponent,
    PricingComponent,
    TemplateDashboardComponent,
    TemplateListComponent,
    TemplateGridComponent,
    TemplateCardComponent,
    TemplateCustomizeBeforeUseComponent,
    TemplateFilterSidebarComponent,
    TemplatePreviewModalComponent,
    RecommendedTemplatesComponent,
    TemplateSearchComponent,
    TemplatePreviewPageComponent,
    ResumeSectionRendererComponent,
    ResumeTemplateRendererComponent,
    ModernResumeTemplateComponent,
    ClassicResumeTemplateComponent,
    MinimalResumeTemplateComponent,
    ResumeFormComponent,
    ResumePreviewComponent,
    ResumeEditorComponent,
    ResumeEditorShellComponent,
    EditorTopbarComponent,
    SectionSidebarComponent,
    AddSectionModalComponent,
    SectionAccordionComponent,
    CustomizePanelComponent,
    AiToolsPanelComponent,
    ResumeEditorPreviewComponent
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
