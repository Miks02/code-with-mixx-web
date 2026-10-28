import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarPlus,
  faSolidCoins,
  faSolidDiagramProject,
  faSolidMoneyBillWave,
} from '@ng-icons/font-awesome/solid';
import { priceConverter } from '@core/utilities/price-helpers';
import { ReservationStatus } from '@features/reservations';
import { ProjectReservationItem } from '@features/projects/models/project-reservation-item';
import { PAYMENT_STATUS_META } from '@features/reservations';


const BASE_CLASSES =
  'p-4 rounded-lg flex flex-col gap-2.5 active:scale-95 transition-200 cursor-pointer flex-1 grow';

type AccentColor = {
  avatar: string;
  initials: string;
  icon: string;
  mutedText: string;
  border: string;
  selectedBackground: string;
};

type StatusClasses = {
  background: string;
  accentColor: AccentColor;
};

const EMERALD_ACCENT: AccentColor = {
  avatar: 'bg-emerald-500',
  initials: 'text-emerald-950',
  icon: 'text-emerald-400!',
  mutedText: 'text-emerald-300',
  border: 'border-emerald-700/40',
  selectedBackground: 'bg-emerald-600/70',
};

const SKY_ACCENT: AccentColor = {
  avatar: 'bg-sky-400',
  initials: 'text-sky-950',
  icon: 'text-sky-400!',
  mutedText: 'text-sky-200',
  border: 'border-sky-600/40',
  selectedBackground: 'bg-sky-600/50',
};

const RED_ACCENT: AccentColor = {
  avatar: 'bg-red-400',
  initials: 'text-red-950',
  icon: 'text-red-400!',
  mutedText: 'text-red-300',
  border: 'border-red-600/40',
  selectedBackground: 'bg-red-600/50',
};

const STATUS_CLASSES: Record<ReservationStatus, StatusClasses> = {
  [ReservationStatus.Confirmed]: {
    background: 'bg-emerald-900/80 hover:bg-emerald-800/80',
    accentColor: EMERALD_ACCENT,
  },
  [ReservationStatus.Completed]: {
    background: 'bg-sky-700/30 hover:bg-sky-900/45',
    accentColor: SKY_ACCENT,
  },
  [ReservationStatus.Cancelled]: {
    background: 'bg-red-700/30 hover:bg-red-900/45',
    accentColor: RED_ACCENT,
  },
};

@Component({
  imports: [NgIcon, DatePipe],
  providers: [
    provideIcons({
      faSolidCalendarPlus,
      faSolidCoins,
      faSolidDiagramProject,
      faSolidMoneyBillWave,
    }),
  ],
  selector: 'app-project-reservation-card',
  styleUrl: './project-reservation-card.css',
  templateUrl: './project-reservation-card.html',
})
export class ProjectReservationCard {
  reservation = input.required<ProjectReservationItem>();
  isSelected = input<boolean>(false);
  addOpacity = input<boolean>(false);
  selected = output<ProjectReservationItem | undefined>();

  studentInitials = computed(() =>
    this.reservation()
      .studentFullName.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );

  subjectNames = computed(() =>
    this.reservation()
      .projects.map((project) => project.subjectName)
      .join(', '),
  );

  paymentStatus = computed(() => PAYMENT_STATUS_META[this.reservation().paymentStatus]);

  stats = computed(() => {
    const { projects, totalPrice, paidAmount } = this.reservation();
    return [
      { icon: 'faSolidDiagramProject', label: 'Projekti', value: projects.length },
      { icon: 'faSolidCoins', label: 'Cena', value: priceConverter(totalPrice) },
      { icon: 'faSolidMoneyBillWave', label: 'Plaćeno', value: priceConverter(paidAmount) },
    ];
  });

  statusClasses = computed(
    () => STATUS_CLASSES[this.reservation().reservationStatus] ?? STATUS_CLASSES.Confirmed,
  );
  accentColor = computed(() => this.statusClasses().accentColor);

  containerClasses = computed(() => {
    const background = this.isSelected()
      ? this.statusClasses().accentColor.selectedBackground
      : this.statusClasses().background;
    return `${BASE_CLASSES} ${background}`;
  });

  onClick() {
    if (this.isSelected()) {
      this.selected.emit(undefined);
      return;
    }
    this.selected.emit(this.reservation());
  }
}
