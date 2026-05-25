import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  readonly isOpen = input(true);

  protected readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Transactions', icon: '💸', route: '/transactions' },
    { label: 'Budgets', icon: '🎯', route: '/budgets' },
    { label: 'Reports', icon: '📈', route: '/reports' },
    { label: 'Savings', icon: '🏦', route: '/savings' },
    { label: 'Recurring', icon: '🔄', route: '/recurring' },
    { label: 'Settings', icon: '⚙️', route: '/settings' },
  ];

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/auth/login']);
  }
}
