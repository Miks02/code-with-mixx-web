import { Component } from '@angular/core';
import { ProjectDetails } from './components/project-details/project-details';
import { ProjectIntro } from './components/project-intro/project-intro';

@Component({
  imports: [ProjectDetails, ProjectIntro],
  selector: 'app-about-project',
  styleUrl: './about-project.css',
  templateUrl: './about-project.html',
})
export class AboutProject {}
