import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@shared/components/button/button';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min';

type CodeToken = { text: string; color: string };

type HeroStat = {
  target: number;
  decimals: number;
  suffix: string;
  durationMs: number;
  label: string;
};

const formatStat = (stat: HeroStat, value: number) => value.toFixed(stat.decimals) + stat.suffix;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const KEYWORD = 'text-pink-400';
const TYPE = 'text-sky-400';
const CONTROL = 'text-purple-400';
const FUNCTION = 'text-emerald-300';
const LITERAL = 'text-amber-200';
const PLAIN = 'text-emerald-100/80';

@Component({
  imports: [RouterLink, Button],
  selector: 'app-hero',
  styleUrl: './hero.css',
  templateUrl: './hero.html',
})
export class Hero {
  @ViewChild('fog') vantaRef!: ElementRef<HTMLDivElement>;
  private vantaEffect: unknown;

  private readonly destroyRef = inject(DestroyRef);

  private readonly stats: HeroStat[] = [
    { target: 120, decimals: 0, suffix: '+', durationMs: 1200, label: 'Održanih časova' },
    { target: 9.5, decimals: 1, suffix: '', durationMs: 2600, label: 'Prosečna ocena' },
    { target: 15, decimals: 0, suffix: '+', durationMs: 1900, label: 'Seminarskih radova' },
  ];

  private readonly elapsedMs = signal(0);

  readonly displayStats = computed(() => {
    const elapsed = this.elapsedMs();

    return this.stats.map((stat) => {
      const progress = Math.min(elapsed / stat.durationMs, 1);

      return {
        label: stat.label,
        final: formatStat(stat, stat.target),
        current: formatStat(stat, stat.target * easeOutCubic(progress)),
      };
    });
  });

  readonly codeLines: CodeToken[][] = [
    [
      { text: '#include ', color: KEYWORD },
      { text: '<stdio.h>', color: LITERAL },
    ],
    [
      { text: '#include ', color: KEYWORD },
      { text: '<stdbool.h>', color: LITERAL },
    ],
    [],
    [
      { text: 'int ', color: TYPE },
      { text: 'main ', color: FUNCTION },
      { text: '() {', color: PLAIN },
    ],
    [
      { text: '    bool ', color: TYPE },
      { text: 'ucis = ', color: PLAIN },
      { text: 'true', color: LITERAL },
      { text: ';', color: PLAIN },
    ],
    [
      { text: '    if ', color: CONTROL },
      { text: '(ucis) {', color: PLAIN },
    ],
    [
      { text: '        printf', color: FUNCTION },
      { text: '(', color: PLAIN },
      { text: '"Sve je moguće!\\n"', color: LITERAL },
      { text: ');', color: PLAIN },
    ],
    [
      { text: '        printf', color: FUNCTION },
      { text: '(', color: PLAIN },
      { text: '"Savladaj IT gradivo.\\n"', color: LITERAL },
      { text: ');', color: PLAIN },
    ],
    [{ text: '    }', color: PLAIN }],
    [
      { text: '    return ', color: CONTROL },
      { text: '0', color: LITERAL },
      { text: ';', color: PLAIN },
    ],
    [{ text: '}', color: PLAIN }],
  ];

  constructor() {
    THREE.ColorManagement.enabled = false;

    afterNextRender(() => {
      this.vantaEffect = FOG({
        el: this.vantaRef.nativeElement,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x10b981,
        midtoneColor: 0x065f46,
        lowlightColor: 0x064e3b,
        baseColor: 0x064e3b,
        blurFactor: 0.2,
        speed: 0.5,
        zoom: 1.0,
      });

      this.startCounters();
    });
  }

  private startCounters(): void {
    const totalMs = Math.max(...this.stats.map((stat) => stat.durationMs));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.elapsedMs.set(totalMs);
      return;
    }

    let frameId = 0;
    let startedAt: number | undefined;

    const tick = (now: number) => {
      startedAt ??= now;
      const elapsed = Math.min(now - startedAt, totalMs);
      this.elapsedMs.set(elapsed);

      if (elapsed < totalMs) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(frameId));
  }

  
}
