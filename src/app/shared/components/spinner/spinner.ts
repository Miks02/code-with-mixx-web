import { Component, computed, input } from '@angular/core';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'primary' | 'light' | 'dark' | 'warning' | 'danger';

const SPINNER_SIZES: Record<SpinnerSize, string> = {
  xs: 'size-3 border-2',
  sm: 'size-4 border-2',
  md: 'size-6 border-[3px]',
  lg: 'size-10 border-4',
  xl: 'size-16 border-[5px]',
};

const SPINNER_VARIANTS: Record<SpinnerVariant, string> = {
  primary: 'border-emerald-700/25 border-t-emerald-700',
  light: 'border-emerald-100/25 border-t-emerald-100',
  dark: 'border-emerald-950/25 border-t-emerald-950',
  warning: 'border-amber-500/25 border-t-amber-500',
  danger: 'border-red-600/25 border-t-red-600',
};

@Component({
  selector: 'app-spinner',
  styleUrl: './spinner.css',
  templateUrl: './spinner.html',
})
export class Spinner {
  size = input<SpinnerSize>('md');
  variant = input<SpinnerVariant>('primary');
  label = input<string>('Učitavanje');

  classes = computed(
    () =>
      `inline-block shrink-0 rounded-full animate-spin ${SPINNER_SIZES[this.size()]} ${SPINNER_VARIANTS[this.variant()]}`,
  );
}
