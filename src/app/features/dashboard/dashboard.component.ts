import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent
} from 'ng-apexcharts';
import { catchError, forkJoin, of } from 'rxjs';

import { CategoryWiseSpending, DashboardSummary, MonthlyTrend } from '../../core/models/report.model';
import { Transaction } from '../../core/models/transaction.model';
import { ReportService } from '../../core/services/report.service';
import { TransactionService } from '../../core/services/transaction.service';

interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  colors: string[];
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
}

interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  title: ApexTitleSubtitle;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly transactionService = inject(TransactionService);

  protected readonly currentMonth = new Date().getMonth() + 1;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly monthLabel = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(this.currentYear, this.currentMonth - 1));

  protected readonly totalIncome = signal(0);
  protected readonly totalExpense = signal(0);
  protected readonly totalSavings = signal(0);
  protected readonly totalTransactions = signal(0);
  protected readonly recentTransactions = signal<Transaction[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');

  protected readonly hasTransactions = computed(() => this.recentTransactions().length > 0);

  protected readonly barChartOptions = signal<BarChartOptions>({
    series: [
      { name: 'Income', data: [] },
      { name: 'Expense', data: [] }
    ],
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    colors: ['#245c73', '#b4232f'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    title: { text: 'Income vs Expense' }
  });

  protected readonly pieChartOptions = signal<PieChartOptions>({
    series: [],
    chart: {
      type: 'pie',
      height: 300
    },
    labels: [],
    colors: ['#245c73', '#b4232f', '#b7791f', '#2f855a', '#2b6cb0', '#9f4c7c'],
    title: { text: 'Spending by Category' }
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      summary: this.reportService.getDashboardSummary(this.currentMonth, this.currentYear).pipe(
        catchError(() => of<DashboardSummary>({ totalIncome: 0, totalExpense: 0, totalSavings: 0 }))
      ),
      categorySpending: this.reportService.getCategoryWiseSpending(this.currentMonth, this.currentYear).pipe(
        catchError(() => of<CategoryWiseSpending[]>([]))
      ),
      monthlyTrends: this.reportService.getMonthlyTrends(this.currentYear).pipe(
        catchError(() => of<MonthlyTrend[]>([]))
      ),
      transactions: this.transactionService.getAll().pipe(
        catchError(() => of<Transaction[]>([]))
      )
    }).subscribe({
      next: ({ summary, categorySpending, monthlyTrends, transactions }) => {
        this.totalIncome.set(summary.totalIncome);
        this.totalExpense.set(summary.totalExpense);
        this.totalSavings.set(summary.totalSavings);
        this.updatePieChart(categorySpending);
        this.updateBarChart(monthlyTrends);
        this.recentTransactions.set(transactions.slice(0, 5));
        this.totalTransactions.set(transactions.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('Dashboard data could not be loaded.');
        this.isLoading.set(false);
      }
    });
  }

  protected getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Morning';
    }

    if (hour < 17) {
      return 'Afternoon';
    }

    return 'Evening';
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  private updatePieChart(data: CategoryWiseSpending[]): void {
    this.pieChartOptions.update((options) => ({
      ...options,
      series: data.map((item) => item.totalAmount),
      labels: data.map((item) => item.category)
    }));
  }

  private updateBarChart(data: MonthlyTrend[]): void {
    const incomeData = Array.from<number>({ length: 12 }).fill(0);
    const expenseData = Array.from<number>({ length: 12 }).fill(0);

    data.forEach((item) => {
      const monthIndex = item.month - 1;

      if (monthIndex < 0 || monthIndex > 11) {
        return;
      }

      if (item.type === 'Income') {
        incomeData[monthIndex] = item.totalAmount;
      }

      if (item.type === 'Expense') {
        expenseData[monthIndex] = item.totalAmount;
      }
    });

    this.barChartOptions.update((options) => ({
      ...options,
      series: [
        { name: 'Income', data: incomeData },
        { name: 'Expense', data: expenseData }
      ]
    }));
  }
}
