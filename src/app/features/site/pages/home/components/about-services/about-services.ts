import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidCalendarCheck,
  faSolidCode,
  faSolidCubes,
  faSolidDatabase,
  faSolidEllipsis,
  faSolidGlobe,
  faSolidListUl,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

type Subject = {
  icon: string;
  title: string;
  description: string;
  topics: string[];
};

@Component({
  imports: [Button, NgIcon, RouterLink],
  providers: [
    provideIcons({
      faSolidBook,
      faSolidCalendarCheck,
      faSolidCode,
      faSolidCubes,
      faSolidDatabase,
      faSolidEllipsis,
      faSolidGlobe,
      faSolidListUl,
    }),
  ],
  selector: 'app-about-services',
  styleUrl: './about-services.css',
  templateUrl: './about-services.html',
})
export class AboutServices {
  readonly subjects: Subject[] = [
    {
      icon: 'faSolidCode',
      title: 'Osnove programiranja u C jeziku',
      description:
        'Krećemo od nule: kako program radi i kako da razmišljaš dok pišeš kod. Vežbamo na zadacima kakvi dolaze na kolokvijumu i ispitu.',
      topics: ['Promenljive i tipovi', 'Grananja i petlje', 'Funkcije', 'Nizovi', 'Pokazivači'],
    },
    {
      icon: 'faSolidCubes',
      title: 'Objektno orijentisano programiranje',
      description:
        'Klase i objekti prestaju da budu apstrakcija kada ih primeniš na konkretnom primeru. Radimo u jeziku koji koristiš na fakultetu.',
      topics: ['Klase i objekti', 'Nasleđivanje', 'Polimorfizam', 'Interfejsi', 'Java, C#, C++'],
    },
    {
      icon: 'faSolidGlobe',
      title: 'Web razvoj: frontend i backend',
      description:
        'Od prve HTML stranice do aplikacije koja ima server, prijavu korisnika i bazu. Učiš kako se delovi povezuju u celinu.',
      topics: ['HTML i CSS', 'JavaScript', 'Responzivan dizajn', 'REST API', 'Autentifikacija'],
    },
    {
      icon: 'faSolidDatabase',
      title: 'Baze podataka',
      description:
        'Projektuješ šemu, pišeš upite i razumeš zašto je tabela podeljena baš tako. Od prvog SELECT upita do složenih spajanja.',
      topics: ['ER modeli', 'Normalizacija', 'SQL upiti', 'JOIN i agregacije', 'Indeksi'],
    },
    {
      icon: 'faSolidEllipsis',
      title: 'I još mnogo više...',
      description:
        'Ovo su samo oblasti koje se najčešće traže. Otvori „Spisak predmeta“ i pogledaj ceo katalog, sa temama koje prolazimo u svakom predmetu.',
      topics: [],
    },
  ];
}
