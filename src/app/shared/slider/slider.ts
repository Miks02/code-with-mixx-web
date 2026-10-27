import { Component, computed, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

let nextSliderId = 0;

@Component({
  host: { class: 'block w-full' },
  selector: 'app-slider',
  styleUrl: './slider.css',
  templateUrl: './slider.html',
})
export class Slider implements FormValueControl<number> {
  value = model<number>(0);
  label = input<string>();
  showValue = input<boolean>(true);
  unit = input<string>('%');
  ariaLabel = input<string>();
  min = input<number | undefined>(0);
  max = input<number | undefined>(100);
  step = input<number>(1);
  disabled = input<boolean>(false);
  touch = output<void>();

  inputId = `app-slider-${nextSliderId++}`;
  minValue = computed(() => this.min() ?? 0);
  maxValue = computed(() => this.max() ?? 100);
  fillRatio = computed(() => {
    const range = this.maxValue() - this.minValue();
    if (range <= 0) {
      return 0;
    }
    return Math.min(1, Math.max(0, (this.value() - this.minValue()) / range));
  });

  onInput(event: Event) {
    this.value.set((event.target as HTMLInputElement).valueAsNumber);
  }
}
