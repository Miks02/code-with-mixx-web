import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Button } from '../../../../shared/button/button';
import { RouterLink } from '@angular/router';

@Component({
  imports: [NgIcon, Button, RouterLink],
  selector: 'app-admin-action-bar',
  styleUrl: './admin-action-bar.css',
  templateUrl: './admin-action-bar.html',
})
export class AdminActionBar {}
