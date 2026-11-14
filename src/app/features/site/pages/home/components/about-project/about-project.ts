import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import { faSolidArrowUpRightFromSquare } from '@ng-icons/font-awesome/solid';

type Stack = {
  area: string;
  technologies: string;
};

type Repository = {
  name: string;
  description: string;
  url: string;
};

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faBrandGithub, faSolidArrowUpRightFromSquare })],
  selector: 'app-about-project',
  styleUrl: './about-project.css',
  templateUrl: './about-project.html',
})
export class AboutProject {
  readonly goals: string[] = [
    'Pomaganje kolegama u lakšem razumevanju informacionih tenologija',
    'Pregled predmeta, učenika, časova i uplata bez tabela i beležaka.',
    'Projekat na kojem vežbam ono što predajem: od baze do korisničkog interfejsa.',
    'Omogućavanje kolegama praćenje sopstvenih projekata/časova bez potrebe za ručnim beleškama.',
  ];

  readonly stack: Stack[] = [
    { area: 'Frontend', technologies: 'Angular 22, TypeScript, Tailwind CSS, TanStack Query' },
    { area: 'Backend', technologies: '.NET 10, ASP.NET Core, Entity Framework Core' },
    { area: 'Baza', technologies: 'PostgreSQL' },
  ];

  readonly repositories: Repository[] = [
    {
      name: 'code-with-mixx-web',
      description: 'Angular aplikacija koju upravo gledaš',
      url: 'https://github.com/Miks02/code-with-mixx-web',
    },
    {
      name: 'code-with-mixx-api',
      description: 'ASP.NET Core API iza nje',
      url: 'https://github.com/Miks02/code-with-mixx-api',
    },
  ];
}
