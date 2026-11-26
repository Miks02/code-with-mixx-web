import { Component } from '@angular/core';
import { TermsIntro } from './components/terms-intro/terms-intro';
import { TermsSections } from './components/terms-sections/terms-sections';

@Component({
  imports: [TermsIntro, TermsSections],
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.html',
})
export class TermsOfService {}
