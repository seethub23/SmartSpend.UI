import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent
} from 'ng-apexcharts';
import { CategoryWiseSpending, DashboardSummary, MonthlyTrend } from '../../../core/models/report.model';
import { ReportService } from '../../../core/services/report.service';

interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
}

interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
}

interface LineChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  stroke: ApexStroke;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
}

@Component({
  selector: 'app-reports',
  imports: [DecimalPipe, FormsModule, ChartComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  isLoading = signal(true);

  // Summary
  totalIncome = signal(0);
  totalExpense = signal(0);
  totalSavings = signal(0);

  // Bar Chart
  barChartOptions = signal<BarChartOptions>({
    series: [
      { name: 'Income', data: Array(12).fill(0) },
      { name: 'Expense', data: Array(12).fill(0) }
    ],
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    colors: ['#667eea', '#ff6b6b'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    xaxis: {
      categories: ['Jan','Feb','Mar','Apr','May','Jun',
                   'Jul','Aug','Sep','Oct','Nov','Dec']
    },
    legend: { position: 'top' },
    title: { text: 'Monthly Income vs Expense' }
  });

  // Pie Chart
  pieChartOptions = signal<PieChartOptions>({
    series: [],
    chart: { type: 'donut', height: 350 },
    labels: [],
    colors: ['#667eea','#ff6b6b','#ffd93d',
             '#6bcb77','#4d96ff','#ff6b9d'],
    legend: { position: 'bottom' },
    title: { text: 'Spending by Category' }
  });

  // Line Chart
  lineChartOptions = signal<LineChartOptions>({
    series: [{ name: 'Savings', data: Array(12).fill(0) }],
    chart: { type: 'line', height: 300, toolbar: { show: false } },
    colors: ['#43a047'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 5 },
    xaxis: {
      categories: ['Jan','Feb','Mar','Apr','May','Jun',
                   'Jul','Aug','Sep','Oct','Nov','Dec']
    },
    title: { text: 'Monthly Savings Trend' }
  });

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading.set(true);

    // Dashboard summary
    this.reportService.getDashboardSummary(
      this.currentMonth, this.currentYear).subscribe({
      next: (data: DashboardSummary) => {
        this.totalIncome.set(data.totalIncome);
        this.totalExpense.set(data.totalExpense);
        this.totalSavings.set(data.totalSavings);
      }
    });

    // Category wise spending -- Pie chart
    this.reportService.getCategoryWiseSpending(
      this.currentMonth, this.currentYear).subscribe({
      next: (data: CategoryWiseSpending[]) => {
        this.pieChartOptions.set({
          ...this.pieChartOptions(),
          series: data.map(d => d.totalAmount),
          labels: data.map(d => d.category)
        });
      }
    });

    // Monthly trends -- Bar + Line chart
    this.reportService.getMonthlyTrends(this.currentYear).subscribe({
      next: (data: MonthlyTrend[]) => {
        const incomeData = Array.from<number>({ length: 12 }).fill(0);
        const expenseData = Array.from<number>({ length: 12 }).fill(0);
        const savingsData = Array.from<number>({ length: 12 }).fill(0);

        data.forEach(d => {
          if (d.type === 'Income') incomeData[d.month - 1] = d.totalAmount;
          if (d.type === 'Expense') expenseData[d.month - 1] = d.totalAmount;
        });

        // Calculate savings per month
        for (let i = 0; i < 12; i++) {
          savingsData[i] = incomeData[i] - expenseData[i];
        }

        this.barChartOptions.set({
          ...this.barChartOptions(),
          series: [
            { name: 'Income', data: incomeData },
            { name: 'Expense', data: expenseData }
          ]
        });

        this.lineChartOptions.set({
          ...this.lineChartOptions(),
          series: [{ name: 'Savings', data: savingsData }]
        });

        this.isLoading.set(false);
      }
    });
  }

  onMonthChange() {
    this.loadReports();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected readonly Math = Math;
}
