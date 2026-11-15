import { DOCUMENT, inject, Service } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from '@environments/environment';

@Service()
export class SeoService {
  private document = inject(DOCUMENT);
  private meta = inject(Meta);

  updatePage(url: string, title: string, description: string): void {
    const pageUrl = environment.siteUrl + url.split(/[?#]/)[0];

    this.setCanonical(pageUrl);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: `${environment.siteUrl}/og-image.png` });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: 'CodeWithMixx logo' });
  }

  setStructuredData(data: object | undefined): void {
    let script = this.document.head.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"]',
    );

    if (!data) {
      script?.remove();
      return;
    }

    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }

  clearPageUrl(): void {
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
    this.meta.removeTag("property='og:url'");
  }

  private setCanonical(href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
