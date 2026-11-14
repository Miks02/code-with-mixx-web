import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandGithub } from '@ng-icons/font-awesome/brands';
import { faSolidArrowUpRightFromSquare } from '@ng-icons/font-awesome/solid';

type Repository = {
  name: string;
  description: string;
  url: string;
};

@Component({
  imports: [NgIcon],
  providers: [provideIcons({ faBrandGithub, faSolidArrowUpRightFromSquare })],
  selector: 'app-project-intro',
  styleUrl: './project-intro.css',
  templateUrl: './project-intro.html',
})
export class ProjectIntro {
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
