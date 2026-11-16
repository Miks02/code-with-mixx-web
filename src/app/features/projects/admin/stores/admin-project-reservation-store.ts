import { computed, effect, inject, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { createReservationFormModel } from '@features/projects/factories/project-factories';
import { ProjectFormService } from '@features/projects/services/project-form-service';
import { ProjectService } from '@features/projects/services/project-service';

type AdminProjectReservationState = {
  reservationId: number | null;
};

export const AdminProjectReservationStore = signalStore(
  withState<AdminProjectReservationState>(() => {
    const id = inject(ActivatedRoute).snapshot.paramMap.get('id');
    return { reservationId: id === null ? null : Number(id) };
  }),
  withProps(
    (
      store,
      projectService = inject(ProjectService),
      studentService = inject(StudentService),
      subjectService = inject(SubjectService),
    ) => ({
      detailsQuery: projectService.getProjectReservationDetailsQuery(
        computed(() => store.reservationId() ?? 0),
      ),
      studentsLookupQuery: studentService.getStudentsLookupQuery,
      subjectsLookupQuery: subjectService.getSubjectsLookupQuery(),
      _formService: inject(ProjectFormService),
    }),
  ),
  withComputed((store) => ({
    isEditMode: computed(() => store.reservationId() !== null),
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
      effect(() => {
        const details = store.details();
        if (!details) return;

        untracked(() =>
          store._formService.reservationModel.set(createReservationFormModel(details)),
        );
      });
    },
  }),
);
