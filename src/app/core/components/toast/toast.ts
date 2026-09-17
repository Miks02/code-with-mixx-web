import { Component, computed, effect, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    faSolidCheck,
    faSolidInfo,
    faSolidTriangleExclamation,
    faSolidXmark,
} from '@ng-icons/font-awesome/solid';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastOptions = {
  title?: string;
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

const TOAST_TITLES: Record<ToastType, string> = {
  success: 'Uspeh',
  error: 'Greška',
  info: 'Informacija',
  warning: 'Upozorenje',
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
  title = computed(() => {
    const title = this.options().title;
    
    return title ?? TOAST_TITLES[this.options().type];
  });

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
