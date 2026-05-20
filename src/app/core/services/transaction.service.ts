import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AddTransaction, Transaction } from '../models/transaction.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiService = inject(ApiService);

  getAll(): Observable<Transaction[]> {
    return this.apiService.get<Transaction[]>('transactions');
  }

  getById(id: number): Observable<Transaction> {
    return this.apiService.get<Transaction>(`transactions/${id}`);
  }

  add(dto: AddTransaction): Observable<Transaction> {
    return this.apiService.post<Transaction>('transactions', dto);
  }

  update(id: number, dto: AddTransaction): Observable<Transaction> {
    return this.apiService.put<Transaction>(`transactions/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`transactions/${id}`);
  }
}
