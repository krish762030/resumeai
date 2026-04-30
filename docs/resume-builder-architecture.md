# Resume Builder Architecture

## Data Model

The canonical client model is `ResumeDocument` in `resume-ai-frontend/src/app/core/models/resume-document.model.ts`.

```ts
export interface ResumeDocument {
  schemaVersion: 1;
  title: string;
  templateKey: 'modern' | 'classic' | 'minimal';
  personal: PersonalDetails;
  sections: ResumeDocumentSection[];
  theme: ResumeThemeConfig;
  customData?: Record<string, unknown>;
}
```

The important design choice is that `sections` is ordered data, not layout. Any template can render the same section list differently. Custom sections use the same section contract, so the renderer does not need schema changes for every new user-defined section.

Example JSON:

```json
{
  "schemaVersion": 1,
  "title": "Frontend Developer Resume",
  "templateKey": "modern",
  "personal": {
    "fullName": "Aarav Mehta",
    "email": "aarav@example.com",
    "phone": "+91 90000 00000",
    "location": "Pune, India",
    "links": "LinkedIn | GitHub | Portfolio",
    "summary": "Frontend developer focused on Angular, TypeScript, and accessible product UI."
  },
  "theme": {
    "fontFamily": "Source Sans Pro",
    "primaryColor": "#1f4f46",
    "secondaryColor": "#d97706",
    "textColor": "#111827",
    "sectionSpacing": 18,
    "pageSize": "A4"
  },
  "sections": [
    {
      "id": "section-experience-1",
      "type": "experience",
      "title": "Experience",
      "visible": true,
      "order": 10,
      "items": []
    }
  ]
}
```

## Angular Rendering

Component structure:

```txt
resume-form / resume-editor
  owns Reactive Form and ResumeDocument state
  passes ResumeDocument to preview

resume-template-renderer
  selects the real template component
  applies theme CSS variables
  emits documentChange for inline edits

templates/modern-resume-template
  real A4 Angular template component

templates/classic-resume-template
  real A4 Angular template component

templates/minimal-resume-template
  real A4 Angular template component

resume-section-renderer
  renders reusable section types
  emits sectionChange for inline edits

contenteditable-model.directive
  safe text-only contenteditable binding
```

Template switch:

```html
<app-resume-template-renderer
  [document]="resumeDocument"
  [editable]="true"
  (documentChange)="onInlineDocumentChange($event)">
</app-resume-template-renderer>
```

The parent changes only `document.templateKey`; the content model remains unchanged.

The template gallery is intentionally separate from real templates. Cards remain lightweight selectors; clicking preview or use loads an actual resume template component with Angular bindings.

## Theming

Themes are CSS variables applied by the renderer:

```html
<div class="resume-stage" [ngStyle]="cssVariables(doc)">
  ...
</div>
```

```ts
cssVariables(document: ResumeDocument): Record<string, string> {
  return {
    '--resume-font': document.theme.fontFamily,
    '--resume-primary': document.theme.primaryColor,
    '--resume-secondary': document.theme.secondaryColor,
    '--resume-text': document.theme.textColor,
    '--resume-section-gap': `${document.theme.sectionSpacing}px`,
    '--resume-page-width': document.theme.pageSize === 'Letter' ? '216mm' : '210mm',
    '--resume-page-min-height': document.theme.pageSize === 'Letter' ? '279mm' : '297mm'
  };
}
```

Use the same variables in the static HTML generated for download/PDF so browser preview and exported output stay visually aligned.

## Frontend PDF: html2pdf

Use `PdfExportService` in `resume-ai-frontend/src/app/core/services/pdf-export.service.ts`.

```ts
@ViewChild('resumePaper') resumePaper?: ElementRef<HTMLElement>;

downloadPdf(): void {
  if (!this.resumePaper) {
    return;
  }
  this.pdfExportService.exportElementWithHtml2Pdf(
    this.resumePaper.nativeElement,
    'resume.pdf',
    'a4'
  );
}
```

```html
<div #resumePaper>
  <app-resume-template-renderer [document]="resumeDocument"></app-resume-template-renderer>
</div>
```

Pros:
- No backend round trip.
- Fast for drafts and free previews.
- Works offline after assets are loaded.

Cons:
- Canvas rendering can differ from browser print layout.
- Large resumes can be memory-heavy.
- Font loading and page breaks need careful testing.

## Backend PDF: Puppeteer

Puppeteer gives the most reliable WYSIWYG output because Chromium renders the same HTML/CSS that the user previews.

```js
import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json({ limit: '5mb' }));

app.post('/pdf', async (req, res) => {
  const { html, pageSize = 'A4' } = req.body;
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: pageSize,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    res.type('application/pdf').send(pdf);
  } finally {
    await browser.close();
  }
});

app.listen(3100);
```

Spring can call this rendering service from a controller/service, passing the same `generatedHtml` string already produced by the resume builder.

Pros:
- Best visual fidelity.
- Handles print CSS, fonts, colors, and page sizing consistently.
- Keeps premium/watermark enforcement on the server.

Cons:
- Requires backend infrastructure and browser sandboxing.
- Slower than client-side export.
- Needs queueing/rate limiting for high traffic.

## Best Practices

- Treat `ResumeDocument` as the only content source. Templates should never own data.
- Keep template components presentational and emit changes upward.
- Store `schemaVersion` and normalize old drafts before editing.
- Use CSS custom properties for all design tokens that affect export.
- Avoid template-specific fields in section data; put layout-only concerns in template components.
- Test PDF export with loaded fonts, A4 and Letter, long sections, and page breaks.
