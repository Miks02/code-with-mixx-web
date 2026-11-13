import { Component, input } from '@angular/core';
import { Spinner } from '@shared/components/spinner/spinner';

@Component({
  imports: [Spinner],
  selector: 'app-loading-overlay',
  styleUrl: './loading-overlay.css',
  templateUrl: './loading-overlay.html',
})
export class LoadingOverlay {
  message = input<string>('Učitavanje...');
}
