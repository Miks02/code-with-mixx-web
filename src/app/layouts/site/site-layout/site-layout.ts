import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { UserState } from '@core/services/user-state';
import { Navbar } from '../navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-site-layout',
  styleUrl: './site-layout.css',
  templateUrl: './site-layout.html',
})
export class SiteLayout {
  private authService = inject(AuthService);
  private userState = inject(UserState);

  isAuthenticated = this.userState.isAuthenticated;

  onLogout(): void {
    this.authService.logoutMutation.mutate();
  }
}
