import { computed, effect, inject, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { signalStore, withComputed, withHooks, withProps, withState } from '@ngrx/signals';
import { PaymentService } from '@features/payments';
import { ClassService } from '@features/classes/services/class-service';

const isValidReservationId = (id: number): boolean => Number.isInteger(id) && id > 0;

type AdminClassReservationDetailsState = {
  reservationId: number;
};

export const AdminClassReservationDetailsStore = signalStore(
  withState<AdminClassReservationDetailsState>(() => ({
    reservationId: Number(inject(ActivatedRoute).snapshot.paramMap.get('id')),
  })),
  withComputed((store) => ({
    _validReservationId: computed(() =>
      isValidReservationId(store.reservationId()) ? store.reservationId() : 0,
    ),
  })),
  withProps(
    (store, classService = inject(ClassService), paymentService = inject(PaymentService)) => ({
      detailsQuery: classService.getClassReservationDetailsQuery(store._validReservationId),
      paymentHistoryQuery: paymentService.getAdminPaymentHistoryForReservationQuery(
        store._validReservationId,
        computed(() => store._validReservationId() > 0),
      ),
    }),
  ),
  withComputed((store) => ({
    details: computed(() => store.detailsQuery.data()),
    detailsPending: computed(() => store.detailsQuery.isPending()),
    paymentHistory: computed(() => store.paymentHistoryQuery.data()),
    paymentHistoryPending: computed(() => store.paymentHistoryQuery.isPending()),
    isNotFound: computed(
      () =>
        store._validReservationId() === 0 ||
        store.detailsQuery.error()?.errorCode === 'Reservation.NotFound',
    ),
    isLoadError: computed(
      () =>
        store.detailsQuery.isError() &&
        store.detailsQuery.error()?.errorCode !== 'Reservation.NotFound',
    ),
  })),
  withHooks({
    onInit(store) {
      const router = inject(Router);

      effect(() => {
        if (!store.isLoadError()) return;
        untracked(() => router.navigate(['/admin/classes']));
      });
    },
  }),
);
