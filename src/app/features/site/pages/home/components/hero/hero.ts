import { afterNextRender, Component, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';

@Component({
  imports: [],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero {
  @ViewChild('hero') vantaRef!: ElementRef<HTMLDivElement>;
  private vantaEffect: unknown;

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
