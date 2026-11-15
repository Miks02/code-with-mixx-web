import { Location } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  RESPONSE_INIT,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';

@Component({
  imports: [Button],
  providers: [provideIcons({ faSolidArrowLeft })],
  selector: 'app-not-found',
  host: { class: 'flex flex-1 flex-col' },
  styleUrl: './not-found.css',
  templateUrl: './not-found.html',
})
export class NotFound {
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  private fogRef = viewChild.required<ElementRef<HTMLDivElement>>('fog');

  private responseInit = inject(RESPONSE_INIT, { optional: true });

  previousNavigation = this.router.lastSuccessfulNavigation()?.previousNavigation;
  backButtonTitle = this.previousNavigation ? 'Nazad' : 'Početna';

  constructor() {
    if (this.responseInit) {
      this.responseInit.status = 404;
    }
    
    THREE.ColorManagement.enabled = false;

    afterNextRender(() => {
      const effect = FOG({
        el: this.fogRef().nativeElement,
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

      this.destroyRef.onDestroy(() => effect.destroy());
    });
  }

  goBack(): void {
    if (this.previousNavigation) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
