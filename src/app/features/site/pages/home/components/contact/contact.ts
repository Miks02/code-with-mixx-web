import { Component, inject, signal } from '@angular/core';
import { FormField, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandDiscord, faBrandInstagram } from '@ng-icons/font-awesome/brands';
import {
  faSolidCommentDots,
  faSolidEnvelope,
  faSolidListUl,
  faSolidPaperPlane,
  faSolidPhone,
  faSolidUser,
} from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';
import {
  CreateInquiryRequest,
  createEmptyInquiryRequest,
  createInquiryForm,
  InquiryType,
  InquiryService,
} from '@features/inquiries';
import { ToastService } from '@core/services/toast-service';

type ContactChannel = {
  icon: string;
  label: string;
  value: string;
  url?: string;
};

type InquiryOption = {
  value: InquiryType;
  label: string;
};

@Component({
  imports: [Button, FormField, NgIcon],
  providers: [
    provideIcons({
      faBrandDiscord,
      faBrandInstagram,
      faSolidCommentDots,
      faSolidEnvelope,
      faSolidListUl,
      faSolidPaperPlane,
      faSolidPhone,
      faSolidUser,
    }),
  ],
  selector: 'app-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
})
export class Contact {
  private toastService = inject(ToastService);
  private inquiryService = inject(InquiryService);

  private sendInquiryMutation = this.inquiryService.sendInquiryMutation;
  isPending = this.sendInquiryMutation.isPending;

  readonly channels: ContactChannel[] = [
    {
      icon: 'faSolidEnvelope',
      label: 'Email adresa',
      value: 'milan@codewithmixx.com',
      url: 'mailto:milan@codewithmixx.com',
    },
    { icon: 'faBrandDiscord', label: 'Discord', value: 'mixx002' },
    {
      icon: 'faBrandInstagram',
      label: 'Instagram',
      value: '@codewithmixx',
      url: 'https://www.instagram.com/codewithmixx',
    },
  ];

  readonly inquiryOptions: InquiryOption[] = [
    { value: InquiryType.IndividualClasses, label: 'Konsultacije za individualne časove' },
    { value: InquiryType.ClassPackage, label: 'Paket časova' },
    { value: InquiryType.Project, label: 'Seminarski / diplomski rad' },
    { value: InquiryType.Other, label: 'Ostalo' },
  ];

  contactModel = signal<CreateInquiryRequest>(createEmptyInquiryRequest());
  contactForm = createInquiryForm(this.contactModel);

  onSubmit() {
    return submit(this.contactForm, async () => {
      try {
        await this.sendInquiryMutation.mutateAsync(this.contactModel());
        this.toastService.showSuccess('Tvoj upit je uspešno poslat.');
      } catch {
        this.toastService.showError(
          'Došlo je do greške prilikom slanja upita. Pokušaj ponovo kasnije.',
        );
      }
    });
  }
}
