import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

export type DashboardCardVariant = 'emerald' | 'amber' | 'violet' | 'sky';

interface VariantStyle {
  gradient: string;
  iconBg: string;
  iconColor: string;
  labelColor: string;
}

const VARIANT_STYLES: Record<DashboardCardVariant, VariantStyle> = {
  emerald: {
    gradient: 'bg-linear-to-br from-emerald-950 to-emerald-900',
    iconBg: 'bg-emerald-700/50',
    iconColor: 'text-emerald-300!',
    labelColor: 'text-emerald-300',
  },
  amber: {
    gradient: 'bg-linear-to-br from-yellow-950 to-yellow-900',
    iconBg: 'bg-yellow-700/50',
    iconColor: 'text-yellow-300!',
    labelColor: 'text-yellow-300',
  },
  violet: {
    gradient: 'bg-linear-to-br from-violet-950 to-violet-900',
    iconBg: 'bg-violet-700/50',
    iconColor: 'text-violet-300!',
    labelColor: 'text-violet-300',
  },
  sky: {
    gradient: 'bg-linear-to-br from-sky-950 to-sky-900',
    iconBg: 'bg-sky-700/50',
    iconColor: 'text-sky-300!',
    labelColor: 'text-sky-300',
  },
};

@Component({
  imports: [NgIcon],
  selector: 'app-analytics-card',
  styleUrl: './analytics-card.css',
  templateUrl: './analytics-card.html',
})
export class AnalyticsCard {
  variant = input<DashboardCardVariant>('emerald');
  title = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();

  style = computed(() => VARIANT_STYLES[this.variant()]);
}
