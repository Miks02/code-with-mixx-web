import { Component, computed, input, output } from '@angular/core';
import { FinanceChart as FinanceChartModel } from '@features/analytics/models/finance-chart';
import { provideIcons } from '@ng-icons/core';
import { faSolidCalendar } from '@ng-icons/font-awesome/solid';
import { FilterMenu } from '@shared/components/filter-menu/filter-menu';
import { ApexOptions } from 'apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  imports: [NgApexchartsModule, FilterMenu],
  providers: [provideIcons({ faSolidCalendar })],
  selector: 'app-finance-chart',
  styleUrl: './finance-chart.css',
  templateUrl: './finance-chart.html',
})
export class FinanceChart {
  data = input.required<FinanceChartModel[] | undefined>();
  availableYears = input<number[]>();
  selectedYear = input<number>();
  selectedYearOutput = output<number>();

  availableYearsOptions = computed(() =>
    Object.fromEntries(
      this.availableYears()?.map((year) => [year.toString(), year.toString()]) ?? [],
    ),
  );

  selectedYearOptions = computed(() => {
    const year = this.selectedYear() ?? this.availableYears()?.at(-1);
    return year ? [year.toString()] : [];
  });

  onYearChange(years: string[]) {
    const year = years.at(-1);
    if (year) this.selectedYearOutput.emit(Number(year));
  }

  private monthlyData = computed(() => {
    const data = this.data() ?? [];
    return Array.from(
      { length: 12 },
      (_, i) =>
        data.find((item) => item.month === i + 1) ?? { month: i + 1, revenue: 0, students: 0 },
    );
  });

  chartOptions = computed<ApexOptions>(() => {
    const originalData = this.data() ?? [];
    const data = this.monthlyData();

    return {
      series: [
        {
          name: 'Prihod',
          type: 'area',
          data: data.map(d => d.revenue),
        },
        {
          name: 'Broj studenata',
          type: 'line',
          data: data.map(d => d.students),
        },
      ],
      chart: {
        type: 'line',
        width: '100%',
        height: 400,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: 'transparent',
      },
      responsive: [
        {
          series: [
            { name: 'Prihod', type: 'area', data: originalData.map(d => d.revenue) },
            { name: 'Broj studenata', type: 'line', data: originalData.map(d => d.students) },
          ],
          breakpoint: 600,
          options: {
            chart: { height: 350 },
            legend: { position: 'bottom' },
          },
        },
      ],
      colors: ['#10b981', '#f59e0b'],
      stroke: {
        curve: 'smooth',
        width: [3, 3],
        dashArray: [0, 4],
      },
      fill: {
        type: ['gradient', 'solid'],
        gradient: {
          shadeIntensity: 0,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 100],
        },
      },
      markers: {
        size: [0, 4],
        hover: { size: 5 },
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        labels: { colors: 'lightgray' },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number, opts) => {
            const isIncome = opts?.seriesIndex === 0;
            return isIncome ? `${val.toLocaleString('sr-RS')} RSD` : `${val} studenata`;
          },
        },
      },
      grid: {
        borderColor: '#a7f3d0',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'Maj',
          'Jun',
          'Jul',
          'Avg',
          'Sep',
          'Okt',
          'Nov',
          'Dec',
        ],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#10b981' } },
      },
      yaxis: [
        {
          labels: {
            style: { colors: '#10b981' },
            formatter: (val: number) => `${val}`,
          },
        },
        {
          opposite: true,
          labels: {
            style: { colors: '#f59e0b' },
            formatter: (val: number) => `${val}`,
          },
        },
      ],
    };
  });
}
