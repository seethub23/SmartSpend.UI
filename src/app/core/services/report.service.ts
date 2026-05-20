import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CategoryWiseSpending, DashboardSummary, MonthlyTrend } from '../models/report.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiService = inject(ApiService);

  getDashboardSummary(month: number, year: number): Observable<DashboardSummary> {
    return this.apiService.get<DashboardSummary>(`reports/dashboard-summary?month=${month}&year=${year}`);
  }

  getCategoryWiseSpending(month: number, year: number): Observable<CategoryWiseSpending[]> {
    return this.apiService.get<CategoryWiseSpending[]>(`reports/category-wise-spending?month=${month}&year=${year}`);
  }

  getMonthlyTrends(year: number): Observable<MonthlyTrend[]> {
    return this.apiService.get<MonthlyTrend[]>(`reports/monthly-trends?year=${year}`);
  }
}
