import { Component, computed, effect, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCheck,
  faSolidTriangleExclamation,
  faSolidInfo,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { compute } from 'three/src/nodes/TSL.js';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
  message: string;
  duration: number;
  type: ToastType;
};

type ToastStyle = {
  icon: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
};

const TOAST_STYLES: Record<ToastType, ToastStyle> = {
  success: {
    icon: 'faSolidCheck',
    bgColor: ' bg-emerald-800/80',
    accentColor: 'bg-emerald-500/20',
    textColor: 'text-emerald-100',
  },
  error: {
    icon: 'faSolidXmark',
    bgColor: 'bg-red-700/60',
    accentColor: 'bg-red-500/20',
    textColor: 'text-red-100',
  },
  info: {
    icon: 'faSolidInfo',
    bgColor: 'bg-sky-700/80',
    accentColor: 'bg-sky-500/20',
    textColor: 'text-sky-100',
  },
  warning: {
    icon: 'faSolidTriangleExclamation',
    bgColor: 'bg-amber-700/80',
    accentColor: 'bg-amber-500/20',
    textColor: 'text-amber-100',
  },
};

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({ faSolidCheck, faSolidTriangleExclamation, faSolidInfo, faSolidXmark }),
  ],
  selector: 'app-toast',
  styleUrl: './toast.css',
  templateUrl: './toast.html',
})
export class Toast {
  options = input.required<ToastOptions>();
  closed = output<void>();
  style = computed(() => TOAST_STYLES[this.options().type]);

  closing = signal(false);

  constructor() {
    effect(() => {
      const closing = this.closing();
      if (closing || !this.options().duration) return;

      setTimeout(() => {
        this.closing.set(true);
      }, this.options().duration);
    });
  }

  onClose() {
    this.closed.emit();
  }
}
