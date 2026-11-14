import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidImage, faSolidPaperPlane } from '@ng-icons/font-awesome/solid';
import { SubjectCatalogService } from '@features/site/services/subject-catalog-service';
import { Button } from '@shared/components/button/button';

@Component({
  imports: [Button, NgIcon, RouterLink],
  providers: [provideIcons({ faSolidImage, faSolidPaperPlane })],
  selector: 'app-subject-list',
  styleUrl: './subject-list.css',
  templateUrl: './subject-list.html',
})
export class SubjectList {
  readonly groups = inject(SubjectCatalogService).groups;
}
