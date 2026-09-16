import {
    Binding,
    ComponentRef,
    inject,
    inputBinding,
    outputBinding,
    Service
} from '@angular/core';
import { Dialog, DialogOptions, DialogResult } from '../components/dialog/dialog';
import { ComponentMounter } from './component-mounter';

@Service()
export class DialogService {
  private mounter = inject(ComponentMounter);
  private dialogRef: ComponentRef<Dialog> | null = null;

  showDialog(options: DialogOptions): Promise<DialogResult> {
    this.closeDialog();
    
    return new Promise((resolve) => {
      const dialogRef = this.mounter.mount(Dialog, {
        bindings: [
          inputBinding('options', () => options),
          outputBinding<DialogResult>('closed', (result) => {
            dialogRef.destroy();
            this.dialogRef = null;
            resolve(result);
          }),
        ],
      });
      this.dialogRef = dialogRef;
    })
  }

  closeDialog() {
    if(!this.dialogRef) return;
    this.dialogRef.instance.onClose();
  }
}
