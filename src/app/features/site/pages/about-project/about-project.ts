import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ProjectDetails } from './components/project-details/project-details';
import { ProjectIntro } from './components/project-intro/project-intro';

@Component({
  imports: [ProjectDetails, ProjectIntro],
  selector: 'app-about-project',
  styleUrl: './about-project.css',
  templateUrl: './about-project.html',
})
export class AboutProject {
  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Kako je napravljen CodeWithMixx: Angular 22 sa SSR-om, ASP.NET Core na .NET 10 i PostgreSQL. Arhitektura, prijava, obrada grešaka i javni kod na GitHubu.',
    });
  }
}
