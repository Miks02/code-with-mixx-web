import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  imports: [RouterOutlet, Sidebar, Header],
  selector: 'app-dashboard-layout',
  styleUrl: './dashboard-layout.css',
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  private router = inject(Router);

  private mainContainer = viewChild<ElementRef<HTMLDivElement>>('mainContainer');
  private vantaRef = viewChild<ElementRef<HTMLDivElement>>('vantaRef');
  private vantaEffect: unknown;

  isSidebarOpen: WritableSignal<boolean> = signal(false);
  heading = signal(this.currentHeading());

  constructor() {
    THREE.ColorManagement.enabled = false;

    afterNextRender(() => {
      this.vantaEffect = FOG({
        el: this.vantaRef()!.nativeElement,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x10b981,
        midtoneColor: 0x065f46,
        lowlightColor: 0x064e3b,
        baseColor: 0x064e3b,
        blurFactor: 0.2,
        speed: 0.5,
        zoom: 1.0,
      });
    });

    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.heading.set(this.currentHeading());
        this.mainContainer()?.nativeElement.scrollTo({ top: 0 });
      });
  }

  private currentHeading(): string | undefined {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['heading'];
  }
}
