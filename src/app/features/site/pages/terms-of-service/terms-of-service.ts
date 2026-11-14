import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { TermsIntro } from './components/terms-intro/terms-intro';
import { TermsSections } from './components/terms-sections/terms-sections';

@Component({
  imports: [TermsIntro, TermsSections],
  selector: 'app-terms-of-service',
  styleUrl: './terms-of-service.css',
  templateUrl: './terms-of-service.html',
})
export class TermsOfService {
  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Kako se na CodeWithMixx zakazuju, otkazuju i plaćaju časovi i radovi, kada se novac vraća i ko vodi tvoj nalog dok studentski panel ne bude gotov.',
    });
  }
}
