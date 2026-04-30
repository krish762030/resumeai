import { Injectable } from '@angular/core';

interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { type: 'jpeg' | 'png'; quality: number };
  html2canvas: {
    scale: number;
    useCORS: boolean;
    backgroundColor: string;
    windowWidth?: number;
  };
  jsPDF: {
    unit: 'mm';
    format: 'a4' | 'letter';
    orientation: 'portrait' | 'landscape';
  };
  pagebreak: {
    mode: string[];
    avoid: string[];
  };
}

interface Html2PdfWorker {
  set(options: Html2PdfOptions): Html2PdfWorker;
  from(element: HTMLElement): Html2PdfWorker;
  save(): Promise<void>;
}

type Html2PdfFactory = () => Html2PdfWorker;

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly resumeCssVariables = [
    '--resume-font',
    '--resume-primary',
    '--resume-secondary',
    '--resume-text',
    '--resume-section-gap',
    '--resume-page-width',
    '--resume-page-min-height'
  ];

  private readonly resolvedStyleProperties = [
    'color',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'text-decoration-color',
    'font-family',
    'font-size',
    'font-weight',
    'line-height'
  ];

  async exportElementWithHtml2Pdf(
    element: HTMLElement,
    filename: string,
    format: 'a4' | 'letter' = 'a4'
  ): Promise<void> {
    await this.waitForFonts(element.ownerDocument);
    const html2pdf = await this.loadHtml2Pdf();
    const exportTarget = this.createExportTarget(element);

    try {
      return await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'png', quality: 1 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth
          },
          jsPDF: {
            unit: 'mm',
            format,
            orientation: 'portrait'
          },
          pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['.resume-entry', '.resume-document-section']
          }
        })
        .from(exportTarget.element)
        .save();
    } finally {
      exportTarget.cleanup();
    }
  }

  async exportHtmlWithHtml2Pdf(
    html: string,
    filename: string,
    format: 'a4' | 'letter' = 'a4'
  ): Promise<void> {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = format === 'letter' ? '816px' : '794px';
    iframe.style.height = format === 'letter' ? '1056px' : '1123px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    try {
      const iframeDocument = iframe.contentDocument;
      if (!iframeDocument) {
        throw new Error('Unable to create PDF render frame.');
      }

      iframeDocument.open();
      iframeDocument.write(html);
      iframeDocument.close();
      await this.waitForFrame(iframe);

      const target = iframeDocument.querySelector('.resume-page') as HTMLElement | null;
      await this.exportElementWithHtml2Pdf(target ?? iframeDocument.body, filename, format);
    } finally {
      iframe.remove();
    }
  }

  private async loadHtml2Pdf(): Promise<Html2PdfFactory> {
    const imported = await import('html2pdf.js') as { default?: Html2PdfFactory } | Html2PdfFactory;
    return typeof imported === 'function' ? imported : imported.default as Html2PdfFactory;
  }

  private async waitForFrame(iframe: HTMLIFrameElement): Promise<void> {
    await new Promise<void>((resolve) => {
      if (iframe.contentDocument?.readyState === 'complete') {
        resolve();
        return;
      }
      iframe.onload = () => resolve();
      window.setTimeout(resolve, 150);
    });
    await this.waitForFonts(iframe.contentDocument ?? document);
  }

  private async waitForFonts(ownerDocument: Document): Promise<void> {
    const fonts = ownerDocument.fonts;
    if (fonts) {
      await fonts.ready;
    }
  }

  private createExportTarget(source: HTMLElement): { element: HTMLElement; cleanup: () => void } {
    const ownerDocument = source.ownerDocument;
    const container = ownerDocument.createElement('div');
    const clone = source.cloneNode(true) as HTMLElement;
    const sourceStyle = getComputedStyle(source);

    this.copyResolvedStyles(source, clone);
    clone.style.width = sourceStyle.width;
    clone.style.minHeight = sourceStyle.minHeight;
    clone.style.boxShadow = 'none';

    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.background = '#ffffff';
    container.style.opacity = '1';
    container.style.pointerEvents = 'none';
    container.appendChild(clone);
    ownerDocument.body.appendChild(container);

    return {
      element: clone,
      cleanup: () => container.remove()
    };
  }

  private copyResolvedStyles(source: HTMLElement, clone: HTMLElement): void {
    const computed = getComputedStyle(source);

    this.resumeCssVariables.forEach((variable) => {
      const value = computed.getPropertyValue(variable);
      if (value) {
        clone.style.setProperty(variable, value.trim());
      }
    });

    this.resolvedStyleProperties.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value) {
        clone.style.setProperty(property, value);
      }
    });

    const sourceChildren = Array.from(source.children).filter(this.isElement);
    const cloneChildren = Array.from(clone.children).filter(this.isElement);
    sourceChildren.forEach((child, index) => {
      const clonedChild = cloneChildren[index];
      if (clonedChild) {
        this.copyResolvedStyles(child, clonedChild);
      }
    });
  }

  private isElement(value: Element): value is HTMLElement {
    return value instanceof HTMLElement;
  }
}
