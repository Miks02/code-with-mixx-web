import { Component, input } from '@angular/core';
import { UpcomingClass } from '../../models/upcoming-class-';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { DatePipe } from '@angular/common';
import { faSolidCalendarXmark } from '@ng-icons/font-awesome/solid';

@Component({
  imports: [NgIcon, DatePipe],
  providers: [provideIcons({ faSolidCalendarXmark })],
  selector: 'app-upcoming-classes',
  styleUrl: './upcoming-classes.css',
  templateUrl: './upcoming-classes.html',
})
export class UpcomingClasses {
  upcomingClasses = input.required<UpcomingClass[] | undefined>();

  getInitials(fullName: string): string {
    return fullName
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
