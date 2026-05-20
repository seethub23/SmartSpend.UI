import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Category } from '../models/category.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiService = inject(ApiService);

  getAll(): Observable<Category[]> {
    return this.apiService.get<Category[]>('categories');
  }

  getByType(type: string): Observable<Category[]> {
    return this.apiService.get<Category[]>(`categories/${type}`);
  }
}
