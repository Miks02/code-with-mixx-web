import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCircleInfo,
  faSolidCircleQuestion,
  faSolidCircleXmark,
  faSolidTriangleExclamation,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Button } from '../../../shared/button/button';

export enum DialogResult {
  Confirmed,
  Cancelled,
}

export type DialogOptions = {
  title: string;
  message: string;
};

@Component({
  imports: [NgIcon, Button],
  providers: [
    provideIcons({
      faSolidXmark,
      faSolidCircleQuestion,
      faSolidCircleInfo,
      faSolidTriangleExclamation,
      faSolidCircleXmark,
    }),
  ],
  selector: 'app-dialog',
  styleUrl: './dialog.css',
  templateUrl: './dialog.html',
})
export class Dialog {
  options = input.required<DialogOptions>();
  closed = output<DialogResult>();

  onClose() {
    this.closed.emit(DialogResult.Cancelled);
  }

  onConfirm() {
    this.closed.emit(DialogResult.Confirmed);
  }
}
