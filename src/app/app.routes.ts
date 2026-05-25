import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then((m) => m.authRoutes)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then((m) => m.dashboardRoutes)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./features/transactions/transactions.routes')
          .then((m) => m.transactionRoutes)
      },
      {
        path: 'budgets',
        loadChildren: () => import('./features/budgets/budgets.routes')
          .then((m) => m.budgetRoutes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes')
          .then((m) => m.reportRoutes)
      },
      {
        path: 'recurring',
        loadChildren: () => import('./features/recurring-list/recurring.routes')
          .then(m => m.recurringRoutes)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes')
          .then(m => m.settingsRoutes)
      },
      {
        path: 'savings',
        loadChildren: () => import('./features/savings/savings.routes')
          .then(m => m.savingsRoutes)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
