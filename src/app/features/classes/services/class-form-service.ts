import { Service, signal, WritableSignal } from '@angular/core';
import {
  ClassItemFormModel,
  ClassReservationFormModel,
} from '../models/create-class-reservation-request';
import {
  createClassReservationForm,
  createEmptyClass,
  createEmptyClassReservation,
} from '../factories/class-factories';

@Service()
export class ClassFormService {
  reservationModel: WritableSignal<ClassReservationFormModel> = signal(
    createEmptyClassReservation(),
  );

  reservationForm = createClassReservationForm(this.reservationModel);

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
