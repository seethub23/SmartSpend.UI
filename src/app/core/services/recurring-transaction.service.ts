import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface RecurringTransaction {
  recurringId: number;
  categoryName: string;
  type: string;
  amount: number;
  paymentMethod: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  isActive: boolean;
}

export interface AddRecurringTransaction {
  categoryId: number;
  amount: number;
  type: string;
  paymentMethod: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecurringTransactionService {

  constructor(private apiService: ApiService) { }

  getAll(): Observable<RecurringTransaction[]> {
    return this.apiService.get<RecurringTransaction[]>(
      'recurringtransactions');
  }

  add(dto: AddRecurringTransaction): Observable<RecurringTransaction> {
    return this.apiService.post<RecurringTransaction>(
      'recurringtransactions', dto);
  }

  toggleActive(id: number): Observable<void> {
    return this.apiService.put<void>(
      `recurringtransactions/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`recurringtransactions/${id}`);
  }
}