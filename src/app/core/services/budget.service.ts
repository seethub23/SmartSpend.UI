import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AddBudget, Budget } from '../models/budget.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly apiService = inject(ApiService);

  getAll(month: number, year: number): Observable<Budget[]> {
    return this.apiService.get<Budget[]>(`budgets?month=${month}&year=${year}`);
  }

  add(dto: AddBudget): Observable<Budget> {
    return this.apiService.post<Budget>('budgets', dto);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`budgets/${id}`);
  }
}
