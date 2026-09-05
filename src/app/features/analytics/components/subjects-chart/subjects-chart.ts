import { Component, computed, signal, Signal } from '@angular/core';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  imports: [NgApexchartsModule],
  selector: 'app-subjects-chart',
  styleUrl: './subjects-chart.css',
  templateUrl: './subjects-chart.html',
})
export class SubjectsChart {
  data: Signal<Record<string, number>> = signal({
    'Praktikum primenjenog programiranja': 10,
    'Web programiranje': 20,
    'Napredne baze podataka': 2,
    'Programerski alati': 12,
    'Osnove C programiranja': 16,
  });

  private generateColors(count: number): string[] {
    const goldenAngle = 150.508;
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const hue = Math.round((i * goldenAngle) % 360);
      colors.push(`hsl(${hue}, 65%, 38%)`);
    }
    return colors;
  }

  chartOptions = computed<ApexOptions>(() => {
    const data = this.data();
    const labels = Object.keys(data);
    const series = Object.values(data);

    return {
      chart: {
        type: 'donut',
        width: '100%',
        height: 400,
        animations: {
          enabled: true,
          speed: 400,
          animateGradually: { enabled: true, delay: 100 },
        },
      },
      series,
      labels,
      colors: this.generateColors(labels.length),
      legend: {
        show: false,
        position: 'bottom',
        labels: { colors: 'white' },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: {
          colors: ['white'],
          fontSize: '13px',
          fontWeight: 600,
        },
        dropShadow: { enabled: false },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '13px',
                color: 'white',
              },
              value: {
                show: true,
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                formatter: (val: string) => val,
              },
              total: {
                show: true,
                label: 'Ukupno',
                fontSize: '13px',
                color: 'white',
                formatter: (w) =>
                  w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString(),
              },
            },
          },
        },
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        y: {
          formatter: (val: number) => `${val} časova`,
        },
      },
      states: {
        active: {
          filter: { type: 'none' },
        },
        hover: {
          filter: { type: 'darken', value: 0.95 },
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['white'],
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 300 },
            legend: { show: false },
          },
        },
      ],
    };
  });
}
