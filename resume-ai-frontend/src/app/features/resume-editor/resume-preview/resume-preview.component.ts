import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resume-editor-preview',
  templateUrl: './resume-preview.component.html'
})
export class ResumeEditorPreviewComponent {
  @Input() html = '';

  get previewHtml(): string {
    return this.html?.trim() || `
      <html>
        <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
          <div style="max-width:820px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <div style="background:#1e3a5f;color:#fff;padding:24px;">
              <h1 style="margin:0;font-size:30px;">Your Name</h1>
              <p style="margin:8px 0 0;opacity:.9;">Job Title</p>
              <p style="margin:8px 0 0;opacity:.85;font-size:13px;">you@email.com • +1 000 000 0000</p>
            </div>
            <div style="padding:24px;">
              <h3>Summary</h3>
              <p>Add a short professional summary here.</p>
              <h3>Experience</h3>
              <p>Add your work experience highlights.</p>
              <h3>Skills</h3>
              <p>Skill 1, Skill 2, Skill 3</p>
              <h3>Education</h3>
              <p>Your degree and institution details.</p>
            </div>
          </div>
        </body>
      </html>`;
  }
}
