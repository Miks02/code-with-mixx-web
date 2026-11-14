import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBullseye,
  faSolidChalkboardUser,
  faSolidClock,
  faSolidCode,
  faSolidComments,
  faSolidFileLines,
  faSolidLandmark,
  faSolidListCheck,
  faSolidUser,
  faSolidPersonChalkboard,
  faSolidWallet,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

type PlanFeature = {
  icon: string;
  text: string;
};

type Plan = {
  name: string;
  price: string;
  unit: string;
  note: string;
  features: PlanFeature[];
  featured: boolean;
};

@Component({
  imports: [Button, NgIcon, RouterLink],
  providers: [
    provideIcons({
      faSolidBullseye,
      faSolidChalkboardUser,
      faSolidClock,
      faSolidCode,
      faSolidComments,
      faSolidFileLines,
      faSolidLandmark,
      faSolidListCheck,
      faSolidUser,
      faSolidPersonChalkboard,
      faSolidWallet,
    }),
  ],
  selector: 'app-pricing',
  styleUrl: './pricing.css',
  templateUrl: './pricing.html',
})
export class Pricing {
  readonly plans: Plan[] = [
    {
      name: 'Individualni čas',
      price: '1.300',
      unit: 'rsd / čas',
      note: 'Plaćaš čas po čas, bez obaveze da nastaviš.',
      features: [
        { icon: 'faSolidUser', text: 'Rad 1 na 1' },
        { icon: 'faSolidComments', text: 'Prve konsultacije su besplatne' },
        { icon: 'faSolidClock', text: 'Hitan termin (sutra za prekosutra): +500 rsd' },
      ],
      featured: false,
    },
    {
      name: 'Paket časova',
      price: '9.500',
      unit: 'rsd / 10 časova',
      note: '950 rsd po času, 3.500 rsd manje nego deset pojedinačnih časova.',
      features: [
        { icon: 'faSolidWallet', text: 'Ceo paket se plaća unapred' },
        { icon: 'faSolidBullseye', text: 'Fokus na ispitu, bez dosadne teorije' },
        { icon: 'faSolidListCheck', text: 'Rešavanje ispita iz prošlih godina' },
        { icon: 'faSolidComments', text: 'Podrška putem poruka 24/7' },
      ],
      featured: true,
    },
    {
      name: 'Seminarski / diplomski radovi',
      price: '6.000 – 24.000',
      unit: 'rsd',
      note: 'Cena zavisi od toga da li je rad seminarski ili diplomski, od složenosti, predmeta i preostalog roka.',
      features: [
        { icon: 'faSolidCode', text: 'Pomoć pri savladavanju praktičnog dela' },
        { icon: 'faSolidChalkboardUser', text: 'Mentorisanje u toku rada' },
        { icon: 'faSolidFileLines', text: 'Pomoć oko dokumentacije' },
        { icon: 'faSolidPersonChalkboard', text: 'Priprema za odbranu rada' },
      ],
      featured: false,
    },
  ];
}
