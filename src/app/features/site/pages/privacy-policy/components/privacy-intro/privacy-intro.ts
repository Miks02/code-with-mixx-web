import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-intro',
  templateUrl: './privacy-intro.html',
})
export class PrivacyIntro {
  readonly lastUpdated = '27. novembar 2026.';
  readonly lastUpdatedIso = '2026-11-27';
  readonly email = 'milan@codewithmixx.com';

  readonly summary: string[] = [
    'Prikupljam samo ono što ostaviš u kontakt formi i ono što je potrebno da bismo održali časove.',
    'Nema reklama, analitike ni praćenja. Podatke ne prodajem i ne dajem nikome radi marketinga.',
    'Kolačići služe isključivo za prijavu. Bez naloga ne dobijaš nijedan.',
    'Uvid, ispravku ili brisanje podataka tražiš jednim mejlom.',
  ];
}
