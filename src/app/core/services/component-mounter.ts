import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  Binding,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injector,
  Service,
  Type,
} from '@angular/core';
import { Toast } from '../components/toast/toast';

export type MountOptions = {
  bindings?: Binding[];
  elementInjector?: Injector;
  container?: HTMLElement;
};

@Service()
export class ComponentMounter {
  private appRef = inject(ApplicationRef);
  private document = inject(DOCUMENT);
  private injector = inject(EnvironmentInjector);

  mount<T>(component: Type<T>, options: MountOptions): ComponentRef<T> {
    const ref = createComponent(component, {
      environmentInjector: this.injector,
      elementInjector: options.elementInjector,
      bindings: options.bindings,
    });

    this.appRef.attachView(ref.hostView);

    const host = ref.location.nativeElement;
    if (options.container) {
      options.container.appendChild(host);
    } else {
      this.document.body.appendChild(host);
    }

    ref.onDestroy(() => host.remove());

    return ref;
  }
}
