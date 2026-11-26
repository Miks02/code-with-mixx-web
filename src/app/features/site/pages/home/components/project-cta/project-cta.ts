import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { faSolidCode } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

@Component({
  imports: [Button, RouterLink],
  providers: [provideIcons({ faSolidCode })],
  selector: 'app-project-cta',
  templateUrl: './project-cta.html',
})
export class ProjectCta {}
