import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'app-site-layout',
  styleUrl: './site-layout.css',
  templateUrl: './site-layout.html',
})
export class SiteLayout {}
