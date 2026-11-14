import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { AboutServices } from './components/about-services/about-services';
import { MyStory } from './components/my-story/my-story';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { Pricing } from './components/pricing/pricing';
import { ProjectCta } from './components/project-cta/project-cta';
import { Contact } from './components/contact/contact';

@Component({
  imports: [Hero, AboutServices, HowItWorks, Pricing, MyStory, Contact, ProjectCta],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
