import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-intro',
  templateUrl: './terms-intro.html',
})
export class TermsIntro {
  readonly lastUpdated = '27. novembar 2026.';
  readonly lastUpdatedIso = '2026-11-27';
  readonly email = 'milan@codewithmixx.com';

  readonly summary: string[] = [
    'Čas otkazuješ ili pomeraš bez posledica najkasnije 24 sata pre termina.',
    'Plaćanje ide isključivo uplatom na račun, posle dogovora. Preko sajta se ne plaća ništa.',
    'Ako odustaneš od paketa, održani časovi se računaju po 1.300 rsd, a ostatak ti vraćam.',
    'Nalog ti otvaram ja. U studentskom panelu pratiš časove, radove i uplate, a rezervacije i uplate unosim ja.',
  ];
}
