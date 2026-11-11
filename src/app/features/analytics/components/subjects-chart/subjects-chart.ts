import { Component, computed, input, output } from '@angular/core';
import { SubjectChart } from '@features/analytics/models/subject-chart';
import { provideIcons } from '@ng-icons/core';
import { faSolidCalendar } from '@ng-icons/font-awesome/solid';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  imports: [NgApexchartsModule, FilterMenu],
  providers: [provideIcons({ faSolidCalendar })],
  selector: 'app-subjects-chart',
  styleUrl: './subjects-chart.css',
  templateUrl: './subjects-chart.html',
})
export class SubjectsChart {
  data = input.required<SubjectChart[] | undefined>();
  availableYears = input<number[]>();
  selectedYear = input<number>();
  selectedYearOutput = output<number>();

  availableYearsOptions = computed(() =>
    Object.fromEntries(
      this.availableYears()?.map((year) => [year.toString(), year.toString()]) ?? [],
    ),
  );

  selectedYearOptions = computed(() => {
    const year = this.selectedYear() ?? this.availableYears()?.[0];
    return year ? [year.toString()] : [];
  });

  onYearChange(years: string[]) {
    const year = years.at(-1);
    if (year) this.selectedYearOutput.emit(Number(year));
  }

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
    if (!data) return {};

    const labels = data.map((item) => item.subjectName);
    const series = data.map((item) => item.numberOfClasses);

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
