import { computed, inject, Service, signal, WritableSignal } from '@angular/core';
import { submit } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast-service';
import { ReservationCheck } from '@features/reservations';
import {
  ClassItemFormModel,
  ClassReservationFormModel,
} from '../models/create-class-reservation-request';
import {
  createClassReservationForm,
  createClassReservationRequest,
  createEmptyClass,
  createEmptyClassReservation,
  createUpdateClassReservationRequest,
} from '../factories/class-factories';
import { getClassReservationErrorMessage } from '../utilities/class-error-messages';
import { ClassService } from './class-service';

@Service()
export class ClassFormService {
  reservationModel: WritableSignal<ClassReservationFormModel> = signal(
    createEmptyClassReservation(),
  );

  reservationForm = createClassReservationForm(this.reservationModel);

  private classService = inject(ClassService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  itemsTotal = computed(() =>
    this.reservationModel().classes.reduce((sum, classItem) => sum + (classItem.price || 0), 0),
  );
  totalPrice = computed(() => this.reservationModel().totalPrice ?? this.itemsTotal());

  private isManualPrice = signal(false);

  useItemsSum = computed(
    () => !this.isManualPrice() && this.reservationModel().totalPrice === null,
  );

  setUseItemsSum(useItemsSum: boolean) {
    this.isManualPrice.set(!useItemsSum);
    this.reservationForm.totalPrice().value.set(useItemsSum ? null : this.itemsTotal());
  }

  checks = computed<ReservationCheck[]>(() => {
    const classes = this.reservationModel().classes;

    return [
      {
        isValid: this.reservationForm.studentId().valid(),
        validLabel: 'Student je izabran',
        invalidLabel: 'Student nije izabran',
      },
      {
        isValid: classes.length > 0,
        validLabel: 'Rezervacija ima bar jedan čas',
        invalidLabel: 'Rezervacija nema nijedan čas',
      },
      {
        isValid: this.reservationForm.classes().valid(),
        validLabel: 'Polja svih časova su ispravna',
        invalidLabel: 'Neka polja časova nisu ispravna',
      },
      {
        isValid: classes.every((classItem) => classItem.subjectId !== 0),
        validLabel: 'Svi časovi imaju izabrani predmet.',
        invalidLabel: 'Svi časovi moraju imati izabrani predmet.',
      },
    ];
  });

  save(reservationId: number | null) {
    return submit(this.reservationForm, async () => {
      const model = this.reservationModel();

      try {
        if (reservationId !== null) {
          await this.classService.updateClassReservationMutation.mutateAsync(
            createUpdateClassReservationRequest(reservationId, model),
          );
          this.toastService.showSuccess('Rezervacija je uspešno ažurirana.');
        } else {
          await this.classService.createClassReservationMutation.mutateAsync(
            createClassReservationRequest(model),
          );
          this.toastService.showSuccess('Rezervacija je uspešno kreirana.');
        }
        this.router.navigateByUrl('/admin/classes');
      } catch (err) {
        const message = getClassReservationErrorMessage(err);
        if (message) this.toastService.showError(message);
      }
    });
  }

  addClass() {
    const lastClass = this.reservationModel().classes.at(-1);
    const startsAt = lastClass?.endsAt ? new Date(lastClass.endsAt) : new Date();

    this.reservationModel.update((prev) => ({
      ...prev,
      classes: [...prev.classes, createEmptyClass(startsAt)],
    }));
  }

  reset() {
    this.reservationModel.set(createEmptyClassReservation());
    this.reservationForm().reset();
  }

  removeClass(classIndex: number) {
    if (this.reservationModel().classes.length <= 1) return;

    const classToDelete = this.reservationModel().classes[classIndex];
    if (!classToDelete) return;

    this.reservationModel.update((prev) => ({
      ...prev,
      classes: prev.classes.filter((_, index) => index !== classIndex),
      classesToDelete: classToDelete.id
        ? [...prev.classesToDelete, classToDelete.id]
        : prev.classesToDelete,
    }));
  }

  updateClass(classIndex: number, changes: Partial<ClassItemFormModel>) {
    this.reservationModel.update((prev) => ({
      ...prev,
      classes: prev.classes.map((classItem, index) =>
        index === classIndex ? { ...classItem, ...changes } : classItem,
      ),
    }));
  }
}
