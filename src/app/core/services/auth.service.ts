import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);

  register(data: unknown): Observable<string> {
    return this.apiService.post<string>('auth/register', data).pipe(
      tap((token) => {
        this.setToken(token);
      })
    );
  }

  login(data: unknown): Observable<string> {
    return this.apiService.post<string>('auth/login', data).pipe(
      tap((token) => {
        this.setToken(token);
      })
    );
  }

  logout(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem('token', token);
  }
}
