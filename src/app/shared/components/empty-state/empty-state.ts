import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';

@Component({
  host: {
    class: 'flex w-full h-full justify-center items-center flex-col text-center my-4 md:my-0',
  },
  imports: [NgIcon],
  providers: [provideIcons({ faSolidXmark })],
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  icon = input('faSolidXmark');
  message = input<string>('Lista je prazna');
  description = input<string>();
}
