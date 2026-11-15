import { DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '@core/services/auth-service';
import { UserState } from '@core/services/user-state';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';

@Component({
  imports: [RouterOutlet, Navbar, Footer],
  selector: 'app-site-layout',
  // A full-height column, so the footer sits at the bottom even when the page is short or empty.
  host: { class: 'flex min-h-dvh flex-col' },
  styleUrl: './site-layout.css',
  templateUrl: './site-layout.html',
})
export class SiteLayout {
  private authService = inject(AuthService);
  private userState = inject(UserState);

  isAuthenticated = this.userState.isAuthenticated;

  constructor() {
    // The navbar is fixed, so anchor scrolling stops this many pixels above the target
    // instead of sliding it under the navbar.
    inject(ViewportScroller).setOffset([0, 64]);

    if (isPlatformBrowser(inject(PLATFORM_ID))) this.enableSmoothAnchorScrolling();
  }

  // Scrolling is smooth only when a navigation stays on the same page (nav links to a section,
  // a table of contents). NavigationEnd fires before the router scrolls, so the class is in
  // place in time. Moving to another page keeps the instant jump to the top.
  private enableSmoothAnchorScrolling(): void {
    const root = inject(DOCUMENT).documentElement;
    let previousPath: string | undefined;

    inject(Router)
      .events.pipe(
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
