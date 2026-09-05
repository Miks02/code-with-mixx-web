import { Component, computed, signal } from '@angular/core';
import { FinanceChart as FinanceChartModel } from '../../models/finance-chart';
import { ApexOptions } from 'apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  imports: [NgApexchartsModule],
  selector: 'app-finance-chart',
  styleUrl: './finance-chart.css',
  templateUrl: './finance-chart.html',
})
export class FinanceChart {
  data = signal<FinanceChartModel>({
    selectedYear: null,
    incomeByMonth: [1200, 0, 1800, 2200, 3100, 2600, 0, 0, 4200, 3800, 2900, 5400],
    studentsCountByMonth: [3, 0, 4, 6, 8, 5, 0, 0, 9, 7, 6, 12],
  });
  chartOptions = computed<ApexOptions>(() => {
    const data = this.data();

    return {
      series: [
        {
          name: 'Prihod',
          type: 'area',
          data: data.incomeByMonth,
        },
        {
          name: 'Broj studenata',
          type: 'line',
          data: data.studentsCountByMonth,
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
