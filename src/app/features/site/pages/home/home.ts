import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { AboutServices } from './components/about-services/about-services';
import { MyStory } from './components/my-story/my-story';
import { HowItWorks } from './components/how-it-works/how-it-works';

@Component({
  imports: [Hero, AboutServices, HowItWorks, MyStory],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
