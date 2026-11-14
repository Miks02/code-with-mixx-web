import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarCheck,
  faSolidComments,
  faSolidGraduationCap,
  faSolidLaptopCode,
  faSolidVideo,
} from '@ng-icons/font-awesome/solid';

type Step = {
  icon: string;
  title: string;
  description: string;
};

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({
      faSolidCalendarCheck,
      faSolidComments,
      faSolidGraduationCap,
      faSolidLaptopCode,
      faSolidVideo,
    }),
  ],
  selector: 'app-how-it-works',
  styleUrl: './how-it-works.css',
  templateUrl: './how-it-works.html',
})
export class HowItWorks {
  readonly steps: Step[] = [
    {
      icon: 'faSolidComments',
      title: 'Konsultacije',
      description:
        'Besplatan razgovor o tvojim potrebama, gradivu i ciljevima koje želiš da postigneš.',
    },
    {
      icon: 'faSolidCalendarCheck',
      title: 'Dogovor',
      description:
        'Brzo zakazivanje termina časa ili preciziranje detalja i roka za izradu seminarskog rada.',
    },
    {
      icon: 'faSolidLaptopCode',
      title: 'Realizacija',
      description:
        'Interaktivni prolazak kroz gradivo ili zajednička izrada tvog projekta uz jasna objašnjenja.',
    },
    {
      icon: 'faSolidGraduationCap',
      title: 'Uspeh',
      description:
        'Uspešno položen ispit ili predat seminarski sa punim razumevanjem urađenog koda.',
    },
  ];
}
