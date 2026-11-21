import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRight, faSolidPlus } from '@ng-icons/font-awesome/solid';
import { FAQ_GROUPS } from '@features/site/utilities/faq-content';

@Component({
  imports: [NgIcon, RouterLink],
  providers: [provideIcons({ faSolidArrowRight, faSolidPlus })],
  selector: 'app-faq-sections',
  styleUrl: './faq-sections.css',
  templateUrl: './faq-sections.html',
})
export class FaqSections {
  readonly groups = FAQ_GROUPS;
}
