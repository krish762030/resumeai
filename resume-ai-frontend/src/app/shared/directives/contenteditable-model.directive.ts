import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[appContenteditableModel]'
})
export class ContenteditableModelDirective implements OnChanges {
  @Input('appContenteditableModel') model = '';
  @Input() appContenteditableEnabled = true;
  @Output('appContenteditableModelChange') readonly modelChange = new EventEmitter<string>();

  private focused = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {
  }

  @HostBinding('attr.contenteditable')
  get editable(): string | null {
    return this.appContenteditableEnabled ? 'true' : null;
  }

  @HostBinding('attr.spellcheck')
  get spellcheck(): string | null {
    return this.appContenteditableEnabled ? 'true' : null;
  }

  @HostBinding('class.inline-editable')
  get editableClass(): boolean {
    return this.appContenteditableEnabled;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['model'] || changes['appContenteditableEnabled']) && !this.focused) {
      this.writeText(this.model ?? '');
    }
  }

  @HostListener('focus')
  onFocus(): void {
    this.focused = true;
  }

  @HostListener('blur')
  onBlur(): void {
    this.focused = false;
    this.emitText();
  }

  @HostListener('input')
  onInput(): void {
    this.emitText();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (!this.appContenteditableEnabled) {
      return;
    }

    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') ?? '';
    document.execCommand('insertText', false, text);
  }

  private emitText(): void {
    if (!this.appContenteditableEnabled) {
      return;
    }
    this.modelChange.emit(this.elementRef.nativeElement.innerText.trim());
  }

  private writeText(value: string): void {
    const element = this.elementRef.nativeElement;
    if (element.innerText !== value) {
      element.innerText = value;
    }
  }
}

