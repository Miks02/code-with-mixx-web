import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Skeleton } from '../../../../shared/skeleton/skeleton';

@Component({
  imports: [NgIcon, Skeleton],
  selector: 'app-stats-card',
  styleUrl: './stats-card.css',
  templateUrl: './stats-card.html',
})
export class StatsCard {
  title = input.required<string>();
  value = input.required<number | undefined>();
  icon = input.required<string>();
  description = input<string>();
  iconBackground = input.required<'sky' | 'red' | 'violet'>();
  isPending = input<boolean>(false);
}
