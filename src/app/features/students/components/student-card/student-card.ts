import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidCalendarPlus,
  faSolidChalkboardUser,
  faSolidDiagramProject,
} from '@ng-icons/font-awesome/solid';
import { AccountStatus } from '../../../../core/models/account-status';
import { StudentItem } from '../../models/student-item';

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

const RED_ACCENT: AccentColor = {
  avatar: 'bg-red-400',
  initials: 'text-red-950',
  icon: 'text-red-400!',
  mutedText: 'text-red-300',
  border: 'border-red-600/40',
  selectedBackground: 'bg-red-600/50',
};

const PENDING_ACCENT: AccentColor = {
  avatar: 'bg-amber-400',
  initials: 'text-amber-950',
  icon: 'text-amber-400!',
  mutedText: 'text-amber-200',
  border: 'border-amber-600/40',
  selectedBackground: 'bg-amber-600/50',
};

const STATUS_CLASSES: Record<AccountStatus, StatusClasses> = {
  [AccountStatus.Active]: {
    background: 'bg-emerald-900/80 hover:bg-emerald-800/80',
    accentColor: EMERALD_ACCENT,
  },
  [AccountStatus.Pending]: {
    background: 'bg-amber-700/30 hover:bg-amber-900/45',
    accentColor: PENDING_ACCENT,
  },
  [AccountStatus.Deactivated]: {
    background: 'bg-red-700/30 hover:bg-red-900/45',
    accentColor: RED_ACCENT,
  },
  [AccountStatus.Deleted]: {
    background: 'bg-red-900/30 hover:bg-red-900/45',
    accentColor: RED_ACCENT,
  },
};

@Component({
  imports: [NgIcon, DatePipe],
  providers: [
    provideIcons({
      faSolidCalendarCheck,
      faSolidCalendarPlus,
      faSolidChalkboardUser,
      faSolidDiagramProject,
    }),
  ],
  selector: 'app-student-card',
  styleUrl: './student-card.css',
  templateUrl: './student-card.html',
})
export class StudentCard {
  student = input.required<StudentItem>();
  isSelected = input<boolean>(false);
  addOpacity = input<boolean>(false);
  selected = output<StudentItem | undefined>();

  studentName = computed(() => `${this.student().firstName} ${this.student().lastName}`);
  studentEmail = computed(() => this.student().email);
  studentInitials = computed(() => {
    const { firstName, lastName } = this.student();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  });

  stats = computed(() => {
    const { totalReservations, totalClasses, totalProjects } = this.student();
    return [
      { icon: 'faSolidCalendarCheck', label: 'Rezervacije', value: totalReservations },
      { icon: 'faSolidChalkboardUser', label: 'Časovi', value: totalClasses },
      { icon: 'faSolidDiagramProject', label: 'Projekti', value: totalProjects },
    ];
  });

  statusClasses = computed(
    () => STATUS_CLASSES[this.student().accountStatus] ?? STATUS_CLASSES.Active,
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
    this.selected.emit(this.student());
  }
}
