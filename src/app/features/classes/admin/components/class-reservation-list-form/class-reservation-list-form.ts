import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  viewChild,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPlus, faSolidTrash } from '@ng-icons/font-awesome/solid';
import { timeConverter } from '@core/utilities/date-helpers';
import { priceConverter } from '@core/utilities/price-helpers';
import { Button } from '@shared/components/button/button';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { SubjectLookupItem } from '@features/subjects';
import { ClassFormService } from '@features/classes/services/class-form-service';

@Component({
  imports: [Button, NgIcon, FormField, NgTemplateOutlet, SrDatePipe],
  providers: [provideIcons({ faSolidPlus, faSolidTrash })],
  selector: 'app-class-reservation-list-form',
  styleUrl: './class-reservation-list-form.css',
  templateUrl: './class-reservation-list-form.html',
})
export class ClassReservationListForm {
  subjectsLookup = input.required<SubjectLookupItem[] | undefined>();

  classFormService = inject(ClassFormService);
  private injector = inject(Injector);

  classesContainer = viewChild.required<ElementRef<HTMLElement>>('classesContainer');

  classes = computed(() => this.classFormService.reservationModel().classes);
  classesForm = this.classFormService.reservationForm.classes;

  private subjectNames = computed(
    () => new Map(this.subjectsLookup()?.map((s) => [s.id, s.subjectName]) ?? []),
  );

  priceConverter = priceConverter;
  timeConverter = timeConverter;

  constructor() {
    if (!this.classes().length) this.classFormService.addClass();
  }

  subjectName(subjectId: number) {
    return this.subjectNames().get(subjectId);
  }

  addClass() {
    this.classFormService.addClass();

    afterNextRender(
      () => {
        const container = this.classesContainer().nativeElement;
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      },
      { injector: this.injector },
    );
  }

  removeClass(classIndex: number) {
    this.classFormService.removeClass(classIndex);
  }

  onSubjectChanged(classIndex: number, event: Event) {
    const subjectId = Number((event.target as HTMLSelectElement).value);
    if (!this.subjectNames().has(subjectId)) return;

    this.classFormService.updateClass(classIndex, { subjectId });
  }
}
