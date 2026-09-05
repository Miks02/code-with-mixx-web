import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Button } from '../../../../shared/button/button';

@Component({
  imports: [NgIcon, Button],
  selector: 'app-admin-action-bar',
  styleUrl: './admin-action-bar.css',
  templateUrl: './admin-action-bar.html',
})
export class AdminActionBar {}
