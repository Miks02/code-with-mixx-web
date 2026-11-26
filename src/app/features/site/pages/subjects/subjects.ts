import { Component } from '@angular/core';
import { SubjectList } from './components/subject-list/subject-list';
import { SubjectsIntro } from './components/subjects-intro/subjects-intro';

@Component({
  imports: [SubjectList, SubjectsIntro],
  selector: 'app-subjects',
  templateUrl: './subjects.html',
})
export class Subjects {}
