import { Component, input } from '@angular/core';

@Component({
  host: {
    class: 'flex flex-col gap-4 bg-emerald-950/80 p-4 rounded-lg shadow-lg h-full',
  },
  selector: 'app-panel',
  templateUrl: './panel.html',
})
export class Panel {
  title = input.required<string>();
  count = input<number>();
}
