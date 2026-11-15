import { DOCUMENT, inject, Service } from '@angular/core';
import { environment } from '@environments/environment';

@Service()
export class CanonicalService {
  private document = inject(DOCUMENT);
  
  set(url: string): void {
    const href = environment.siteUrl + url.split(/[?#]/)[0];

    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  remove(): void {
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
  }
}
