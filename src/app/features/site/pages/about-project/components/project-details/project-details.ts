import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';

type Fact = {
  label: string;
  text: string;
};

@Component({
  imports: [NgTemplateOutlet],
  selector: 'app-project-details',
  styleUrl: './project-details.css',
  templateUrl: './project-details.html',
})
export class ProjectDetails {
  readonly goals: string[] = [
    'Pomaganje kolegama u lakšem razumevanju informacionih tehnologija.',
    'Pregled predmeta, učenika, časova i uplata bez tabela i beležaka.',
    'Projekat na kojem vežbam ono što predajem: od baze do korisničkog interfejsa.',
    'Omogućavanje kolegama praćenje sopstvenih projekata i časova bez potrebe za ručnim beleškama.',
  ];

  readonly stack: Fact[] = [
    { label: 'Frontend', text: 'Angular 22, TypeScript, Tailwind CSS, TanStack Query' },
    { label: 'Backend', text: '.NET 10, ASP.NET Core, Entity Framework Core, Minimal API' },
    { label: 'Baza', text: 'PostgreSQL' },
  ];

  readonly architecture: Fact[] = [
    {
      label: 'Javni sajt',
      text: 'Stranice koje upravo čitaš renderuju se na serveru još pri buildu (Angular SSR i prerender), pa stižu kao gotov HTML koji pretraživači vide i bez JavaScript-a. Admin panel i prijava rade samo u pregledaču, jer zavise od sesije koju server ne vidi.',
    },
    {
      label: 'Stanje i podaci',
      text: 'Stanje aplikacije drže Angular signali, bez NgRx-a. Podatke sa servera dobavlja i kešira TanStack Query, a forme su napisane u novom Signal Forms API-ju.',
    },
    {
      label: 'Server',
      text: 'ASP.NET Core minimal API, organizovan po funkcionalnostima (Vertikalni preseci). Svaka akcija ima svoj endpoint, handler, zahtev i validator (ako zahtev menja stanje). Pravila poslovanja žive u domenskim entitetima, koji vraćaju rezultat umesto da bacaju izuzetke.',
    },
    {
      label: 'Prijava',
      text: 'JWT tokeni su u HttpOnly kolačićima, pa im JavaScript ne može prići. Kada token istekne, aplikacija ga sama obnovi i ponovi zahtev. Ako neko pokuša da iskoristi već potrošen token za obnavljanje, gase se sve sesije tog naloga.',
    },
    {
      label: 'Greške',
      text: 'Svaka greška sa servera stiže kao RFC 9457 ProblemDetails sa sopstvenim kodom (na primer Subject.AlreadyExists), pa frontend tačno zna koju poruku da prikaže.',
    },
    {
      label: 'Hosting i servisi',
      text: 'Server i baza su na Railway-u, mejlove šalje Resend, a obaveštenja o novim upitima stižu na Discord.',
    },
  ];
}
