import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  imports: [NgIcon],
  selector: 'app-sidebar-link',
  styleUrl: './sidebar-link.css',
  templateUrl: './sidebar-link.html',
})
export class SidebarLink {
  linkName = input.required<string>();
  linkIcon = input.required<string>();
  navigateTo = input.required<string>();
  
}
