import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidQuoteLeft } from '@ng-icons/font-awesome/solid';

type Testimonial = {
  name: string;
  initials: string;
  subject: string;
  quote: string;
};

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faSolidQuoteLeft })],
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
})
export class Testimonials {
  readonly testimonials: Testimonial[] = [
    {
      name: 'Nikolina M.',
      initials: 'NM',
      subject: 'ASP.NET Core',
      quote:
        'Sve preporuke! Uz detaljna objašnjenja savladala sam najkompleksniji projekat na godini i dobila ogromne pohvale.',
    },
    {
      name: 'Luka Š.',
      initials: 'LŠ',
      subject: 'Osnove OOP',
      quote:
        'Odličan pristup radu. Fokus je na praksi i onome što se zapravo traži na ispitu. Položio sam iz prve sa devetkom.',
    },
    {
      name: 'Jovana Š.',
      initials: 'JŠ',
      subject: 'C programiranje',
      quote:
        'Imala sam ispit iz osnova C programskog jezika koji sam uspešno spremila uz pomoć održanih časova.',
    },
    {
      name: 'Marija S.',
      initials: 'MS',
      subject: 'ASP.NET Core',
      quote:
        'Uz Milanove smernice i sjajna objašnjenja samostalno sam završila i odbranila jedan od najzahtevnijih projekata.',
    },
    {
      name: 'Goran M.',
      initials: 'GM',
      subject: 'C programiranje',
      quote:
        'Zahvaljujući Milanu savladao sam osnove C programiranja. Sve je delovalo prekomplikovano dok nismo seli da radimo.',
    },
    {
      name: 'Đurađ V.',
      initials: 'ĐV',
      subject: 'ASP.NET Core',
      quote:
        'Milan je profesionalac. Sve je bilo onako kako smo se dogovorili, a projekat sam pripremio i odbranio pre roka.',
    },
    {
      name: 'Ana M.',
      initials: 'AM',
      subject: 'Web razvoj - PHP',
      quote: 'Zahvaljujući Milanu savladala sam osnove PHP-a, zbog čega sam dobila 10 na ispitu!',
    },
    {
      name: 'Milan L.',
      initials: 'ML',
      subject: 'HTML, CSS i JS',
      quote:
        'Za nekoliko časova prešli smo sve što se traži na ispitu. Milan odlično prenosi znanje i sve sam uspešno spremio.',
    },
  ];
}
