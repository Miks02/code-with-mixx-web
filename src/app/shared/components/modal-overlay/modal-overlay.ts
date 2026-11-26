import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidXmark })],
  selector: 'app-modal-overlay',
  templateUrl: './modal-overlay.html',
})
export class ModalOverlay {
  title = input.required<string>();
  subtitle = input<string>();
  isLoading = input<boolean>(false);

  closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}
