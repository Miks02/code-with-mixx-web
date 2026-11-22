import {
  afterNextRender,
  Directive,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
} from '@angular/core';

@Directive({
  selector: '[appScrollIntoViewOn]',
})
export class ScrollIntoViewOn {
  appScrollIntoViewOn = input.required<number>();

  private injector = inject(Injector);
  private host = inject<ElementRef>(ElementRef);

  constructor() {
    effect(() => {
      const trackedSignal = this.appScrollIntoViewOn();
      if (!trackedSignal) return;

      afterNextRender(
        () => {
          const el = this.host.nativeElement;

          el.scrollIntoView({ behavior: 'smooth' });
        },
        { injector: this.injector },
      );
    });
  }
}
