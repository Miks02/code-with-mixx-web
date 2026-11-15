import { Component } from '@angular/core';
import { PrivacyIntro } from './components/privacy-intro/privacy-intro';
import { PrivacySections } from './components/privacy-sections/privacy-sections';

@Component({
  imports: [PrivacyIntro, PrivacySections],
  selector: 'app-privacy-policy',
  styleUrl: './privacy-policy.css',
  templateUrl: './privacy-policy.html',
})
export class PrivacyPolicy {}
