import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ReportService } from '../../core/services/report.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  // Summary cards
  totalIncome = 0;
  totalExpense = 0;
  totalSavings = 0;
  totalTransactions = 0;

  // Recent transactions
  recentTransactions: Transaction[] = [];

  // Bar chart -- Income vs Expense
  barChartOptions: any = {
    series: [
      { name: 'Income', data: [] },
      { name: 'Expense', data: [] }
    ],
    chart: { type: 'bar', height: 300 },
    colors: ['#667eea', '#ff6b6b'],
    xaxis: {
      categories: ['Jan','Feb','Mar','Apr','May',
                   'Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    },
    title: { text: 'Income vs Expense' }
  };

  // Pie chart -- Category wise spending
  pieChartOptions: any = {
    series: [],
    chart: { type: 'pie', height: 300 },
    labels: [],
    colors: ['#667eea','#ff6b6b','#ffd93d',
             '#6bcb77','#4d96ff','#ff6b9d'],
    title: { text: 'Spending by Category' }
  };

  isLoading = true;

  constructor(
    private reportService: ReportService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;

    // Load summary
    this.reportService.getDashboardSummary(
      this.currentMonth, this.currentYear).subscribe({
      next: (data: any) => {
        this.totalIncome = data.totalIncome;
        this.totalExpense = data.totalExpense;
        this.totalSavings = data.totalSavings;
      }
    });

    // Load category wise spending
    this.reportService.getCategoryWiseSpending(
      this.currentMonth, this.currentYear).subscribe({
      next: (data: any[]) => {
        this.pieChartOptions = {
          ...this.pieChartOptions,
          series: data.map(d => d.totalAmount),
          labels: data.map(d => d.category)
        };
      }
    });

    // Load monthly trends
    this.reportService.getMonthlyTrends(this.currentYear).subscribe({
      next: (data: any[]) => {
        const incomeData = Array(12).fill(0);
        const expenseData = Array(12).fill(0);

        data.forEach(d => {
          if (d.type === 'Income') incomeData[d.month - 1] = d.totalAmount;
          if (d.type === 'Expense') expenseData[d.month - 1] = d.totalAmount;
        });

        this.barChartOptions = {
          ...this.barChartOptions,
          series: [
            { name: 'Income', data: incomeData },
            { name: 'Expense', data: expenseData }
          ]
        };
      }
    });

    // Load recent transactions
    this.transactionService.getAll().subscribe({
      next: (data: Transaction[]) => {
        this.recentTransactions = data.slice(0, 5);
        this.totalTransactions = data.length;
        this.isLoading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
}