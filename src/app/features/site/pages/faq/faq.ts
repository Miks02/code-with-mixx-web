import { Component } from '@angular/core';
import { FaqCta } from './components/faq-cta/faq-cta';
import { FaqIntro } from './components/faq-intro/faq-intro';
import { FaqSections } from './components/faq-sections/faq-sections';

@Component({
  imports: [FaqIntro, FaqSections, FaqCta],
  selector: 'app-faq',
  templateUrl: './faq.html',
})
export class Faq {}
