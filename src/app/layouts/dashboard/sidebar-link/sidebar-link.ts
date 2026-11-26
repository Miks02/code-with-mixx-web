import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  imports: [NgIcon, RouterLink],
  selector: 'app-sidebar-link',
  templateUrl: './sidebar-link.html',
})
export class SidebarLink {
  linkName = input.required<string>();
  linkIcon = input.required<string>();
  navigateTo = input.required<string>();
}
