import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { AboutServices } from './components/about-services/about-services';

@Component({
  imports: [Hero, AboutServices],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
