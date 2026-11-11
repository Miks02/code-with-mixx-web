import { Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonColor = 'default' | 'blue';

const SKELETON_COLORS: Record<SkeletonColor, string> = {
  default: 'bg-emerald-800/60',
  blue: 'bg-sky-800/60',
};

@Component({
  selector: 'app-skeleton',
  standalone: true,
  styleUrl: './skeleton.css',
  templateUrl: './skeleton.html',
})
export class Skeleton {
  variant = input<SkeletonVariant>('text');
  width = input<string>('100%');
  height = input<string | null>(null);
  rounded = input<boolean>(true);
  count = input<number>(1);
  color = input<SkeletonColor>('default');

  baseClasses = computed(() => `animate-pulse ${SKELETON_COLORS[this.color()]}`);

  variantClasses = computed(() => {
    const variants: Record<SkeletonVariant, string> = {
      text: 'h-3.5 rounded',
      circular: 'rounded-full',
      rectangular: this.rounded() ? 'rounded-lg' : 'rounded-none',
    };
    return variants[this.variant()];
  });

  resolvedHeight = computed(() => {
    if (this.height()) return this.height();
    if (this.variant() === 'circular') return this.width();
    if (this.variant() === 'rectangular') return '8rem';
    return null;
  });

  lines = computed(() => Array.from({ length: Math.max(1, this.count()) }));
}
