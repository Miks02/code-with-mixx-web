import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCalendarPlus, faSolidCheck, faSolidEnvelope } from '@ng-icons/font-awesome/solid';
import { SrDatePipe } from '@shared/pipes/sr-date-pipe';
import { InquiryItem } from '@features/inquiries/models/inquiry-item';
import {
  INQUIRY_STATUS_META,
  INQUIRY_TYPE_LABELS,
} from '@features/inquiries/utilities/inquiry-labels';

const BASE_CLASSES =
  'p-4 rounded-lg flex flex-col gap-2.5 active:scale-95 transition-200 cursor-pointer flex-1 grow';

@Component({
  imports: [NgIcon, SrDatePipe],
  providers: [provideIcons({ faSolidCalendarPlus, faSolidCheck, faSolidEnvelope })],
  selector: 'app-inquiry-card',
  templateUrl: './inquiry-card.html',
  host: { class: 'grow' },
})
export class InquiryCard {
  inquiry = input.required<InquiryItem>();
  isSelected = input<boolean>(false);
  isChecked = input<boolean>(false);
  addOpacity = input<boolean>(false);

  selected = output<InquiryItem | undefined>();
  checkedToggled = output<number>();

  fullName = computed(() => `${this.inquiry().firstName} ${this.inquiry().lastName}`);

  initials = computed(() =>
    [this.inquiry().firstName, this.inquiry().lastName]
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );

  inquiryType = computed(() => INQUIRY_TYPE_LABELS[this.inquiry().inquiryType]);

  status = computed(() =>
    this.inquiry().isResolved ? INQUIRY_STATUS_META.resolved : INQUIRY_STATUS_META.unresolved,
  );

  containerClasses = computed(() => {
    const background = this.isSelected()
      ? 'bg-emerald-600/70'
      : 'bg-emerald-900/80 hover:bg-emerald-800/80';
    return `${BASE_CLASSES} ${background}`;
  });

  checkboxClasses = computed(() =>
    this.isChecked()
      ? 'bg-amber-500 border-amber-500'
      : 'bg-emerald-950/60 border-emerald-400 hover:bg-emerald-800',
  );

  onClick() {
    this.selected.emit(this.isSelected() ? undefined : this.inquiry());
  }

  onCheckboxClick(event: Event) {
    event.stopPropagation();
    this.checkedToggled.emit(this.inquiry().id);
  }
}
