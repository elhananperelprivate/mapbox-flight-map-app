import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: 'input[dynamic-date-input]'
})
export class DynamicDateInputDirective {

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('focus')
  handleFocus() {
    this.renderer.setAttribute(this.elementRef.nativeElement, 'type', 'date');
    this.renderer.addClass(this.elementRef.nativeElement, 'no-border');
  }

  @HostListener('blur')
  handleBlur() {
    if (this.elementRef.nativeElement.value == "") {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'type', 'text');
      this.renderer.removeClass(this.elementRef.nativeElement, 'no-border');
    }
  }
}
