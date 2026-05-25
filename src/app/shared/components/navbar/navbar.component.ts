import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentDate = new Date();
  showNotifications = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.loadUnreadCount();
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (data) => this.unreadCount.set(data.count)
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notificationService.getAll().subscribe({
      next: (data) => this.notifications.set(data)
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(notifications =>
          notifications.map(n =>
            n.notificationId === id ? { ...n, isRead: true } : n
          )
        );
        this.unreadCount.update(count => Math.max(0, count - 1));
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(notifications =>
          notifications.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      }
    });
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}