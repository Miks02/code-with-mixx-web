import {
    ComponentRef,
    DOCUMENT,
    inject,
    inputBinding,
    Service
} from '@angular/core';
import { Toast, ToastOptions } from '../components/toast/toast';
import { ComponentMounter } from './component-mounter';

type ToastData = {
  ref: ComponentRef<Toast>;
  scheduledDuration: number;
};

@Service()
export class ToastService {
  private mounter = inject(ComponentMounter);
  private document = inject(DOCUMENT);
  private readonly defaultDuration = 4000;
  private toasts: ToastData[] = [];

  showSuccess(message: string, duration = this.defaultDuration) {
    this.createToastRef({ message: message, type: 'success', duration: duration });
  }

  showError(message: string, duration = this.defaultDuration * 2) {
    this.createToastRef({ message: message, type: 'error', duration: duration });
  }

  showInfo(message: string, duration = this.defaultDuration) {
    this.createToastRef({ message: message, type: 'info', duration: duration });
  }

  showWarning(message: string, duration = this.defaultDuration) {
    this.createToastRef({ message: message, type: 'warning', duration: duration });
  }

  private createToastRef(options: ToastOptions) {
    const toastContainer = this.ensureContainer();
    let isDismissed = false;

    const scheduledDuration = this.calculateDuration(options.duration);

    const toastRef = this.mounter.mount(Toast, {
      bindings: [
        inputBinding('options', (): ToastOptions => ({
          ...options,
          duration: scheduledDuration,
        })),
      ],
      container: toastContainer,
    });

    this.toasts.push({ ref: toastRef, scheduledDuration });

    const timeoutDuration = scheduledDuration + 200;

    const closedSubscription = toastRef.instance.closed.subscribe(() => {
      isDismissed = true;
      closedSubscription.unsubscribe();
      this.dismissToast(toastRef);
    });

    setTimeout(() => {
      if (!isDismissed) {
        this.dismissToast(toastRef);
      }
    }, timeoutDuration);
    return toastRef;
  }

  private dismissToast(toastRef: ComponentRef<Toast>) {
    toastRef.destroy();
    this.toasts = this.toasts.filter((t) => t.ref !== toastRef);
    return toastRef;
  }

  private ensureContainer(): HTMLElement {
    let container = this.document.getElementById('toast-container');
    if (!container) {
      container = this.document.createElement('div');
      container.id = 'toast-container';
      container.style =
        'position: fixed; top: 5px; right: 0px; z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;';
      this.document.body.appendChild(container);
    }
    return container;
  }

  private calculateDuration(duration: number): number {
    if (this.toasts.length < 1) return duration;

    const previous = this.toasts[this.toasts.length - 1];
    return previous.scheduledDuration + 1200;
  }
}
