import { computed, effect, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { StudentLookup, StudentService } from '@features/students';
import { SubjectService } from '@features/subjects';
import { createClassReservationFormModel } from '@features/classes/factories/class-factories';
import { ClassFormService } from '@features/classes/services/class-form-service';
import { ClassService } from '@features/classes/services/class-service';

const isValidReservationId = (id: number | null): id is number =>
  id !== null && Number.isInteger(id) && id > 0;

type AdminClassReservationState = {
  reservationId: number | null;
};

export const AdminClassReservationStore = signalStore(
  withState<AdminClassReservationState>(() => {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    return { reservationId: id === null ? null : Number(id) };
  }),
  withProps(
    (
      store,
      classService = inject(ClassService),
      studentService = inject(StudentService),
      subjectService = inject(SubjectService),
    ) => ({
      detailsQuery: classService.getClassReservationDetailsQuery(
        computed(() => {
          const id = store.reservationId();
          return isValidReservationId(id) ? id : 0;
        }),
      ),
      studentsLookupQuery: studentService.getStudentsLookupQuery(),
      subjectsLookupQuery: subjectService.getSubjectsLookupQuery(),
      _formService: inject(ClassFormService),
      _createMutation: classService.createClassReservationMutation,
      _updateMutation: classService.updateClassReservationMutation,
    }),
  ),
  withComputed((store) => ({
    isEditMode: computed(() => store.reservationId() !== null),
    isSaving: computed(
      () => store._createMutation.isPending() || store._updateMutation.isPending(),
    ),
    details: computed(() => store.detailsQuery.data()),
    availableStudents: computed(() => store.studentsLookupQuery.data()),
    subjects: computed(() => store.subjectsLookupQuery.data()),
    selectedStudent: computed(
      () =>
        store.studentsLookupQuery
          .data()
          ?.find((student) => student.id === store._formService.reservationModel().studentId) ??
        null,
    ),
  })),
  withComputed((store) => ({
    isNotFound: computed(() => {
      const id = store.reservationId();
      if (id === null) return false;
      if (!isValidReservationId(id)) return true;
      return store.detailsQuery.error()?.errorCode === 'Reservation.NotFound';
    }),
    isLoadError: computed(
      () =>
        store.detailsQuery.isError() &&
        store.detailsQuery.error()?.errorCode !== 'Reservation.NotFound',
    ),
    totalPaid: computed(() =>
      store.isEditMode() ? (store.details()?.paidAmount ?? 0) : undefined,
    ),
  })),
  withMethods((store) => ({
    selectStudent(student: StudentLookup | null) {
      store._formService.reservationForm.studentId().value.set(student?.id ?? '');
    },
  })),
  withHooks({
    onInit(store) {
      const router = inject(Router);

      effect(() => {
        if (!store.isLoadError()) return;
        untracked(() => router.navigate(['/admin/classes']));
      });

      effect(() => {
        const details = store.details();
        if (!details) return;

        untracked(() =>
          store._formService.reservationModel.set(createClassReservationFormModel(details)),
        );
      });
    },
  }),
);
