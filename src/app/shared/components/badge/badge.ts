import { Component, computed, input } from '@angular/core';

@Component({
  host: { class: 'shrink-0' },
  selector: 'app-badge',
  templateUrl: './badge.html',
})
export class Badge {
  text = input.required<string | number>();
  color = input<string>('bg-emerald-800 text-emerald-100');

  classes = computed(
    () =>
      `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${this.color()}`,
  );
}
