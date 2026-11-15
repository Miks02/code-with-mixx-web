import { Location } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
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

  constructor() {
    THREE.ColorManagement.enabled = false;

    // Same fog as the home hero. Browser-only, so it starts after the first render.
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

  // Going back only makes sense when the visitor got here from another page of the site.
  // Someone arriving straight from a search result or an old link would leave the site,
  // so they go to the home page instead.
  goBack(): void {
    if (this.router.lastSuccessfulNavigation()?.previousNavigation) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
