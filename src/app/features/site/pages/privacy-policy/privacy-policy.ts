import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { PrivacyIntro } from './components/privacy-intro/privacy-intro';
import { PrivacySections } from './components/privacy-sections/privacy-sections';

@Component({
  imports: [PrivacyIntro, PrivacySections],
  selector: 'app-privacy-policy',
  styleUrl: './privacy-policy.css',
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicy {
  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Koje podatke CodeWithMixx prikuplja, zašto, koliko dugo ih čuva, koje kolačiće koristi i kako možeš da ih vidiš, ispraviš ili obrišeš.',
    });
  }
}
