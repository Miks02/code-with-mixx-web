import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const MODAL_SIZES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-md sm:max-w-xl',
  '2xl': 'max-w-md sm:max-w-2xl',
};

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidXmark })],
  selector: 'app-modal-overlay',
  templateUrl: './modal-overlay.html',
})
export class ModalOverlay {
  isOpen = input.required<boolean>();
  title = input.required<string>();
  subtitle = input<string>();
  isLoading = input<boolean>(false);
  size = input<ModalSize>('md');

  closed = output<void>();

  sizeClass = computed(() => MODAL_SIZES[this.size()]);

  onClose(): void {
    this.closed.emit();
  }
}
