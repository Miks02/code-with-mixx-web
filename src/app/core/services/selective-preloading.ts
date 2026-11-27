import { inject, Service } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserState } from './user-state';

@Service()
export class SelectivePreloading implements PreloadingStrategy {
  private userState = inject(UserState);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const preloader = route.data?.['preloading'];

    if (!this.userState.isAuthenticated()) return of(null);

    if (this.userState.isStudent() && preloader === 'student') return load();

    if (this.userState.isAdmin() && preloader === 'admin') return load();

    return of(null);
  }
}
