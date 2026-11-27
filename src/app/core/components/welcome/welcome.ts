import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidCalendar,
  faSolidChartArea,
  faSolidFile,
  faSolidGear,
  faSolidMoneyBillTransfer,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import { ModalOverlay } from '@shared/components/modal-overlay/modal-overlay';

type WelcomeSection = { icon: string; name: string; description: string };

@Component({
  imports: [Button, ModalOverlay, NgIcon, RouterLink],
  providers: [
    provideIcons({
      faSolidBook,
      faSolidCalendar,
      faSolidChartArea,
      faSolidFile,
      faSolidGear,
      faSolidMoneyBillTransfer,
    }),
  ],
  selector: 'app-welcome',
  templateUrl: './welcome.html',
})
export class Welcome {
  isShown = input.required<boolean>();
  university = input<string | null>(null);

  private isDismissed = signal(false);

  protected isOpen = computed(() => this.isShown() && !this.isDismissed());

  protected hasUniversity = computed(() => !!this.university());

  protected sections: WelcomeSection[] = [
    {
      icon: 'faSolidChartArea',
      name: 'Analitika',
      description: 'Sledeći čas, aktivni projekti i šta je ostalo za uplatu, na jednom ekranu.',
    },
    {
      icon: 'faSolidBook',
      name: 'Predmeti',
      description: 'Predmeti koje radimo zajedno i kada smo poslednji put radili svaki od njih.',
    },
    {
      icon: 'faSolidCalendar',
      name: 'Časovi',
      description: 'Tvoje rezervacije časova sa tačnim terminima.',
    },
    {
      icon: 'faSolidFile',
      name: 'Projekti',
      description: 'Napredak, rokovi, linkovi i beleške za svaki projekat.',
    },
    {
      icon: 'faSolidMoneyBillTransfer',
      name: 'Finansije',
      description: 'Sve uplate i koliko je ostalo po rezervaciji.',
    },
  ];

  protected close() {
    this.isDismissed.set(true);
  }
}
