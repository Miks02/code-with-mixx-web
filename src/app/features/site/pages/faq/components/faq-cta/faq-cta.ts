import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { faSolidPaperPlane } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

@Component({
  imports: [Button, RouterLink],
  providers: [provideIcons({ faSolidPaperPlane })],
  selector: 'app-faq-cta',
  styleUrl: './faq-cta.css',
  templateUrl: './faq-cta.html',
})
export class FaqCta {
  readonly email = 'milan@codewithmixx.com';
}
