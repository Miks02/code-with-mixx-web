import { DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth-service';
import { SeoService } from '@core/services/seo-service';
import { UserState } from '@core/services/user-state';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  imports: [RouterOutlet, Navbar, Footer],
  selector: 'app-site-layout',
  host: { class: 'flex min-h-dvh flex-col' },
  styleUrl: './site-layout.css',
  templateUrl: './site-layout.html',
})
export class SiteLayout {
  private authService = inject(AuthService);
  private userState = inject(UserState);
  private router = inject(Router);
  private seoService = inject(SeoService);

  isAuthenticated = this.userState.isAuthenticated;

  constructor() {
    // The navbar is fixed, so anchor scrolling stops this many pixels above the target
    // instead of sliding it under the navbar.
    inject(ViewportScroller).setOffset([0, 64]);

    this.keepSeoTagsInSync();

    if (isPlatformBrowser(inject(PLATFORM_ID))) this.enableSmoothAnchorScrolling();
  }

  private keepSeoTagsInSync(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const page = this.deepestRoute(this.router.routerState.snapshot.root);

        this.seoService.setStructuredData(page.data['structuredData']);

        if (page.routeConfig?.path === '**') {
          this.seoService.clearPageUrl();
        } else {
          this.seoService.updatePage(
            event.urlAfterRedirects,
            page.title ?? '',
            page.data['description'] ?? '',
          );
        }
      });
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (route.firstChild) route = route.firstChild;
    return route;
  }

  private enableSmoothAnchorScrolling(): void {
    const root = inject(DOCUMENT).documentElement;
    let previousPath: string | undefined;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        root.classList.toggle('smooth-scroll', path === previousPath);
        previousPath = path;
      });
  }

  onLogout(): void {
    this.authService.logoutMutation.mutate();
  }
}
