import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowRight, faSolidBriefcase, faSolidUser } from '@ng-icons/font-awesome/solid';
import { Button } from '@shared/components/button/button';

type StoryStep = {
  label: string;
  title: string;
  description: string;
};

type Education = {
  level: string;
  school: string;
};

@Component({
  imports: [Button, NgIcon, RouterLink],
  providers: [provideIcons({ faSolidArrowRight, faSolidBriefcase, faSolidUser })],
  selector: 'app-my-story',
  styleUrl: './my-story.css',
  templateUrl: './my-story.html',
})
export class MyStory {
  readonly steps: StoryStep[] = [
    {
      label: 'ITS',
      title: 'Početak',
      description:
        'Krenuo sam skoro od nule, kao i ti. Mučio sam se sa pokazivačima i sintaksom i pitao se zašto sve ovo uopšte učimo.',
    },
    {
      label: 'Frontend',
      title: 'Učim samostalno',
      description:
        'Pravio sam jednostavne sajtove u HTML-u, CSS-u i JavaScript-u i tako stekao prve praktične veštine.',
    },
    {
      label: 'Maj 2025.',
      title: 'Praksa i prekretnica',
      description:
        'Na praksi sam shvatio da ima nade i počeo da učim fullstack razvoj u Angularu i C#-u.',
    },
    {
      label: 'MixxFit',
      title: 'Lični projekat i prvi časovi',
      description:
        'Na aplikaciji MixxFit, na kojoj i dalje radim, naučio sam najviše. Tada sam počeo da držim prve časove kolegama.',
    },
    {
      label: 'CodeWithMixx',
      title: 'Ono što upravo gledaš',
      description:
        'Platforma preko koje prenosim znanje i skraćujem ti muke. Preskačemo suvu teoriju i radimo praksu.',
    },
  ];

  readonly education: Education[] = [
    { level: 'Master studije, u toku', school: 'ITS, Informacione tehnologije' },
    { level: 'Osnovne studije', school: 'ITS, Informacione tehnologije' },
  ];

  readonly technologies = ['.NET', 'Angular', 'MS SQL', 'PostgreSQL'];

  navigateToPortfolio() {
    window.open('https://my-personal-portfolio-website-7vh5.vercel.app/', '_blank');
  }
}
