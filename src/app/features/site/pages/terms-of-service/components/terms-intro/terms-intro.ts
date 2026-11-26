import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-intro',
  templateUrl: './terms-intro.html',
})
export class TermsIntro {
  readonly lastUpdated = '14. novembar 2026.';
  readonly lastUpdatedIso = '2026-11-14';
  readonly email = 'milan@codewithmixx.com';

  readonly summary: string[] = [
    'Čas otkazuješ ili pomeraš bez posledica najkasnije 24 sata pre termina.',
    'Plaćanje ide isključivo uplatom na račun, posle dogovora. Preko sajta se ne plaća ništa.',
    'Ako odustaneš od paketa, održani časovi se računaju po 1.300 rsd, a ostatak ti vraćam.',
    'Studentski panel je u izradi. Do tada naloge, rezervacije i uplate vodim ja.',
  ];
}
