import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidSpinner } from '@ng-icons/font-awesome/solid';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ faSolidSpinner })],
  templateUrl: './button.html',
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  icon = input<string | null>(null);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  clicked = output<void>();

  isDisabled = computed(() => this.disabled() || this.loading());

  baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer';

  variantClasses = computed(() => {
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-emerald-700 text-white hover:bg-emerald-600 shadow-lg',
      secondary: 'bg-yellow-600 text-white hover:bg-yellow-800 shadow-lg',
      danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg',
      ghost: 'text-emerald-100 hover:opacity-70 hover:backdrop-blur-xl border border-emerald-200',
    };
    return variants[this.variant()];
  });

  sizeClasses = computed(() => {
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    return sizes[this.size()];
  });

  onClick(): void {
    if (this.isDisabled()) return;
    this.clicked.emit();
  }
}
