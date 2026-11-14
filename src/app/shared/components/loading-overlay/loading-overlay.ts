import { Component, computed, input } from '@angular/core';
import { Spinner } from '@shared/components/spinner/spinner';

type BlurClass = 'blur-sm' | 'blur-md' | 'blur-lg' | 'blur-xl' | 'blur-2xl';

const BLUR_CLASSES: Record<BlurClass, string> = {
  'blur-sm': 'backdrop-blur-sm',
  'blur-md': 'backdrop-blur-md',
  'blur-lg': 'backdrop-blur-lg',
  'blur-xl': 'backdrop-blur-xl',
  'blur-2xl': 'backdrop-blur-2xl',
};

@Component({
  imports: [Spinner],
  selector: 'app-loading-overlay',
  styleUrl: './loading-overlay.css',
  templateUrl: './loading-overlay.html',
})
export class LoadingOverlay {
  message = input<string>('Učitavanje...');
  blur = input<BlurClass>('blur-sm');

  blurClass = computed(() => BLUR_CLASSES[this.blur()]);
  
}
