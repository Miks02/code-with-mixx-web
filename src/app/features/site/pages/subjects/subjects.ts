import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { SubjectList } from './components/subject-list/subject-list';
import { SubjectsIntro } from './components/subjects-intro/subjects-intro';

@Component({
  imports: [SubjectList, SubjectsIntro],
  selector: 'app-subjects',
  styleUrl: './subjects.css',
  templateUrl: './subjects.html',
})
export class Subjects {
  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content:
        'Spisak predmeta iz kojih držim privatne časove: programiranje u C-u, Javi, C#-u i Pythonu, objektno orijentisano programiranje, web razvoj i baze podataka, sa temama koje prolazimo.',
    });
  }
}
