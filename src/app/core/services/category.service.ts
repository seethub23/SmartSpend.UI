import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category, AddCategory } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private apiService: ApiService) { }

  getAll(): Observable<Category[]> {
    return this.apiService.get<Category[]>('categories');
  }

  getByType(type: string): Observable<Category[]> {
    return this.apiService.get<Category[]>(`categories/${type}`);
  }

  add(dto: AddCategory): Observable<Category> {
    return this.apiService.post<Category>('categories', dto);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`categories/${id}`);
  }
}