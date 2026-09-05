import { afterNextRender, Component, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { NgIcon } from '@ng-icons/core';

@Component({
  imports: [RouterOutlet, Sidebar, Header, NgIcon],
  selector: 'app-dashboard-layout',
  styleUrl: './dashboard-layout.css',
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  @ViewChild('vantaRef') vantaRef!: ElementRef<HTMLDivElement>;
  private vantaEffect: any;

  isSidebarOpen: WritableSignal<boolean> = signal(false);

  constructor() {
    THREE.ColorManagement.enabled = false;

    afterNextRender(() => {
      this.vantaEffect = FOG({
        el: this.vantaRef.nativeElement,
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
  }
}
