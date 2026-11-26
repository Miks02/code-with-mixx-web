import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type TocItem = {
  id: string;
  title: string;
};

type Rule = {
  subject: string;
  paragraphs: string[];
};

type Price = {
  service: string;
  amount: string;
  payment: string;
};

@Component({
  imports: [NgTemplateOutlet, RouterLink],
  selector: 'app-terms-sections',
  templateUrl: './terms-sections.html',
})
export class TermsSections {
  readonly email = 'milan@codewithmixx.com';

  readonly toc: TocItem[] = [
    { id: 'about-terms', title: 'Šta su ovi uslovi' },
    { id: 'account', title: 'Nalog i studentski panel' },
    { id: 'classes', title: 'Časovi' },
    { id: 'cancellation', title: 'Otkazivanje i pomeranje' },
    { id: 'payment', title: 'Cene i plaćanje' },
    { id: 'refunds', title: 'Povraćaj novca' },
    { id: 'projects', title: 'Seminarski i diplomski radovi' },
    { id: 'liability', title: 'Šta ne mogu da obećam' },
    { id: 'changes', title: 'Izmene uslova' },
  ];

  readonly classRules: Rule[] = [
    {
      subject: 'Konsultacije',
      paragraphs: [
        'Prvi razgovor je besplatan. Na njemu prolazimo šta ti treba, koje gradivo radiš i do kada, pa tek onda dogovaramo časove.',
      ],
    },
    {
      subject: 'Gde se održavaju',
      paragraphs: [
        'Online, preko Google Meet-a ili Discorda. Treba ti računar, stabilna veza i mikrofon.',
      ],
    },
    {
      subject: 'Trajanje',
      paragraphs: ['Jedan čas traje do 45 minuta. Više časova može da se zakaže u nizu.'],
    },
    {
      subject: 'Termini',
      paragraphs: [
        'Termin dogovaramo porukom. Čas je zakazan kada ga ja potvrdim i upišem kao rezervaciju.',
      ],
    },
  ];

  readonly cancellationRules: Rule[] = [
    {
      subject: 'Najkasnije 24 sata pre',
      paragraphs: [
        'Čas otkazuješ ili pomeraš bez ikakvih posledica. Dovoljno je da mi se javiš porukom ili mejlom.',
      ],
    },
    {
      subject: 'Kasnije od toga ili nedolazak',
      paragraphs: [
        'Čas se računa kao otkazan. U zavisnosti od toga šta se dogovorimo, pomeram ga na novi termin ili ga brišem iz rezervacije.',
        'Ako je to jedini čas u rezervaciji, a ti javiš da ne želiš novi termin ili se ne javiš uopšte, cela rezervacija se vodi kao otkazana.',
      ],
    },
    {
      subject: 'Kada otkazujem ja',
      paragraphs: [
        'Javljam ti čim saznam da ne mogu da održim čas i dogovaramo novi termin koji ti odgovara.',
      ],
    },
  ];

  readonly prices: Price[] = [
    {
      service: 'Individualni čas',
      amount: '1.300 rsd po času',
      payment: 'Plaćaš čas po čas, bez obaveze da nastaviš.',
    },
    {
      service: 'Hitan termin',
      amount: '+500 rsd',
      payment: 'Doplata kada čas zakazuješ sutra za prekosutra.',
    },
    {
      service: 'Paket od 10 časova',
      amount: '9.500 rsd',
      payment: 'Ceo paket se plaća unapred, pre prvog časa.',
    },
    {
      service: 'Seminarski i diplomski radovi',
      amount: '6.000 – 24.000 rsd',
      payment:
        'Avans pre početka rada, ostatak na kraju. Tačnu cenu i iznos avansa dogovaramo pre nego što počnemo.',
    },
  ];

  readonly refundRules: Rule[] = [
    {
      subject: 'Paket bez održanih časova',
      paragraphs: ['Ako odustaneš pre prvog časa, vraćam ti ceo uplaćeni iznos.'],
    },
    {
      subject: 'Paket sa održanim časovima',
      paragraphs: [
        'Popust važi za ceo paket. Ako odustaneš na pola, svaki održani čas se računa po punoj ceni od 1.300 rsd, a ostatak uplate ti vraćam.',
        'Primer: posle četiri održana časa vraćam ti 9.500 − 4 × 1.300 = 4.300 rsd. Posle osam ili više održanih časova nema ostatka za povraćaj.',
      ],
    },
    {
      subject: 'Radovi',
      paragraphs: [
        'Ako odustaneš od rada koji je počet, avans se ne vraća, jer pokriva ono što je do tada urađeno.',
      ],
    },
  ];

  readonly projectRules: Rule[] = [
    {
      subject: 'Šta dobijaš',
      paragraphs: [
        'Pomoć da savladaš praktični deo, mentorisanje dok radiš, pomoć oko dokumentacije i pripremu za odbranu.',
      ],
    },
    {
      subject: 'Čiji je rad',
      paragraphs: [
        'Tvoj. Ti ga predaješ i braniš, pa ti odgovaraš i za to da bude u skladu sa pravilima tvog fakulteta. Cilj je da razumeš svaki deo koda koji predaješ.',
      ],
    },
    {
      subject: 'Rokovi',
      paragraphs: [
        'Rok dogovaramo unapred i on utiče na cenu. Da bih ga ispoštovao, treba mi da na vreme pošalješ temu, zahteve i materijale sa fakulteta.',
      ],
    },
    {
      subject: 'Isporuka',
      paragraphs: [
        'Kod i dokumentaciju dobijaš kao link ka GitHub repozitorijumu ili kao fajl za preuzimanje.',
      ],
    },
  ];

  readonly disclaimers: string[] = [
    'Ne mogu da garantujem da ćeš položiti ispit ili dobiti određenu ocenu. To zavisi i od tvog rada između časova.',
    'Ne odgovaram za odluke fakulteta ili profesora o tvom radu.',
    'Sajt može povremeno da bude nedostupan zbog održavanja ili kvara. Dogovorene časove to ne menja, jer se sve što je zakazano potvrđuje i porukom.',
  ];
}
