import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { AboutServices } from './components/about-services/about-services';
import { MyStory } from './components/my-story/my-story';

@Component({
  imports: [Hero, AboutServices, MyStory],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
