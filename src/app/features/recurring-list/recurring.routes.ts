import { Routes } from '@angular/router';

export const recurringRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./recurring-list')
      .then(m => m.RecurringListComponent)
  }
];