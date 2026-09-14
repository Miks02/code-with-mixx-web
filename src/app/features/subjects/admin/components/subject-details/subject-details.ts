import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendar,
  faSolidHandPointer,
  faSolidPenToSquare,
  faSolidTrashCan,
  faSolidUserGraduate,
} from '@ng-icons/font-awesome/solid';
import { Button } from '../../../../../shared/button/button';
import { SubjectItem } from '../../../models/subject-item';

@Component({
  imports: [NgIcon, Button],
  providers: [
    provideIcons({
      faSolidCalendar,
      faSolidHandPointer,
      faSolidPenToSquare,
      faSolidTrashCan,
      faSolidUserGraduate,
    }),
  ],
  selector: 'app-subject-details',
  styleUrl: './subject-details.css',
  templateUrl: './subject-details.html',
})
export class SubjectDetails {
  subject = input<SubjectItem>();
}
