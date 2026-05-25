import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Notification {
  notificationId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private apiService: ApiService) { }

  getAll(): Observable<Notification[]> {
    return this.apiService.get<Notification[]>('notifications');
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.apiService.get<{ count: number }>('notifications/unread-count');
  }

  markAsRead(id: number): Observable<void> {
    return this.apiService.put<void>(`notifications/${id}/mark-read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.apiService.put<void>('notifications/mark-all-read', {});
  }
}